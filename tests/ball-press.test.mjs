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
  if(id==='sulia'){assert.equal(owner(m),p);m.pressInput(0,{x:0,z:0});assert.equal(p.userData.pressUntil,0);}
  else assert.ok(owner(m)==null,'tackle leaves a loose ball');
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
  m.players[2].position.set(0,0,-.6);m.b.position.set(0,.12,.5);m.cool=0;m.pressInput(2,{x:0,z:0});assert.notEqual(owner(m),m.players[1]);
  m.liveInputs[2]={x:-1,z:0,sprint:false};m.tick(1/60,1);assert.equal(m.players[2].userData.pressUntil,0);
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
