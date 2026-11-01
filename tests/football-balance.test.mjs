import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function mode(id,settings={}){return createMode({world:{stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal},input:{target:null,sprint:false,vector:()=>({x:0,z:0})},ui:{actions(){},status(){},note(){},sound(){},end(){}},settings:{color:0xc05336,...settings},game:catalogue.find(g=>g.id===id)});}
function random(value,fn){const before=Math.random;try{Math.random=()=>value;return fn();}finally{Math.random=before;}}
function shot(m,i,networked){m.networked=networked;m.cool=0;m.phase='play';m.players[i].position.set(0,0,2);m.players[i].rotation.y=Math.PI;m.b.position.set(0,.12,1.5);m.v.set(0,0,0);if(m.game.id==='fourcorners'){m.carrier=i;assert.equal(m.kick(i,3,.6),true);}else if(m.game.id==='laski'){m.possessor=m.players[i];m.strike(i,-1.8,.6);}else{m.carrier=i;m.players[(i+1)%m.players.length].position.set(0,0,-2);assert.equal(m.poke(i,(i+1)%m.players.length,.4),true);}return m.v.clone();}
for(const id of ['fourcorners','laski','sulia'])test(id+': only computer shots have bounded placement variance',()=>{
 const m=mode(id);
 const first=random(.1,()=>shot(m,1,false)),second=random(.9,()=>shot(m,1,false));
 assert.ok(first.distanceTo(second)>.1,'computer aim must not always be perfect');
 assert.ok(first.distanceTo(second)<5,'placement errors must stay playable');
 assert.ok(Math.abs(first.length()-second.length())<.001,'misses change aim, not shot power');
 // Human/network shot 1 and human seat 0 must remain exactly as aimed.
 assert.ok(random(.1,()=>shot(m,1,true)).equals(random(.9,()=>shot(m,1,true))));
 assert.ok(random(.1,()=>shot(m,0,false)).equals(random(.9,()=>shot(m,0,false))));
 m.world.clear();
});
for(const id of ['laski','sulia'])test(id+': CPU tackle gives a brief opportunity to turn or shield',()=>{
 const m=mode(id);m.phase='play';m.cool=0;m.age=1;
 m.players.forEach((p,i)=>p.position.set(i?5+i:0,0,i?-6:0));
 m.you.rotation.y=0;m.players[1].position.set(0,0,1.04);m.b.position.set(0,.12,.48);
 if(id==='laski')m.possessor=m.you;else m.carrier=0;
 m.update(0);assert.equal(id==='laski'?m.possessor:m.players[m.carrier],m.you);
 assert.ok(m.players[1].userData.challengeReady>m.age);
 m.age+=.25;m.update(0);assert.equal(id==='laski'?m.possessor:m.players[m.carrier],m.players[1]);
 assert.ok(m.cool>0,'a successful tackle must leave a recovery period');m.world.clear();
});
test('street football difficulty affects the opponents, not the user’s own keeper',()=>{
 const easy=mode('football',{difficulty:'easy'}),hard=mode('football',{difficulty:'hard'});
 for(const m of [easy,hard]){m.kickoff=null;m.b.position.set(0,.14,0);random(.8,()=>m.kick(m.teams[0][0],{x:15,z:1},20,true));}
 assert.equal(easy.keepers[0].userData.reaction,hard.keepers[0].userData.reaction);
 assert.equal(easy.keepers[0].userData.readError,hard.keepers[0].userData.readError);
 assert.ok(easy.keepers[1].userData.reaction>hard.keepers[1].userData.reaction);
 assert.ok(easy.keepers[1].userData.readError>hard.keepers[1].userData.readError);
 easy.world.clear();hard.world.clear();
});
test('placed Normal penalties produce both real saves and goals, never a guaranteed result',()=>{
 const m=mode('penalties',{difficulty:'normal'}),original=Math.random;let seed=36,goals=0,saves=0;
 try{
  Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
  for(let i=0;i<80;i++){
   m.turn=0;m.prepare();m.launch(i%2?-2.1:2.1,.6,.65);m.strike();
   for(let n=0;n<240&&m.phase==='flight';n++)m.tick(1/120,m.age+1/120);
   assert.equal(m.phase,'result');if(m.history[0].at(-1))goals++;if(m.saved)saves++;
  }
 }finally{Math.random=original;m.world.clear();}
 assert.ok(goals>=20&&goals<=65,`placed shots scored ${goals}/80`);
 assert.ok(saves>=15,`keeper saved ${saves}/80`);
});
