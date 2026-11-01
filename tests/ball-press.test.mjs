import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
import {liveAdapter} from '../dist/live-adapters.js';
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function setup(id){
 const world={stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal};
 const input={target:null,sprint:false,vector:()=>({x:0,z:0})};
 const m=createMode({world,input,game:catalogue.find(g=>g.id===id),settings:{color:0xc05336},ui:{actions(){},status(){},context(){},note(){},sound(){},end(){}}});
 m.phase='play';m.age=1;m.cool=0;m.b.position.set(0,.12,.5);m.v.set(0,0,0);
 m.players.forEach((p,i)=>p.position.set(i?7+i:-4,0,i?7:0));
 m.players[1].position.set(0,0,0);m.players[1].rotation.y=0;
 if(id==='laski')m.possessor=m.players[1];else m.carrier=1;
 return m;
}
const owner=m=>'possessor'in m?m.possessor:m.players[m.carrier];
for(const id of ['fourcorners','laski','sulia']){
 test(`${id}: Press pursues physically, challenges and yields immediately to steering`,()=>{
  const m=setup(id),p=m.you,start=p.position.clone();
  m.input.target=new THREE.Vector3(-8,0,-8);m.action('press');assert.equal(m.input.target,null);
  assert.ok(m.actions.some(a=>a.id==='press'&&!a.charge));
  const v=m.pressInput(0,{x:0,z:0});assert.ok(v.x>.9);assert.equal(owner(m),m.players[1],'no remote steal');assert.ok(p.position.equals(start));
  // Freeze CPU intentions while exercising the same physical challenge at contact.
  p.position.set(0,0,-.6);m.pressInput(0,{x:0,z:0});assert.notEqual(owner(m),m.players[1]);
  assert.equal(owner(m),p,'a clean Press wins a controlled touch');assert.equal(p.userData.pressUntil,0,'pursuit stops in the winning frame');
  if(id==='laski')m.possessor=m.players[1];else m.carrier=1;
  m.action('press');assert.deepEqual(m.pressInput(0,{x:-1,z:0}),{x:-1,z:0});assert.equal(p.userData.pressUntil,0);
  m.action('press');m.age+=3.1;assert.deepEqual(m.pressInput(0,{x:0,z:0}),{x:0,z:0});
  m.world.clear();
 });
 test(`${id}: a local Press tap actually moves the player toward a loose ball`,()=>{
  const m=setup(id);if(id==='laski')m.possessor=null;else m.carrier=null;
  m.b.position.set(0,.12,0);m.action('press');const before=m.you.position.x;
  for(let frame=0;frame<12;frame++)m.tick(1/60,frame/60);
  assert.ok(m.you.position.x>before+.5);m.world.clear();
 });
 test(`${id}: friend-room Press moves only the requesting seat and can win possession`,()=>{
  const m=setup(id),all=id==='laski'?[...m.players,m.keeper]:m.players;
  const room={game:id,type:'live',players:all.map((_,i)=>({id:String(i),name:'Friend '+i})),state:{seat:0,scores:all.map(()=>0)}};
  const a=liveAdapter(m,room);m.update=a.update;
  m.you.position.set(-5,0,-5);m.players[2].position.set(-4,0,0);const start=m.players[2].position.clone(),idle=m.you.position.clone();
  assert.ok(a.controls(2).some(b=>b.id==='press'));
  a.action(2,{action:'press',x:0,z:0});assert.equal(owner(m),m.players[1]);
  for(let frame=0;frame<12;frame++)m.tick(1/60,frame/60);
  assert.ok(m.players[2].position.x>start.x+.5);assert.ok(m.you.position.equals(idle));
  m.players[2].position.set(0,0,-.6);m.b.position.set(0,.12,.5);m.cool=0;m.pressInput(2,{x:0,z:0});assert.equal(owner(m),m.players[2]);
  m.liveInputs[2]={x:-1,z:0,sprint:true};for(let f=0;f<24;f++){m.actors.filter(p=>p!==m.players[2]).forEach((p,i)=>p.position.set(7+i,0,-7));m.tick(1/60,1+f/60);assert.equal(owner(m),m.players[2]);assert.ok(m.b.position.distanceTo(m.players[2].position)<1.2);}assert.equal(m.players[2].userData.pressUntil,0);
  if(id==='laski')assert.ok(!a.controls(all.length-1).some(b=>b.id==='press'));
  m.world.clear();
 });
}
test('Four Corners Press respects the carrier shield and cannot restart during a serve',()=>{
 const m=setup('fourcorners');m.you.position.set(0,0,-.6);m.players[1].userData.shieldUntil=m.age+1;m.action('press');m.pressInput(0,{x:0,z:0});assert.equal(m.carrier,1);
 m.phase='serve';m.pressInput(0,{x:0,z:0});assert.equal(m.you.userData.pressUntil,0);assert.equal(m.press(0),false);m.world.clear();
});
test('Street Football Press stops when a teammate wins possession and clears old tap-to-move targets',()=>{
 const world={stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal};
 const m=createMode({world,input:{target:new THREE.Vector3(9,0,9),sprint:false,vector:()=>({x:0,z:0})},game:catalogue.find(g=>g.id==='football'),settings:{color:0xc05336},ui:{actions(){},status(){},note(){},sound(){},end(){}}});
 m.pause=0;m.kickoff=null;m.age=1;const p=m.teams[0][m.selected],rival=m.teams[1][0];p.position.set(-3,0,0);rival.position.set(0,0,0);m.possessor=rival;
 assert.equal(m.press(p),true);assert.equal(m.input.target,null);assert.ok(m.pressingInput(p,{x:0,z:0}).x>.9);
 m.possessor=m.teams[0].find(q=>q!==p);assert.deepEqual(m.pressingInput(p,{x:0,z:0}),{x:0,z:0});assert.equal(p.userData.pressUntil,0);world.clear();
});

