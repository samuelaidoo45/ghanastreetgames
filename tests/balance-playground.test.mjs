import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {catalogue} from '../dist/catalogue.js';
import {chooseOware,chooseDame,chooseLudo} from '../dist/board-ai.js';
import {initialOware,legalMoves} from '../dist/oware.js';
import {initialDame,dameMoves,initialLudo,ludoLegal} from '../dist/board-rules.js';
const context={clearRect(){},strokeText(){},fillText(){}};
globalThis.document={createElement:()=>({width:512,height:128,getContext:()=>context})};
function mode(id){const ends=[],world={stage:new THREE.Group(),scene:new THREE.Scene(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal};const m=createMode({world,input:{target:null,sprint:false,vector:()=>({x:0,z:0})},ui:{actions(){},status(){},note(){},sound(){},end:r=>ends.push(r)},settings:{color:0xc05336,difficulty:'normal',opponent:'cpu'},game:catalogue.find(g=>g.id===id)});return {m,ends};}

test('board CPU victories are reported as human losses, never default wins',()=>{
 const o=mode('oware');o.m.state.pits.fill(0);o.m.state.pits[5]=1;o.m.state.scores=[0,25];o.m.choose(5);
 const d=mode('dame');d.m.state.pieces.fill(null);d.m.state.turn=1;for(const i of [44,86])d.m.state.pieces[i]={player:0,king:false};for(const i of [22,33])d.m.state.pieces[i]={player:1,king:false};d.m.selected=33;d.m.choose(55,true);
 const l=mode('ludo');l.m.state.tokens[1]=[57,57,57,56];l.m.state.turn=1;l.m.state.die=1;l.m.choose(3,true);
 const c=mode('counters');c.m.scores=[0,3];c.m.nextTurn();
 for(const h of [o,d,l,c]){assert.equal(h.ends.length,1,h.m.game.id);assert.equal(h.ends[0].success,false,h.m.game.id);assert.equal(h.ends[0].outcome,'loss');h.m.world.clear();}
});
test('board and Stay ties are neutral outcomes for difficulty calibration',()=>{
 const o=mode('oware');o.m.state.pits.fill(0);o.m.state.pits[5]=1;o.m.state.scores=[24,23];o.m.choose(5);
 const c=mode('counters');c.m.scores=[1,1];c.m.shots=23;c.m.nextTurn();
 const s=mode('stay');s.m.time=150;s.m.update(0,0);
 for(const h of [o,c,s]){assert.equal(h.ends.length,1,h.m.game.id);assert.equal(h.ends[0].outcome,'draw',h.m.game.id);h.m.world.clear();}
});
test('Stay CPU must react and open a catch window like the human thrower',()=>{
 const h=mode('stay'),m=h.m;m.throwerIndex=1;m.thrower=m.players[1];m.thrower.position.set(0,0,0);m.you.position.set(-8,0,8);m.players[2].position.set(2,0,0);m.phase='flight';m.b.position.set(.5,1,0);m.v.set(0,0,0);m.rebound(2);m.v.set(0,0,0);
 m.advanceBall(.01);assert.equal(m.throwerIndex,1);assert.equal(m.transfers[1],0,'nearby ball is not an automatic catch');
 m.age=1;m.update(0,1);assert.equal(m.throwerIndex,2);assert.equal(m.transfers[1],1);m.world.clear();
});
test('Stay human retrieval is not preempted by an instantaneous CPU kick',()=>{
 const h=mode('stay'),m=h.m;m.phase='loose';m.b.position.set(0,.13,0);m.you.position.set(-.7,0,0);m.players[1].position.set(.7,0,0);m.players.slice(2).forEach((p,i)=>p.position.set(7,0,i-3));m.v.set(0,0,0);m.update(.001,0);assert.equal(m.phase,'held');assert.equal(m.throwerIndex,0);assert.equal(m.players[1].userData.kick,undefined);m.world.clear();
});
test('Pampanaa loses its aim lock when sight is blocked or the target changes',()=>{
 const h=mode('pampanaa'),m=h.m;m.phase='play';m.you.position.set(-14,0,3);m.heading=Math.PI;m.players[1].position.set(-14,0,-2);m.players[1].rotation.y=0;m.players.slice(2).forEach(p=>p.position.set(14,0,14));const u=m.players[1].userData;u.aimTarget=2;u.alert=4;u.cool=0;m.update(.02);assert.equal(m.alive[0],true);assert.equal(u.aimTarget,0);assert.ok(u.alert<.03);
 m.solids.push({x:-14,z:.5,w:3,d:1}); // Use the real sight query before advancing: this wall breaks the lock.
 assert.equal(m.canSee(1,0),false);m.update(.02);assert.equal(u.alert,0);assert.equal(u.aimTarget,null);m.world.clear();
});
test('Tyre contact costs one life until the player clears the obstacle',()=>{
 const h=mode('tyre'),m=h.m;m.you.position.set(-2,0,-3.5);m.input.target={x:-2,z:-5};for(let i=0;i<240;i++)m.tick(1/60,i/60);assert.equal(m.lives,2);assert.equal(m.done,false);
 m.you.position.set(0,0,7);m.input.target=null;m.tick(.02,5);assert.equal(m.lastObstacle,null);m.world.clear();
});
test('Normal board planning varies equal choices, adapts only within legal moves, and never changes dice',()=>{
 const o=initialOware();assert.notEqual(chooseOware(o,'normal',()=>0),chooseOware(o,'normal',()=>.999));
 for(const balance of [-1,0,1])for(const r of [0,.2,.8,.999])for(const [s,choose,legal] of [[initialOware(),chooseOware,legalMoves],[initialDame(),chooseDame,dameMoves],[{...initialLudo(),die:6},chooseLudo,ludoLegal]]){const before=JSON.stringify(s),chosen=choose(s,'normal',()=>r,balance);assert.ok(legal(s).some(m=>JSON.stringify(m)===JSON.stringify(chosen)));assert.equal(JSON.stringify(s),before);}
 const l={...initialLudo(),turn:1,die:2,tokens:[[28,-1,-1,-1],[10,0,-1,-1]]};assert.equal(chooseLudo(l,'normal',()=>0,1),1);assert.equal(chooseLudo(l,'normal',()=>.9,1),0);assert.equal(l.die,2);
});
