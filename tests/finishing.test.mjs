import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
import {finishAttempt} from '../dist/finishing.js';
import {stepBall} from '../dist/ball-physics.js';
import {crossedGoal,collideGoalFrames} from '../dist/football-physics.js';
import {liveAdapter} from '../dist/live-adapters.js';
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function mode(id,settings={}){return createMode({world:{stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal},input:{target:null,sprint:false,vector:()=>({x:0,z:0})},ui:{actions(){},status(){},note(){},sound(){},end(){}},settings:{color:0xc05336,...settings},game:catalogue.find(g=>g.id===id)});}
function seeded(fn){const original=Math.random;let seed=629;Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);try{return fn();}finally{Math.random=original;}}
function attempt(m,range,seat=0){
 const football=m.game.id==='football',corner=m.game.id==='fourcorners',p=football?m.teams[seat][0]:m.players[seat],goal=football?m.goalFrames[seat?0:1]:corner?m.goals[3]:m.goal;
 m.actors.forEach(a=>a.position.set(20,0,20));m.phase='play';m.pause=0;m.cool=0;m.kickoff=null;m.networked=true;
 m.b.position.copy(goal.center).addScaledVector(goal.normal,-range).setY(.12);p.position.copy(m.b.position).addScaledVector(goal.normal,-.45).setY(0);p.rotation.y=Math.atan2(goal.normal.x,goal.normal.z);p.userData.velocity?.set(0,0,0);p.userData.run=0;
 if(football){m.possessor=p;m.kick(p,{x:goal.center.x+goal.normal.x,z:goal.center.z+goal.normal.z},26,true);}
 else if(corner){m.carrier=seat;m.kick(seat,3,.8,false,0);}
 else{m.possessor=p;m.strike(seat,0,.8);}
 const v=football?m.velocity:m.v;
 for(let n=0;n<600;n++){const before=stepBall(m.b,v,1/120,{drag:m.surface.drag,bounce:m.surface.bounce}),post=collideGoalFrames(m.b,v,before,[goal]);if(!post&&crossedGoal(before,m.b.position,goal))return true;if(m.b.position.clone().sub(goal.center).dot(goal.normal)>.2)return false;if(v.length()<.1)return false;}
 return false;
}
for(const [id,goalSize] of [['fourcorners'],['football','small'],['football','big'],['laski']])for(const surface of ['dirt','concrete','grass'])test(`${id} ${goalSize||''} ${surface}: centre shots are substantially less reliable than close finishes`,()=>{
 const m=mode(id,{goalSize,pitchSurface:surface});try{seeded(()=>{
  const far=id==='football'?m.halfX:9;let closeGoals=0,farGoals=0;
  for(let i=0;i<100;i++){closeGoals+=attempt(m,3.8);farGoals+=attempt(m,far);}
  assert.ok(closeGoals>=90,`close: ${closeGoals}/100`);assert.ok(farGoals<=45,`centre: ${farGoals}/100`);assert.ok(farGoals<closeGoals*.5);
 });}finally{m.world.clear();}
});
test('defensive pressure and a rushed long shot reduce precision without silently rejecting goals',()=>{
 const goal={center:{x:0,z:-9},normal:{x:0,z:-1},width:2.5},args={origin:{x:0,z:0},target:{x:.6,z:-9.3},goal,speed:24,random:()=>.9};
 const clear=finishAttempt(args),pressed=finishAttempt({...args,pressure:1}),rushed=finishAttempt({...args,pace:8});
 assert.ok(pressed.target.x>clear.target.x);assert.ok(pressed.speed<clear.speed);assert.ok(rushed.target.x>clear.target.x);
 const close=finishAttempt({...args,origin:{x:0,z:-6}});assert.equal(close.target.x,.6);assert.equal(close.speed,24);
});
test('Four Corners CPU carries out of the centre before preparing a shot',()=>{
 const m=mode('fourcorners');try{m.phase='play';m.age=1;m.cool=0;m.carrier=1;m.players[1].position.set(0,0,0);m.b.position.set(0,.12,-.4);m.players[1].userData.carryTime=10;m.update(0);assert.equal(m.carrier,1);assert.equal(m.players[1].userData.shotAt,0);assert.ok(m.plans[1].target.length()>4);}finally{m.world.clear();}
});
test('Laski CPU keeps dribbling when still at the centre, even after a long possession',()=>{
 const m=mode('laski');try{m.phase='play';m.age=1;m.cool=0;m.possessor=m.players[1];m.players[1].position.set(0,0,0);m.b.position.set(0,.12,-.4);m.players[1].userData.carryTime=10;m.update(0);assert.equal(m.possessor,m.players[1]);assert.equal(m.v.length(),0);}finally{m.world.clear();}
});
test('street football CPU carries or passes from midfield and can shoot nearer goal',()=>{
 const m=mode('football',{teamSize:1,goalSize:'small'});try{seeded(()=>{
  m.pause=0;m.kickoff=null;m.cool=0;const cpu=m.teams[1][0];m.possessor=cpu;cpu.position.set(0,0,0);m.b.position.set(-.45,.12,0);m.you=m.teams[0][0];m.you.position.set(10,0,7);
  let shots=0;const kick=m.kick.bind(m);m.kick=(...a)=>{if(a[3])shots++;return kick(...a);};
  for(let i=0;i<20;i++)m.tick(1/60,i/60);assert.equal(shots,0);assert.equal(m.possessor,cpu);assert.ok(cpu.position.x<-.5);
  cpu.position.set(-m.halfX+3,0,0);m.b.position.set(cpu.position.x-.45,.12,0);
  for(let i=0;i<180&&shots===0;i++)m.tick(1/60,i/60);assert.ok(shots>0);
 });}finally{m.world.clear();}
});
test('friend-room street football shots use the same distance penalty for either team',()=>{
 const m=mode('football',{teamSize:1,goalSize:'small'});try{
  const people=[...m.teams[0],...m.teams[1],...m.keepers],a=liveAdapter(m,{game:'football',type:'live',players:people.map((_,i)=>({id:String(i),name:'Friend'})),state:{seat:0,scores:[0,0]}});m.pause=0;m.kickoff=null;
  for(const seat of [0,1]){const p=people[seat],direction=seat?-1:1;m.actors.forEach(q=>q.position.set(20,0,20));p.position.set(-direction*.45,0,0);m.b.position.set(0,.12,0);m.possessor=p;m.cool=0;seeded(()=>a.action(seat,{action:'shoot',power:1,z:0}));assert.equal(m.possessor,null);assert.ok(Math.hypot(m.velocity.x,m.velocity.z)<22);}
 }finally{m.world.clear();}
});
