import {difficultyProfile} from './difficulty.js';
// Small, local adjustments between completed Normal solo matches only.
// Scores, physical rules, random dice and a match already underway never change.
const KEY='gsg.solo-challenge.v1';
const clamp=value=>Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;
export function adaptiveSolo(game,settings,online=false){
 if(online||settings.difficulty!=='normal'||game==='pretend')return false;
 if(['oware','dame','ludo','counters'].includes(game)&&settings.opponent==='local')return false;
 if(['highjump','agawowa'].includes(game)&&settings.jumpOpponents==='local')return false;
 return true;
}
export class SoloChallenge{
 constructor(ids,storage){
  this.ids=new Set(ids);this.storage=storage;this.games={};this.recorded=new WeakSet();
  try{const saved=JSON.parse(storage?.getItem(KEY)||'{}');for(const id of this.ids){const g=saved?.[id];if(g&&Array.isArray(g.recent))this.games[id]={balance:clamp(g.balance),recent:g.recent.filter(n=>n===-1||n===0||n===1).slice(-5)};}}catch{}
 }
 value(game,settings,online=false){return this.ids.has(game)&&adaptiveSolo(game,settings,online)?this.games[game]?.balance||0:0;}
 beginRound(mode){
  if(!mode||!adaptiveSolo(mode.game?.id,mode.settings,mode.online||mode.networked))return;
  this.recorded.delete(mode);mode.playerActions=0;mode.engagedTime=0;
  mode.settings={...mode.settings,balance:this.value(mode.game.id,mode.settings)};
  mode.difficultyTuning=difficultyProfile(mode.settings.difficulty,mode.settings.balance);
 }
 record(mode,result){
  const id=mode?.game?.id;
  if(!mode||!this.ids.has(id)||this.recorded.has(mode)||!adaptiveSolo(id,mode.settings,mode.online||mode.networked))return;
  if(id==='laski'&&mode.keeperRole)return;
  if((mode.playerActions||0)<1&&(mode.engagedTime||0)<3)return;
  this.recorded.add(mode);
  // Board draws are authoritative; older modes may still label them success.
  const draw=result.outcome==='draw'||mode.state?.over&&mode.state.winner===null;
  const outcome=draw?0:result.success===true?1:result.success===false?-1:0;
  const previous=this.games[id]||{balance:0,recent:[]},recent=[...previous.recent,outcome].slice(-5);
  const total=recent.reduce((a,b)=>a+b,0);
  const step=outcome!==0&&Math.sign(total)===outcome&&recent.length>=3&&Math.abs(total)>=3?outcome*.16:0;
  this.games[id]={balance:clamp(previous.balance+step),recent};
  try{this.storage?.setItem(KEY,JSON.stringify(this.games));}catch{}
 }
}
