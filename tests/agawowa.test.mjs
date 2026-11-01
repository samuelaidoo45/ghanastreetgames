import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
import {backflipStyles,backflipPoints} from '../dist/agawowa.js';
import {roomSettings,multiplayerGame,seeded} from '../dist/multiplayer-games.js';
import {liveAdapter} from '../dist/live-adapters.js';
import {sceneCodec} from '../dist/live-codec.js';
import {animateJumpShape} from '../dist/jump-animation.js';
import {scoreCaps,practicePoints} from '../dist/points.js';
const id='agawowa-backflip';
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function harness(settings={}){const world={stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal},ends=[];const m=createMode({world,input:{target:null,sprint:false,vector:()=>({x:0,z:0})},ui:{actions(){},status(){},note(){},sound(){},end:r=>ends.push(r)},settings:{color:0xc05336,jumpPlayers:2,jumpOpponents:'local',...settings},game:catalogue.find(g=>g.id===id)});return{m,ends,close:()=>world.clear()};}
function attempt(m,style,{dt=1/120,openAt=5.8,land=true}={}){m.style=style;m.perform('flip');for(let i=0;i<600&&['load','air'].includes(m.phase);i++){if(!m.opened&&m.angle>=openAt)m.perform('open');if(land&&m.vy<0&&m.you.position.y<.5&&m.braceTime===null)m.perform('land');m.tick(dt,m.age+dt);}}
test('Beast Master preserves the existing ramp game; Agawowa is a separate game',()=>{const beast=catalogue.find(g=>g.id==='agawowa'),flip=catalogue.find(g=>g.id===id);assert.equal(beast.name,'Beast Master');assert.equal(flip.name,'Agawowa');assert.ok(beast.equipment.includes('inclined'));assert.ok(!flip.equipment.includes('block'));const h=harness();assert.equal(h.m.ramp.visible,false);assert.equal(h.m.posts.visible,false);assert.ok(h.m.actions.some(a=>a.id==='flip'));assert.ok(!h.m.actions.some(a=>a.id==='run'));h.close();});
for(let style=0;style<4;style++)for(const dt of [1/30,1/60,1/120])test(`${backflipStyles[style]} is a controllable backward flip at ${Math.round(1/dt)} Hz`,()=>{const h=harness();try{attempt(h.m,style,{dt});assert.equal(h.m.results[0][0].ok,true);assert.equal(h.m.styleSets[0].size,1);assert.ok(h.m.scores[0]>=108);assert.ok(h.m.you.position.z>-3.8&&h.m.you.position.z<-2.5);}finally{h.close();}});
test('failed landings score zero and do not unlock a style',()=>{const h=harness();try{attempt(h.m,0,{openAt:Infinity});assert.equal(h.m.scores[0],0);assert.equal(h.m.styleSets[0].size,0);assert.equal(h.m.results[0][0].ok,false);}finally{h.close();}});
test('a new landed style always outweighs repeating the same style for four turns',()=>{assert.equal(backflipPoints(false,true,1),0);assert.ok(backflipPoints(true,true,0)>4*backflipPoints(true,false,1));const h=harness({jumpPlayers:1});try{attempt(h.m,0);const first=h.m.scores[0];h.m.next();attempt(h.m,0);assert.ok(h.m.scores[0]-first<=20);assert.equal(h.m.styleSets[0].size,1);h.m.next();attempt(h.m,1);assert.equal(h.m.styleSets[0].size,2);}finally{h.close();}});
test('four alternating human turns each finish once, with variety deciding the winner',()=>{const h=harness();try{for(let round=0;round<4;round++){attempt(h.m,round);h.m.next();attempt(h.m,0);h.m.next();}assert.equal(h.ends.length,1);assert.equal(h.ends[0].success,true);assert.equal(h.m.styleSets[0].size,4);assert.equal(h.m.styleSets[1].size,1);assert.ok(h.m.score<=scoreCaps[id]);assert.ok(practicePoints(id,h.m.score,true)>25);}finally{h.close();}});
test('CPU performs the actual flip and landing rather than receiving an invented score',()=>{seeded(38,()=>{const h=harness({jumpOpponents:'cpu'});try{attempt(h.m,0);h.m.next();let airborne=false;for(let i=0;i<600&&!h.m.results[1].length;i++){h.m.tick(1/120,h.m.age+1/120);airborne ||= h.m.phase==='air'&&h.m.you.position.y>.5;}assert.ok(airborne);assert.equal(h.m.results[1].length,1);assert.ok(h.m.scores[1]>0);}finally{h.close();}});});
test('friend rooms accept only the active human and serialize backward rotation',()=>{const h=harness(roomSettings(id,2));try{const room={game:id,type:'turns',players:[{name:'Ama'},{name:'Kojo'}],state:{seat:1,scores:[0,0]}},a=liveAdapter(h.m,room);h.m.roomPlayers=room.players;assert.equal(multiplayerGame(id).type,'turns');assert.equal(h.m.count,1);assert.equal(h.m.isCPU(),false);a.action(0,{action:'flip',power:.7});assert.equal(h.m.phase,'ready');a.action(1,{action:'flip',power:.7});for(let i=0;i<40;i++)h.m.tick(1/60,i/60);assert.equal(h.m.phase,'air');assert.ok(h.m.you.userData.lean<0);const frame=sceneCodec(h.m).capture(true);assert.ok(frame.people[0][9]<0);}finally{h.close();}});
test('split pose opens opposite legs and backward rotation is distinct from a forward somersault',()=>{const root=new THREE.Group(),body=new THREE.Group();root.userData={body,lean:-Math.PI/2,limbs:Array.from({length:4},()=>new THREE.Group())};animateJumpShape(root,'backSplit');assert.ok(body.rotation.x<0);assert.ok(root.userData.limbs[2].rotation.x<0);assert.ok(root.userData.limbs[3].rotation.x>0);});

