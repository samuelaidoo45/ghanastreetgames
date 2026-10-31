import {dameMoves} from './board-rules.js';
export function bindOnlineMode(mode,room,playerId,send){
 const slot=room.players.findIndex(p=>p.id===playerId),names=room.players.map(p=>p.name);let latest=room;
 mode.online=true;mode.roomCode=room.code;
 const move=action=>{if(mode.done)return;send({action,revision:latest.revision,round:latest.state.round});};
 if(room.game==='ampe')mode.onlineSend=foot=>move({foot});
 else{
  mode.update=()=>{};
  const allowed=()=>latest.phase==='playing'&&latest.state.turn===slot;
  if(room.game==='oware')mode.choose=pit=>{if(allowed())move({pit});};
  if(room.game==='dame')mode.choose=i=>{if(!allowed())return;const legal=dameMoves(mode.state);if(mode.selected!==null&&legal.some(m=>m.from===mode.selected&&m.to===i))move({from:mode.selected,to:i});else if(legal.some(m=>m.from===i)){mode.selected=i;mode.cursor=i;mode.draw();showTurn();}};
  if(room.game==='ludo'){mode.choose=index=>{if(allowed())move({type:'token',index});};mode.action=id=>{if(allowed())id==='roll'?move({type:'roll'}):mode.choose(Number(id));};}
 }
 function showTurn(){if(room.game==='ampe')return;const ours=latest.state.turn===slot;mode.ui.status(names[0]+' vs '+names[1],(ours?'YOUR TURN':names[latest.state.turn]+"’S TURN")+(room.game==='ludo'&&latest.state.lastDie?' · ROLLED '+latest.state.lastDie:''));mode.ui.actions(mode.actions.map(a=>({...a,disabled:a.disabled||!ours})));}
 mode.receiveRoom=next=>{
  const changed=next.revision!==latest.revision;latest=next;
  if(next.phase==='cancelled'){mode.finish('ROOM ENDED','A player left. No competitive points awarded.',false);return;}
  if(room.game==='ampe')mode.syncOnline(next.state,slot,names);
  else {mode.state=structuredClone(next.state);if(room.game==='dame')mode.selected=mode.state.forced??null;mode.draw();showTurn();if(changed)mode.ui.sound('stone');}
  if(next.phase==='finished'&&!mode.done){const win=next.state.winner===slot,tie=next.state.winner===null;mode.score=next.state.scores?.[slot]||0;mode.finish(tie?'HONOURS EVEN':win?'YOU WIN!':names[next.state.winner]+' WINS',tie?'50 friend-match points saved for each player.':win?'100 friend-match points saved.':'25 friend-match points saved. Play again to challenge your friend.',win||tie);}
 };
 mode.receiveRoom(room);
 return mode;
}
