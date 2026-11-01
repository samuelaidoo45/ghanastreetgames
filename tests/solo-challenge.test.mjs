import test from 'node:test';
import assert from 'node:assert/strict';
import {SoloChallenge,adaptiveSolo} from '../dist/solo-challenge.js';
import {difficultyProfile,levels,difficultyEffects} from '../dist/difficulty.js';
import {catalogue} from '../dist/catalogue.js';
import {roomSettings} from '../dist/multiplayer-games.js';
import {ampeOpponentFoot} from '../dist/ampe.js';
const ids=catalogue.map(g=>g.id);
function match(game='football',settings={}){return{game:{id:game},settings:{difficulty:'normal',opponent:'cpu',...settings},playerActions:3,age:30};}
function storage(){const data=new Map();return{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};}
test('each game has tuning and repeated solo outcomes adjust only its future Normal matches',()=>{
 const s=storage(),history=new SoloChallenge(ids,s),first=match();
 assert.equal(history.value('football',first.settings),0);
 const frozen=difficultyProfile('normal',history.value('football',first.settings));
 history.record(first,{success:false});history.record(first,{success:false});
 assert.equal(history.games.football.recent.length,1,'one result per match');
 history.record(match(),{success:false});assert.equal(history.value('football',first.settings),0);
 history.record(match(),{success:false});assert.equal(history.value('football',first.settings),-.16);
 assert.equal(frozen.speed,1,'a running match never changes');
 assert.equal(history.value('ampe',first.settings),0);
 assert.equal(new SoloChallenge(ids,s).value('football',first.settings),-.16);
 for(const id of ids){assert.ok(difficultyEffects[id],id);const h=new SoloChallenge(ids);for(let i=0;i<20;i++)h.record(match(id),{success:true});assert.ok(h.value(id,first.settings)<=1);}
});
test('steady losses and wins stay bounded between Easy and Hard; mixed results do not oscillate',()=>{
 const h=new SoloChallenge(ids);
 for(let i=0;i<30;i++)h.record(match(),{success:false});assert.equal(h.value('football',{difficulty:'normal'}),-1);
 for(let i=0;i<30;i++)h.record(match(),{success:true});assert.equal(h.value('football',{difficulty:'normal'}),1);
 for(const b of [-1,1]){const p=difficultyProfile('normal',b);assert.ok(p.speed>levels.easy.speed&&p.speed<levels.hard.speed);assert.ok(p.window<levels.easy.window&&p.window>levels.hard.window);}
 const mixed=new SoloChallenge(ids);for(let i=0;i<30;i++)mixed.record(match(),{success:i%2===0});assert.equal(mixed.value('football',{difficulty:'normal'}),0);
 assert.equal(difficultyProfile('easy',1),levels.easy);assert.equal(difficultyProfile('hard',-1),levels.hard);
});
test('draws, idle rounds, local play and friend rooms never turn into artificial win streaks',()=>{
 const h=new SoloChallenge(ids);
 for(let i=0;i<8;i++){
  h.record(match(),{success:true,outcome:'draw'});
  h.record({...match('oware'),state:{over:true,winner:null}},{success:true});
  h.record({...match('stay'),playerActions:0},{success:false});
  h.record({...match('laski'),online:true},{success:false});
  h.record(match('counters',{opponent:'local'}),{success:true});
  h.record(match('highjump',{jumpOpponents:'local'}),{success:true});
 }
 for(const id of ids){assert.equal(h.value(id,{difficulty:'normal'}),0);assert.equal(roomSettings(id,4).balance,0);assert.equal(adaptiveSolo(id,{difficulty:'normal'},true),false);}
});
test('unavailable or corrupt local storage never blocks a game',()=>{
 const unavailable={getItem(){throw Error('blocked');},setItem(){throw Error('full');}};
 const h=new SoloChallenge(ids,unavailable);assert.doesNotThrow(()=>h.record(match(),{success:false}));
 const bad=new SoloChallenge(ids,{getItem:()=>'{"football":{"balance":999,"recent":["win",1,null]}}'});
 assert.equal(bad.value('football',{difficulty:'normal'}),1);assert.deepEqual(bad.games.football.recent,[1]);
});
test('a draw or a loss after a winning streak cannot raise the next challenge',()=>{
 for(const success of [true,false]){
  const h=new SoloChallenge(ids);
  for(let i=0;i<4;i++)h.record(match(),{success});
  const before=h.value('football',{difficulty:'normal'});
  h.record(match(),{success,outcome:'draw'});assert.equal(h.value('football',{difficulty:'normal'}),before);
  h.record(match(),{success:!success});assert.equal(h.value('football',{difficulty:'normal'}),before);
 }
});
test('Laski continuation rounds learn once per result and update only on the next start',()=>{
 const h=new SoloChallenge(ids),m=match('laski');
 for(let i=0;i<3;i++){h.beginRound(m);m.playerActions=4;h.record(m,{success:true});h.record(m,{success:true});}
 assert.equal(h.games.laski.recent.length,3);assert.equal(m.difficultyTuning.speed,1);
 h.beginRound(m);assert.ok(m.difficultyTuning.speed>1);assert.equal(m.playerActions,0);
});
test('Ampe reads old habits occasionally and always leaves a chance to surprise it',()=>{
 for(const level of ['easy','normal','hard']){
  assert.equal(ampeOpponentFoot([],level,1,()=>.1),0);
  assert.equal(ampeOpponentFoot([],level,1,()=>.9),1);
  assert.equal(ampeOpponentFoot([0,0,0,0],level,1,()=>.01),1);
  const rolls=[.99,.1];assert.equal(ampeOpponentFoot([0,0,0,0],level,1,()=>rolls.shift()),0);
 }
});