test('standing backflip loads and drives the arms before take-off and delays rotation until airborne',()=>{
 const h=harness(),m=h.m;try{
  m.perform('flip');assert.equal(m.phase,'load');assert.ok(m.actions.every(a=>a.disabled));
  const seen=new Set();for(let i=0;i<50&&m.phase!=='air';i++){m.tick(1/120,i/120);seen.add(m.you.userData.pose);assert.equal(m.you.position.y,0);}
  assert.ok(seen.has('backLoad'));assert.ok(seen.has('backDrive'));assert.equal(m.phase,'air');
  for(let i=0;i<12;i++)m.tick(1/120,m.age+1/120);
  assert.ok(m.you.position.y>.4);assert.equal(m.angle,0);assert.equal(m.you.userData.pose,'backSet');
  for(let i=0;i<16;i++)m.tick(1/120,m.age+1/120);
  assert.ok(m.angle>0);assert.ok(m.you.userData.lean<0);assert.equal(m.you.userData.pose,'backTuck');
 }finally{h.close();}
});
test('landings absorb impact before returning to standing, and record the result only once',()=>{
 const h=harness();try{attempt(h.m,0);assert.equal(h.m.you.userData.pose,'backLand');const score=h.m.score;
  for(let i=0;i<100;i++)h.m.tick(1/120,h.m.age+1/120);
  assert.equal(h.m.you.userData.pose,'idle');assert.equal(h.m.you.position.y,0);assert.equal(h.m.results[0].length,1);assert.equal(h.m.score,score);
 }finally{h.close();}
});
test('the shipped rig swings hands behind then overhead, and tucks hands near the knees',async()=>{
 const {athleteRig}=await import('./athlete-rig-fixture.mjs'),{animateAthlete}=await import('../dist/athletes.js');
 for(const pose of ['backLoad','backSet','backTuck']){
  const root=athleteRig();root.userData.lean=pose==='backLoad'?1:0;
  for(let i=0;i<100;i++)animateAthlete(root,i/60,0,pose);root.updateMatrixWorld(true);
  const point=name=>root.worldToLocal(root.userData.bones[name].getWorldPosition(new THREE.Vector3()));
  for(const side of ['l','r']){const hand=point('hand_'+side),shoulder=point('upperarm_'+side);
   if(pose==='backLoad')assert.ok(hand.z<shoulder.z-.25,'hands swing behind the body');
   if(pose==='backSet')assert.ok(hand.y>point('head').y+.15,'both hands reach above the head');
   if(pose==='backTuck'){assert.ok(point('calf_'+side).y>point('thigh_'+side).y+.1);assert.ok(hand.distanceTo(point('calf_'+side))<.25,'hands close to the tucked knees');}
  }
 }
});
test('backflip head travels behind the hips for any heading, with no drifting rotation after landing',async()=>{
 const {athleteRig}=await import('./athlete-rig-fixture.mjs'),{animateAthlete}=await import('../dist/athletes.js');
 for(const heading of [0,Math.PI/2,Math.PI]){
  const root=athleteRig();root.rotation.y=heading;root.userData.lean=-Math.PI/2;
  animateAthlete(root,0,0,'backLayout');root.updateMatrixWorld(true);
  const head=root.userData.bones.head.getWorldPosition(new THREE.Vector3()),hips=root.userData.bones.thigh_l.getWorldPosition(new THREE.Vector3()),forward=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));
  assert.ok(head.sub(hips).dot(forward)<-.6,'head must rotate backward, not forward');
  root.userData.lean=0;for(let i=1;i<120;i++)animateAthlete(root,i/60,0,'idle');assert.equal(root.userData.model.rotation.x,0);assert.equal(root.userData.model.position.z,0);
 }
});
