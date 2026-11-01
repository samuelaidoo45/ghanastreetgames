import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
import {difficultyEffects,difficultyProfile} from '../dist/difficulty.js';
import {enterGameFullscreen} from '../dist/display-mode.js';
import {chooseDame,chooseLudo,chooseOware} from '../dist/board-ai.js';
import {initialDame,dameMoves,moveDame,initialLudo,ludoLegal} from '../dist/board-rules.js';
import {initialOware,legalMoves} from '../dist/oware.js';
import {landingGrade} from '../dist/jump-games.js';
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function mode(id,difficulty){const world={stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal};return createMode({world,input:{target:null,sprint:false,vector:()=>({x:0,z:0})},ui:{actions(){},status(){},note(){},sound(){},end(){}},settings:{color:0xc05336,difficulty},game:catalogue.find(g=>g.id===id)});}
test('every game exposes documented difficulty and remains finite on Easy and Hard',()=>{
 for(const g of catalogue){assert.ok(difficultyEffects[g.id],g.id);for(const level of ['easy','hard']){const m=mode(g.id,level);for(let i=0;i<120&&!m.done;i++){if(i%30===0){const a=m.actions.find(a=>!a.disabled&&!a.hold);if(a)m.action(a.id);}m.tick(.02,i*.02);}m.world.stage.traverse(o=>assert.ok([o.position.x,o.position.y,o.position.z].every(Number.isFinite),`${g.id} ${level}`));m.world.clear();}}
});
test('Stay Easy provides a longer catch opportunity without awarding a catch automatically',()=>{const e=mode('stay','easy'),h=mode('stay','hard');for(const m of [e,h]){m.phase='rebound';m.action('ball');assert.equal(m.score,0);}assert.ok(e.catchWindow>h.catchWindow);});
test('jump difficulty changes the bar and accepts a wider feet-first tolerance on Easy',()=>{const e=mode('highjump','easy'),h=mode('highjump','hard');assert.ok(e.barHeight<h.barHeight);assert.ok(landingGrade(.5,true,1,1.1,-3,difficultyProfile('easy').window).feet);assert.equal(landingGrade(.5,true,1,1.1,-3,difficultyProfile('hard').window).feet,false);});
test('Numbers grants more response time on Easy',()=>{const e=mode('numbers','easy'),h=mode('numbers','hard');for(const m of [e,h]){m.phase='you';m.time=3;m.update(0,0);}assert.equal(e.done,false);assert.equal(h.done,true);});
test('Alikoto difficulty changes landing tolerance, never auto-awards a point',()=>{const e=mode('alikoto','easy'),h=mode('alikoto','hard');for(const m of [e,h]){m.phase='flight';m.prop.position.set(0,.002,0);m.prop.rotation.z=Math.acos(.92);m.v.set(0,-.1,0);m.angular=0;m.update(0);}assert.equal(e.score,1);assert.equal(h.score,0);});
test('board strategies always select legal moves and leave input states intact',()=>{for(const level of ['easy','normal','hard']){const o=initialOware(),d=initialDame(),l=initialLudo();l.die=6;for(const [s,select,legal] of [[o,chooseOware,legalMoves],[d,chooseDame,dameMoves],[l,chooseLudo,ludoLegal]]){const before=JSON.stringify(s),choice=select(s,level,()=>.7);assert.ok(legal(s).some(m=>JSON.stringify(m)===JSON.stringify(choice)));assert.equal(JSON.stringify(s),before);}}});
test('Hard Ludo prioritises capturing a rival over simply moving the leading token',()=>{const s=initialLudo();s.turn=1;s.die=2;s.tokens[1]=[10,0,-1,-1];s.tokens[0]=[28,-1,-1,-1];assert.equal(chooseLudo(s,'hard'),1);assert.equal(chooseLudo(s,'normal'),0);assert.equal(s.die,2);});
test('Hard Dame avoids an immediate recapture that a one-ply choice permits',()=>{const s=initialDame();s.pieces.fill(null);s.turn=1;s.pieces[22]={player:1,king:false};s.pieces[26]={player:1,king:false};s.pieces[44]={player:0,king:false};s.pieces[80]={player:0,king:false};const chosen=chooseDame(s,'hard');assert.ok(dameMoves(s).some(m=>m.from===chosen.from&&m.to===chosen.to));const next=moveDame(s,chosen.from,chosen.to);assert.equal(dameMoves(next).some(m=>m.capture===chosen.to),false);});
test('fullscreen request is synchronous before a loading await and idempotent',async()=>{let calls=0;const doc={body:{classList:{add(){}}},documentElement:{requestFullscreen(){calls++;return Promise.resolve();}}};const pending=enterGameFullscreen(doc);assert.equal(calls,1);assert.equal(await pending,true);doc.fullscreenElement={};await enterGameFullscreen(doc);assert.equal(calls,1);});
test('unsupported and denied fullscreen preserve full-window gameplay without throwing',async()=>{for(const root of [{},{requestFullscreen:()=>Promise.reject(Error('Denied'))}]){let filled=false;const doc={body:{classList:{add(){filled=true;}}},documentElement:root};assert.equal(await enterGameFullscreen(doc),false);assert.equal(filled,true);}});
