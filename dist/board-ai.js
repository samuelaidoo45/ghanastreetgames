import {legalMoves,moveOware} from './oware.js';
import {dameMoves,moveDame,ludoLegal,moveLudo,ludoCell} from './board-rules.js';
// Normal uses a little more/less planning only between solo rounds. The legal
// move generator and dice are unchanged. Explicit Easy and Hard stay fixed.
function planningLevel(level,balance,random){
 if(level!=='normal'||!Number.isFinite(balance)||!balance)return level;
 const amount=Math.max(-1,Math.min(1,balance));
 return random()<Math.abs(amount)*(amount>0?.35:.2)?(amount>0?'hard':'easy'):level;
}
// Bounded two-ply planning keeps turns responsive on phones. All candidates are legal.
function pick(state,moves,advance,evaluate,level,random){
 const options=moves(state);if(!options.length)return null;
 if(level==='easy')return options[Math.floor(random()*options.length)];
 let best=options[0],value=-Infinity,ties=[];
 for(const action of options){const next=advance(state,action);let score=evaluate(next);
  if(level==='hard'&&!next.over){const replies=moves(next);if(replies.length){const budget=Math.max(1,Math.floor(512/options.length));const values=replies.slice(0,budget).map(reply=>evaluate(advance(next,reply)));score=next.turn===state.turn?Math.max(...values):Math.min(...values);}}
  if(score>value+1e-9){value=score;best=action;ties=[action];}else if(Math.abs(score-value)<1e-9)ties.push(action);
 }return level==='normal'&&ties.length>1?ties[Math.floor(random()*ties.length)]:best;
}
export function chooseOware(state,level='normal',random=Math.random,balance=0){level=planningLevel(level,balance,random);const side=state.turn;return pick(state,legalMoves,moveOware,s=>(s.scores[side]-s.scores[1-side])*10+s.pits.slice(side*6,side*6+6).filter(n=>n>0).length*.05,level,random);}
export function chooseDame(state,level='normal',random=Math.random,balance=0){level=planningLevel(level,balance,random);const side=state.turn;return pick(state,dameMoves,(s,m)=>moveDame(s,m.from,m.to),s=>s.over?(s.winner===side?10000:s.winner===null?0:-10000):s.pieces.reduce((total,p,i)=>total+(!p||s.captured?.includes(i)?0:(p.player===side?1:-1)*(p.king?5:3+(p.player===0?9-Math.floor(i/10):Math.floor(i/10))*.04)),0),level,random);}
export function chooseLudo(state,level='normal',random=Math.random,balance=0){level=planningLevel(level,balance,random);const legal=ludoLegal(state),side=state.turn;if(!legal.length)return null;if(level==='easy')return legal[Math.floor(random()*legal.length)];const score=i=>{if(level!=='hard')return state.tokens[side][i];const next=moveLudo(state,i),position=next.tokens[side][i],cell=ludoCell(side,position);const captures=next.tokens[1-side].filter(n=>n<0).length-state.tokens[1-side].filter(n=>n<0).length;const danger=cell!==null&&cell!==0&&cell!==26?next.tokens[1-side].filter(n=>{const other=ludoCell(1-side,n);return other!==null&&(cell-other+52)%52>0&&(cell-other+52)%52<=6;}).length:0;return (position===57?100:0)+captures*35-danger*12+(state.tokens[side][i]<0?8:0)+position*.15;};const best=Math.max(...legal.map(score)),choices=legal.filter(i=>score(i)===best);return level==='normal'&&choices.length>1?choices[Math.floor(random()*choices.length)]:choices[0];}
