import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {rollingTouch} from '../dist/corner-tactics.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
import {liveAdapter} from '../dist/live-adapters.js';
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function mode(id,settings={}){return createMode({world:{stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal},input:{target:null,sprint:true,vector:()=>({x:0,z:1})},ui:{actions(){},status(){},note(){},sound(){},end(){}},settings:{color:0xc05336,...settings},game:catalogue.find(g=>g.id===id)});}
test('Four Corners sprint touches remain close through stops and sharp reversals at 15–120 fps',()=>{
 for(const dt of [1/15,1/30,1/60,1/120]){const p=new THREE.Group(),b=new THREE.Group(),v=new THREE.Vector3();p.userData.velocity=new THREE.Vector3();b.position.set(0,.12,.5);
  for(let frame=0;frame<8/dt;frame++){const time=frame*dt,angle=Math.floor(time/.3)*Math.PI*.75,speed=time%2>1.6?0:8;p.rotation.y=angle;p.userData.velocity.set(Math.sin(angle)*speed,0,Math.cos(angle)*speed);p.position.addScaledVector(p.userData.velocity,dt);
   assert.equal(rollingTouch(b,v,p,dt,time),true);assert.ok(b.position.distanceTo(p.position)<=1.06,`ball escaped at ${1/dt} fps, t=${time}`);
  }
 }
});
for(const id of ['football','laski','fourcorners','sulia','abedemu'])for(const online of [false,true])test(`${id}: sprint never triggers a shot (${online?'friends':'solo'})`,()=>{
 const m=mode(id);m.phase='play';m.pause=0;m.kickoff=null;m.cool=0;m.age=1;
 let p=m.teams?m.teams[0][m.selected]:m.you;p.position.set(0,0,0);m.b.position.set(0,.12,.5);(m.velocity||m.v).set(0,0,0);
 if('possessor'in m)m.possessor=p;else m.carrier=0;
 if(online){const players=id==='laski'?[...m.players,m.keeper]:id==='football'?[...m.teams[0],...m.teams[1],...m.keepers]:m.players;const a=liveAdapter(m,{game:id,type:'live',players:players.map((_,i)=>({id:String(i),name:'Friend'})),state:{seat:0,scores:players.map(()=>0)}});a.action(a.people.indexOf(p),{action:'sprint',x:0,z:1});}
 else m.action('sprint');
 assert.ok(!m.pendingKick,'sprint queued a shot');assert.ok(('possessor'in m?m.possessor:m.players[m.carrier])===p,'sprint released possession');assert.equal((m.velocity||m.v).length(),0);
 m.world.clear();
});

for(const [id,settings]of [['football',{goalSize:'small'}],['football',{goalSize:'big'}],['fourcorners',{}],['laski',{}],['sulia',{}],['abedemu',{}]])test(`${id} ${settings.goalSize||''}: uncontested sprint dribbling survives repeated direction changes`,()=>{
 for(const dt of [1/30,1/60]){
  const m=mode(id,settings),p=m.teams?m.teams[0][m.selected]:m.you;m.phase='play';m.pause=0;m.kickoff=null;m.cool=.3;m.age=1;
  p.position.set(0,0,0);p.rotation.y=0;m.b.position.set(0,.12,.5);(m.velocity||m.v).set(0,0,0);
  if('possessor'in m)m.possessor=p;else m.carrier=0;
  for(let frame=0;frame<3/dt;frame++){
   const angle=Math.floor(frame*dt/.3)*Math.PI/2;m.input.vector=()=>({x:Math.sin(angle),z:Math.cos(angle)});
   // Isolate sprint control from genuine opponent challenges.
   m.actors.filter(q=>q!==p).forEach((q,i)=>q.position.set(7+i,0,-7));
   m.tick(dt,frame*dt);
   assert.ok(('possessor'in m?m.possessor:m.players[m.carrier])===p,`lost possession on frame ${frame}`);
   assert.ok(m.b.position.distanceTo(p.position)<1.1,'ball should remain within a stride');
  }
  m.world.clear();
 }
});