for(const id of ['fourcorners','laski','sulia'])for(const dt of [1/30,1/60])test(`${id}: a Press win hands off to joystick dribbling at ${1/dt} fps`,()=>{
 const m=setup(id),p=m.you;p.position.set(0,0,-.6);m.action('press');m.pressInput(0,{x:0,z:0});assert.equal(owner(m),p);
 const start=p.position.clone();m.input.sprint=true;
 for(let frame=0;frame<1.5/dt;frame++){
  const angle=Math.floor(frame*dt/.3)*Math.PI/2;m.input.vector=()=>({x:Math.sin(angle),z:Math.cos(angle)});
  m.actors.filter(q=>q!==p).forEach((q,i)=>q.position.set(7+i,0,-7));m.tick(dt,frame*dt);
  assert.equal(owner(m),p,'steering must not release possession');assert.ok(m.b.position.distanceTo(p.position)<1.2);assert.equal(p.userData.pressUntil,0);
 }
 assert.ok(p.position.distanceTo(start)>.4);m.world.clear();
});
function footballSetup(goalSize){
 const world={stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal};
 const m=createMode({world,input:{target:null,sprint:false,vector:()=>({x:0,z:0})},game:catalogue.find(g=>g.id==='football'),settings:{color:0xc05336,goalSize},ui:{actions(){},status(){},context(){},note(){},sound(){},end(){}}});
 m.pause=0;m.kickoff=null;m.age=1;m.cool=0;const p=m.teams[0][m.selected],q=m.teams[1][0];
 m.actors.forEach((a,i)=>a.position.set(8+i,0,-7));p.position.set(0,0,-.6);q.position.set(0,0,0);q.rotation.y=0;m.b.position.set(0,.12,.5);m.possessor=q;m.velocity.set(0,0,0);return {m,p,q};
}
for(const size of ['small','big'])test(`Street Football ${size}: Press wins possession, steering keeps it, opponents can still tackle`,()=>{
 const {m,p,q}=footballSetup(size);m.press(p);assert.deepEqual(m.pressingInput(p,{x:0,z:0}),{x:0,z:0});assert.equal(m.possessor,p);assert.equal(p.userData.pressUntil,0);
 const start=p.position.clone();m.input.vector=()=>({x:1,z:0});m.input.sprint=true;
 for(let f=0;f<30;f++){m.actors.filter(a=>a!==p).forEach((a,i)=>a.position.set(8+i,0,-7));m.tick(1/60,f/60);assert.equal(m.possessor,p);assert.ok(m.b.position.distanceTo(p.position)<1.1);}
 assert.ok(p.position.x>start.x+1);q.position.copy(p.position).add(new THREE.Vector3(0,0,.8));q.rotation.y=Math.PI;q.userData.tackleCool=0;m.age+=1;assert.equal(m.tackle(q),true);assert.equal(m.possessor,null);m.world.clear();
});
test('Four Corners Press does not grant lasting immunity or override one-touch rules',()=>{
 const m=setup('fourcorners');m.you.position.set(0,0,-.6);m.action('press');m.pressInput(0,{x:0,z:0});assert.equal(m.carrier,0);
 m.age+=1;m.cool=0;m.players[1].position.set(0,0,.5);m.players[1].rotation.y=Math.PI;m.b.position.set(0,.12,0);assert.equal(m.tackle(1),true);assert.equal(m.carrier,null);
 m.oneTouch=true;m.lastTouch=0;assert.equal(m.press(0),false);m.world.clear();
});

test('Street Football friend-room Press hands possession and steering to the requesting seat',()=>{
 const {m,p,q}=footballSetup('big'),room={game:'football',type:'live',players:Array.from({length:m.actors.length},(_,i)=>({id:String(i),name:'Friend'})),state:{seat:0,scores:Array(m.actors.length).fill(0)}};
 const a=liveAdapter(m,room),seat=a.people.indexOf(p);m.update=a.update;m.possessor=q;m.pause=0;m.kickoff=null;
 a.action(seat,{action:'pass',x:0,z:0});m.tick(1/60,0);assert.equal(m.possessor,p);assert.equal(p.userData.pressUntil,0);
 m.liveInputs[seat]={x:1,z:0,sprint:true};const start=p.position.clone();
 for(let f=0;f<24;f++){m.actors.filter(o=>o!==p).forEach((o,i)=>o.position.set(8+i,0,-7));m.tick(1/60,f/60);assert.equal(m.possessor,p);assert.ok(m.b.position.distanceTo(p.position)<1.1);}
 assert.ok(p.position.x>start.x+1);m.world.clear();
});
