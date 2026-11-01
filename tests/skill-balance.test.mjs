import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
import {clearVenue} from '../dist/venues.js';
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function harness(id,settings={}){
 const world={stage:new THREE.Group(),scene:new THREE.Scene(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal},ends=[];
 const m=createMode({world,input:{target:null,sprint:false,vector:()=>({x:0,z:0})},ui:{actions(){},status(){},note(){},sound(){},end:r=>ends.push(r)},settings:{color:0xc05336,difficulty:'normal',...settings},game:catalogue.find(g=>g.id===id)});
 return {m,ends,close(){world.clear();clearVenue(world);}};
}
test('Alikoto and Kpitinge grade the same release consistently at 20, 30, 60 and 120 fps',()=>{
 for(const id of ['alikoto','kpitinge']){
  const outcomes=[];
  for(const release of id==='alikoto'?[.3,.4,.45,.55,.7,.85]:[-.55,-.15,.15,.45]){
   const results=[];
   for(const fps of [20,30,60,120]){
    const h=harness(id),m=h.m;
    if(id==='alikoto')m.power=release;else m.prop.rotation.z=release;
    m.action(id==='alikoto'?'strike':'throw');assert.equal(m.score,0);
    while(m.phase==='flight')m.tick(1/fps,m.age+1/fps);
    results.push(m.score);h.close();
   }
   assert.ok(results.every(score=>score===results[0]),`${id}: ${release} -> ${results}`);outcomes.push(results[0]);
  }
  assert.ok(outcomes.includes(0)&&outcomes.includes(1),id+' must reward good releases and reject poor ones');
 }
});
test('Alasa detects a seed crossing the hole on a slow frame, but rejects a sideways miss',()=>{
 for(const x of [0,.2]){
  const h=harness('alasa'),m=h.m;m.phase='rolling';m.seed.position.set(x,.06,-.1);m.v.set(0,0,-15);
  m.tick(.08,.08);assert.equal(m.scores[0],x===0?1:0);h.close();
 }
});
test('Alasa rolling distance and result do not depend on the device frame rate',()=>{
 const positions=[];
 for(const fps of [20,30,60,120]){
  const h=harness('alasa'),m=h.m;m.flick(.52,.12);
  for(let n=0;n<fps;n++)m.tick(1/fps,m.age+1/fps);
  assert.equal(m.scores[0],0);positions.push(m.seed.position.clone());h.close();
 }
 for(const p of positions)assert.ok(p.distanceTo(positions[0])<1e-9);
});
test('Mbobagor has three count-in beats, then misses matter and a clean pass recovers a stone',()=>{
 const h=harness('mbobagor'),m=h.m;
 for(let n=0;n<3;n++){m.time=m.period;m.update(0);assert.equal(m.piles[0],1);assert.equal(m.score,0);assert.equal(m.done,false);}
 m.time=m.period;m.update(0);assert.equal(m.piles[0],2);assert.equal(m.done,false);
 m.time=0;m.action('pass');m.time=m.period;m.update(0);assert.equal(m.piles[0],1);assert.equal(m.score,1);
 for(let n=0;n<2;n++){m.time=m.period;m.update(0);}assert.equal(m.done,true);assert.equal(h.ends[0].success,false);h.close();
});
test('CPU jump plans vary by attempt and make a single timed landing press',()=>{
 const plans=[],scores=[];
 for(const sample of [.05,.5,.95]){
  const h=harness('agawowa',{jumpPlayers:2,jumpOpponents:'cpu'}),m=h.m;m.turn=1;
  const random=Math.random;try{Math.random=()=>sample;m.prepare();}finally{Math.random=random;}
  plans.push([m.cpuJumpAt,m.cpuOpenAt,m.cpuBraceHeight]);
  let landPresses=0;const perform=m.perform.bind(m);m.perform=id=>{if(id==='land')landPresses++;perform(id);};
  for(let n=0;n<900&&m.phase!=='result';n++)m.tick(1/120,m.age+1/120);
  assert.equal(m.phase,'result');assert.equal(landPresses,1);assert.ok(m.scores[1]>0&&m.scores[1]<=100);scores.push(m.scores[1]);h.close();
 }
 assert.equal(new Set(plans.map(JSON.stringify)).size,3);assert.ok(new Set(scores).size>1);
});
test('Pempenaa records finishing behind another player as a loss rather than a win',()=>{
 const h=harness('pempenaa'),m=h.m;m.fold(2);m.fold(3);m.fold(0);m.fold(1);
 assert.equal(m.done,true);assert.equal(h.ends[0].success,false);assert.equal(m.score,3);h.close();
});
test('equal seed scores and shared positive jump scores report neutral draws',()=>{
 const seed=harness('alasa');seed.m.scores=[2,2];seed.m.attempts=[5,5];seed.m.phase='result';seed.m.time=2;seed.m.update(0);
 assert.equal(seed.ends[0].outcome,'draw');seed.close();
 const jump=harness('highjump',{jumpPlayers:2,jumpOpponents:'local'});jump.m.scores=[180,180];jump.m.turn=1;jump.m.round=2;jump.m.next();
 assert.equal(jump.ends[0].outcome,'draw');jump.close();
 const missed=harness('highjump',{jumpPlayers:2,jumpOpponents:'local'});missed.m.turn=1;missed.m.round=2;missed.m.next();
 assert.equal(missed.ends[0].success,false);assert.equal(missed.ends[0].outcome,'loss');missed.close();
});
