import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {FourCorners} from '../dist/four-corners.js';
import {catalogue} from '../dist/catalogue.js';
import {liveAdapter} from '../dist/live-adapters.js';
import {startLive} from '../cloudflare/live-room.js';

globalThis.document={createElement:()=>({width:512,height:128,getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function harness(settings={}){
 const world={stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal};
 const input={target:null,sprint:false,vector:()=>({x:0,z:0})},results=[];
 const m=new FourCorners({world,input,game:catalogue.find(g=>g.id==='fourcorners'),settings:{color:0xc05336,...settings},ui:{actions(){},status(){},context(){},note(){},sound(){},end(r){results.push(r);}}});
 m.phase='play';return {m,input,results,close:()=>world.clear()};
}
for(const seat of [0,1,2,3])test(`Four Corners seat ${seat} collects and dribbles the same physical ball`,()=>{
 const h=harness(),m=h.m;m.networked=true;m.b.position.copy(m.players[seat].position).add(new THREE.Vector3(.25,.12,0));m.v.set(0,0,0);m.cool=0;m.tick(1/60,0);assert.equal(m.carrier,seat);assert.equal(m.lastTouch,seat);
 for(let i=0;i<30;i++){m.players[seat].position.x+=.02;m.players[seat].userData.run=1;m.tick(1/60,i/60);assert.equal(m.carrier,seat);assert.ok(m.b.position.distanceTo(m.players[seat].position)<1);}
 assert.ok(Math.abs(m.b.rotation.x)+Math.abs(m.b.rotation.z)>1);h.close();
});
test('Four Corners high-speed shots deflect from an actual body without tunnelling or becoming a catch',()=>{
 const h=harness(),m=h.m;m.players[0].position.set(0,0,0);const before=new THREE.Vector3(-1,.2,0);m.b.position.set(1,.2,0);m.v.set(24,0,0);m.contactBall(before);assert.equal(m.carrier,null);assert.equal(m.lastTouch,0);assert.ok(m.v.x<0);assert.ok(m.b.position.x<0);h.close();
});
test('a placed shot can beat a central defender and score at different simulation rates',()=>{
 for(const dt of [1/30,1/60,1/120]){const h=harness(),m=h.m;m.networked=true;m.players[0].position.set(0,0,-4);m.players[3].position.set(0,0,-8.2);m.b.position.set(0,.12,-4.5);m.carrier=0;m.cool=0;
  assert.equal(m.kick(0,3,1),true);for(let t=0;t<1&&m.phase==='play';t+=dt)m.tick(dt,t);
  assert.equal(m.lives[3],2);assert.equal(m.goalsScored[0],1);assert.equal(m.score,1);h.close();}
});
test('tackles need range, face the ball and cannot repeat through a cooldown',()=>{
 const h=harness(),m=h.m;m.players[0].position.set(0,0,0);m.players[1].position.set(0,0,1);m.b.position.set(0,.12,.9);m.carrier=1;m.you.rotation.y=Math.PI;
 assert.equal(m.tackle(0),false);m.you.rotation.y=0;assert.equal(m.tackle(0),false);m.age=1;assert.equal(m.tackle(0),true);assert.equal(m.carrier,null);assert.ok(m.v.z>0);h.close();
});
test('a dodge briefly shields possession, costs energy and has a recovery period',()=>{
 const h=harness(),m=h.m;m.carrier=1;m.players[1].position.set(0,0,1);m.players[0].position.set(0,0,0);m.you.rotation.y=0;m.b.position.set(0,.12,.9);
 assert.equal(m.feint(1),true);assert.ok(m.players[1].userData.stamina<1);assert.equal(m.feint(1),false);assert.equal(m.tackle(0),false);assert.equal(m.carrier,1);m.age=2;assert.equal(m.feint(1),true);h.close();
});
test('idle human does not stop a bot contesting the ball, and only one bot presses',()=>{
 const h=harness(),m=h.m;m.b.position.set(-.2,.12,0);m.v.set(0,0,0);m.think();assert.equal(m.plans.slice(1).filter(p=>p.press).length,1);
 for(let t=0;t<4&&m.lastTouch<0;t+=1/60)m.tick(1/60,t);assert.ok(m.lastTouch>0);h.close();
});
test('opponents carry into an attack before shooting, instead of kicking every contact',()=>{
 const h=harness(),m=h.m;m.players[1].position.set(0,0,2);m.b.position.set(0,.12,1.5);m.players[1].rotation.y=Math.PI;m.takeBall(1);const start=m.players[1].position.clone();
 for(let i=0;i<20;i++)m.tick(1/60,i/60);assert.equal(m.carrier,1);assert.ok(m.players[1].position.distanceTo(start)>.2);
 let struck=false;for(let i=0;i<240&&!struck;i++){m.tick(1/60,i/60);struck=m.lastTouch===1&&m.carrier===null&&m.v.length()>8;}assert.ok(struck);h.close();
});
test('carrying never triggers the dead-ball timer and eliminated goals cannot be targeted',()=>{
 const h=harness(),m=h.m;m.networked=true;m.carrier=2;m.b.position.copy(m.players[2].position).add(new THREE.Vector3(0,.12,.4));m.time=200;m.stillTime=0;m.tick(.02,0);assert.equal(m.phase,'play');
 m.active[1]=false;m.active[3]=false;assert.equal(m.pickGoal(0),2);m.aim=1;assert.equal(m.selectTarget(0),2);assert.equal(m.kick(2,1),false);h.close();
});
test('one-touch rules still reject a second strike and disallow dribbling and dodge',()=>{
 const h=harness({cornersTouch:'one'}),m=h.m;m.networked=true;m.b.position.copy(m.you.position).setY(.12);m.v.set(0,0,0);m.tick(.01,0);assert.equal(m.carrier,null);assert.equal(m.feint(0),false);
 assert.equal(m.kick(0,1),true);m.cool=0;assert.equal(m.kick(0,2),false);h.close();
});
test('four human seats use the shared possession, tackle and skill rules without bots',()=>{
 const h=harness(),m=h.m,room={game:'fourcorners',type:'live',players:Array.from({length:4},(_,i)=>({id:String(i),name:'Friend '+i})),phase:'playing',startedAt:0};startLive(room);const a=liveAdapter(m,room);m.update=a.update;
 const positions=m.players.map(p=>p.position.clone());m.b.position.set(0,.12,0);m.v.set(0,0,0);for(let i=0;i<30;i++)m.tick(1/60,i/60);m.players.forEach((p,i)=>assert.ok(p.position.equals(positions[i])));
 m.b.position.copy(m.players[2].position).setY(.12);m.tick(1/60,1);assert.equal(m.carrier,2);a.action(2,{action:'feint',x:0,z:1});m.tick(.05,2);assert.ok(m.players[2].position.z>positions[2].z);m.cool=0;
 a.action(2,{action:'kick',power:.7,x:0,z:0});assert.equal(m.carrier,null);assert.equal(m.lastTouch,2);assert.ok(m.v.length()>10);assert.ok(a.controls(2).some(x=>x.id==='feint'));h.close();
});
