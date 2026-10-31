import {multiplayerGame,validateInput} from '../dist/multiplayer-games.js';
export function startLive(room){const spec=multiplayerGame(room.game);if(room.players.length<spec.min||room.players.length>spec.max)throw Error(`This game needs ${spec.min===spec.max?spec.min:spec.min+'–'+spec.max} human players`);if(room.game==='football'&&room.players.length%2)throw Error('Add one more friend for equal teams');room.seed=crypto.getRandomValues(new Uint32Array(1))[0];room.state={over:false,winner:null,scores:room.players.map(()=>0),seat:0,results:{},frame:null,sequence:0,ready:[]};}
export function applyLiveMessage(room,slot,msg,time){
 const s=room.state;if(room.phase!=='playing'||s.over)throw Error('Round is not active');
 if(msg.type==='ready'){if(!s.ready.includes(slot))s.ready.push(slot);return{type:'ready',slots:s.ready};}
 if(msg.type==='sound'){if(slot!==0||typeof msg.name!=='string'||!/^[a-zA-Z]{1,24}$/.test(msg.name))throw Error('Invalid sound');return{type:'sound',name:msg.name};}
 if(msg.type==='input')return{type:'input',slot,input:validateInput(msg)};
 if(slot!==0)throw Error('Only the room host can publish the shared simulation');
 if(msg.type==='frame'){
  const f=msg.frame;if(!f||!Array.isArray(f.nodes)||f.nodes.length>1800||!Array.isArray(f.people)||f.people.length>40||!Number.isInteger(msg.sequence)||msg.sequence<=s.sequence||msg.seat!==s.seat)throw Error('Invalid scene update');
  for(const row of f.nodes)if(!Array.isArray(row)||row.length<11||row.length>12||!row.every(Number.isFinite)||!Number.isInteger(row[0])||row[0]<0||row[0]>3000||row.some(n=>Math.abs(n)>0xffffff)||row.slice(1,4).some(n=>Math.abs(n)>500)||row.slice(7,10).some(n=>n<0||n>1000))throw Error('Invalid scene transform');
  for(const p of f.people)if(!Array.isArray(p)||p.length!==10||p.slice(0,7).some(n=>!Number.isFinite(n)||Math.abs(n)>10000)||typeof p[7]!=='string'||p[7].length>32||!Number.isFinite(p[8])||!Number.isFinite(p[9]))throw Error('Invalid actor');
  if(!Array.isArray(f.actions)||f.actions.length>16||f.actions.some(a=>typeof a.id!=='string'||a.id.length>32||typeof a.label!=='string'||a.label.length>64||typeof a.key!=='string'||a.key.length>10))throw Error('Invalid controls');
  if(f.power!==undefined&&(!Number.isFinite(f.power)||f.power<0||f.power>2))throw Error('Invalid power display');
  if(typeof f.main!=='string'||f.main.length>200||typeof f.sub!=='string'||f.sub.length>200||typeof f.note!=='string'||f.note.length>500)throw Error('Invalid HUD');
  if(!Array.isArray(f.scores)||f.scores.length!==room.players.length||f.scores.some(v=>!Number.isFinite(v)||v<0||v>100000))throw Error('Invalid scores');
  if(f.meta){const m=f.meta;if(!Number.isFinite(m.cycle)||m.cycle<0||m.cycle>100000||!Number.isInteger(m.turn)||m.turn<0||m.turn>=room.players.length||typeof m.phase!=='string'||m.phase.length>32||!Number.isInteger(m.lastScorer)||m.lastScorer< -1||m.lastScorer>=room.players.length||!Number.isInteger(m.throwerIndex)||m.throwerIndex<0||m.throwerIndex>=room.players.length||!Number.isFinite(m.age)||m.age<0||m.age>7200||m.active!==null&&(!Array.isArray(m.active)||m.active.length>12||m.active.some(v=>typeof v!=='boolean')))throw Error('Invalid game status');}
  const previous=new Map((s.frame?.nodes||[]).map(n=>[n[0],n]));for(const n of f.nodes)previous.set(n[0],n);const merged={...f,nodes:[...previous.values()]};if(JSON.stringify(merged).length>100000)throw Error('Scene update too large');s.frame=merged;s.scores=f.scores;s.sequence=msg.sequence;room.lastFrame=time;
  return{type:'frame',sequence:s.sequence,seat:s.seat,frame:f};
 }
 if(msg.type==='round-end'){
  if(time-room.startedAt<8000||!Array.isArray(msg.scores)||msg.scores.length!==room.players.length||msg.scores.some(n=>!Number.isInteger(n)||n<0||n>100000))throw Error('Invalid final scores');
  if(room.type==='turns'){if(msg.seat!==s.seat)throw Error('Turn has changed');s.results[s.seat]=msg.scores[s.seat];s.scores[s.seat]=msg.scores[s.seat];if(s.seat<room.players.length-1){s.seat++;s.frame=null;s.sequence=0;s.ready=[];return{type:'next-turn',seat:s.seat};}}
  else s.scores=msg.scores;
  const high=Math.max(...s.scores);s.winners=Array.isArray(msg.winners)&&msg.winners.length>0&&msg.winners.length<=room.players.length&&msg.winners.every(i=>Number.isInteger(i)&&i>=0&&i<room.players.length)?[...new Set(msg.winners)]:s.scores.flatMap((n,i)=>n===high?[i]:[]);s.draw=room.game==='football'?s.winners.length===room.players.length:s.winners.length>1;s.winner=s.winners.length===1?s.winners[0]:null;s.over=true;room.phase='finished';room.pendingAwards=true;return{type:'finished'};
 }
 throw Error('Unknown live-room message');
}
