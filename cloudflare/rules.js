import {initialOware,moveOware} from '../dist/oware.js';
import {initialDame,dameMoves,moveDame,initialLudo,ludoLegal,moveLudo} from '../dist/board-rules.js';
import {catalogue} from '../dist/catalogue.js';
export const gameIds=new Set(catalogue.map(g=>g.id));
export const duels=new Set(['ampe','oware','dame','ludo']);
export {scoreCaps,practicePoints} from '../dist/points.js';
export function initialGame(game){if(game==='ampe')return {scores:[0,0],choices:[null,null],round:0,phase:'choose',over:false,winner:null};if(game==='oware')return initialOware();if(game==='dame')return initialDame();if(game==='ludo')return initialLudo();return {results:{},over:false,winner:null};}
export function publicGame(game,state){if(game!=='ampe')return state;const {choices,...rest}=state;return {...rest,locked:choices.map(c=>c!==null)};}
export function applyMove(game,state,slot,action,now=Date.now(),roll=()=>1+crypto.getRandomValues(new Uint32Array(1))[0]%6){
 if(state.over||!Number.isInteger(slot)||slot<0||slot>1)throw Error('Match is not accepting moves');
 if(game==='ampe'){
  if(state.phase!=='choose'||state.choices[slot]!==null||![0,1].includes(action.foot))throw Error('Foot already locked or invalid');
  const s=structuredClone(state);s.choices[slot]=action.foot;
  if(s.choices.every(x=>x!==null)){const winner=s.choices[0]===s.choices[1]?0:1;s.scores[winner]++;s.feet=[...s.choices];s.phase='reveal';s.revealUntil=now+2500;if(s.scores[winner]>=5)s.winner=winner;}
  return s;
 }
 if(slot!==state.turn)throw Error('Wait for your turn');
 let next=state;
 if(game==='oware')next=moveOware(state,action.pit);
 if(game==='dame')next=moveDame(state,action.from,action.to);
 if(game==='ludo'){
  if(action.type==='roll'&&state.die===null){next=structuredClone(state);next.die=roll();next.lastDie=next.die;if(!ludoLegal(next).length){if(next.die!==6)next.turn=1-next.turn;next.die=null;}}
  else if(action.type==='token')next=moveLudo(state,action.index);
 }
 if(next===state)throw Error('Illegal move');return next;
}
export function advanceAmpe(state){if(state.phase!=='reveal')return state;const s=structuredClone(state);if(s.winner!==null){s.over=true;s.phase='finished';}else{s.round++;s.phase='choose';s.choices=[null,null];delete s.feet;delete s.revealUntil;}return s;}
export function validName(name){if(typeof name!=='string')throw Error('Choose a player name');const n=name.normalize('NFKC').trim().replace(/\s+/g,' ');if(n.length<2||n.length>20||! /^[\p{L}\p{N} ._-]+$/u.test(n))throw Error('Use 2–20 letters, numbers, spaces or . _ -');return n;}
