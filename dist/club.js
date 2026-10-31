import {ClubAPI} from './club-api.js';
import {bindOnlineMode} from './online-mode.js';
const duelGames=new Set(['ampe','oware','dame','ludo']),$=id=>document.getElementById(id);
export function initClub(hooks){
 const api=new ClubAPI();let player=null,room=null,ws=null,retry=null,launchId=null,leaving=false;
 try{const saved=JSON.parse(localStorage.getItem('gsg.player')||'null');if(saved?.token?.match(/^[a-f0-9]{64}$/)){api.token=saved.token;player=saved.player;}}catch{}
 const club={launchContext:null};
 const message=text=>{$('club-message').textContent=text;};
 const save=()=>{try{localStorage.setItem('gsg.player',JSON.stringify({token:api.token,player}));}catch{message('Device storage is unavailable. Save your recovery key before leaving.');}renderProfile();};
 function renderProfile(){const p=!!player;$('club-onboarding').hidden=p;$('club-profile').hidden=!p;$('club-name').textContent=player?.name||'';$('club-points').textContent=(player?.points||0)+' XP';$('club-games').textContent=(player?.games||0)+' completed rounds · '+(player?.wins||0)+' friend wins';$('club-button').textContent=p?'Friends · '+(player.points||0)+' XP':'Play with friends';$('room-controls').hidden=!p||!!room;}
 function renderRoom(){
  $('friend-room').hidden=!room;if(!room)return;
  $('room-code').textContent=room.code;$('room-title').textContent=hooks.catalogue.find(g=>g.id===room.game)?.name||room.game;
  $('room-kind').textContent=room.type==='duel'?'Live head-to-head · private room':'Score challenge · play your own round, then compare scores';
  $('room-players').replaceChildren();for(const p of room.players){const li=document.createElement('li'),result=room.state.results?.[p.id];li.textContent=p.name+(p.id===player.id?' (you)':'')+(result?' · '+result.score+' points':room.phase==='playing'&&room.type==='challenge'?' · playing':'');$('room-players').append(li);}
  $('room-start').hidden=room.phase!=='waiting'||room.players[0]?.id!==player.id;$('room-start').disabled=room.players.length<2;$('room-return').hidden=!['playing','finished'].includes(room.phase)||(room.type==='challenge'&&!!room.state.results?.[player.id]);$('room-return').textContent=room.phase==='finished'?'View match result':'Return to game';
  $('room-status').textContent=room.phase==='waiting'?(room.players.length<2?'Share this code with a friend.':'Your friend has joined. The host can start.'):room.phase==='playing'?'Round in progress':room.phase==='finished'?'Round complete. Leave this room to create a rematch.':'Room ended';
 }
 const attempt=fn=>async event=>{const button=event?.currentTarget;if(button?.disabled)return;if(button)button.disabled=true;message('');try{await fn();}catch(e){message(e.message);}finally{if(button)button.disabled=false;}};
 async function refresh(){if(!api.token)return;player=await api.request('/me');save();}
 async function open(){renderProfile();renderRoom();$('club-dialog').showModal();if(api.token)refresh().catch(e=>message(e.message));}
 function accept(next){room=next;renderProfile();renderRoom();const mode=hooks.getMode();if(mode?.roomCode===room.code)mode.receiveRoom?.(room);
  if(room.phase==='playing'&&launchId!==room.matchId&&!(room.type==='challenge'&&room.state.results?.[player.id])){launchId=room.matchId;club.launchContext=room;hooks.start(room).catch(e=>{launchId=null;message('Could not load the match. '+e.message);});}
  if(room.phase==='finished'){refresh().catch(()=>{});if(room.type==='challenge')message('All challenge scores are in. Open Friends & Scores to compare.');}
 }
 async function connect(){
  if(!room||leaving)return;clearTimeout(retry);const code=room.code,socket=await api.socket(code);if(room?.code!==code||leaving){socket.close();return;}ws=socket;
  socket.onopen=()=>{$('room-connection').textContent='Connected';};
  socket.onmessage=event=>{let data;try{data=JSON.parse(event.data);}catch{return;}if(socket!==ws)return;if(data.type==='room')accept(data.room);else if(data.type==='error'){message(data.error);hooks.notify(data.error);}};
  socket.onclose=event=>{if(socket!==ws||leaving||!room)return;$('room-connection').textContent='Connection lost. Reconnecting…';if(event.code===4000){message('Room opened in another tab.');return;}retry=setTimeout(()=>connect().catch(e=>{message(e.message);retry=setTimeout(()=>connect().catch(e=>message(e.message)),5000);}),1800);};
  socket.onerror=()=>{$('room-connection').textContent='Connecting…';};
 }
 async function enter(next){leaving=false;room=next;launchId=null;try{localStorage.setItem('gsg.room',room.code);}catch{}renderProfile();renderRoom();await connect();}
 async function leave(){leaving=true;clearTimeout(retry);ws?.close();ws=null;const old=room;room=null;club.launchContext=null;launchId=null;try{localStorage.removeItem('gsg.room');}catch{}renderProfile();renderRoom();if(old)await api.request('/rooms/'+old.code+'/leave',{}).catch(()=>{});leaving=false;}
 club.leave=leave;club.open=open;
 club.attach=mode=>{
  if(club.launchContext&&room){mode.online=true;mode.roomCode=room.code;if(room.type==='duel')bindOnlineMode(mode,room,player.id,msg=>{if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'move',...msg}));else hooks.notify('Reconnecting. Your move has not been sent.');});return;}
  if(player)mode.savedRun=api.request('/runs',{game:mode.game.id}).catch(e=>{hooks.notify('Playing offline · '+e.message);return null;});
 };
 club.finishRound=async(mode,result)=>{
  if(!mode)return;if(!player){hooks.result?.('Create your player in Friends & Scores to save future points.');return;}
  try{if(mode.online){if(room?.type==='challenge'){await api.request('/rooms/'+room.code+'/result',{score:Math.max(0,Math.round(result.score||0)),won:!!result.success});hooks.result?.('Challenge score saved. Open Friends & Scores to compare results.');}await refresh();return;}
   const run=await mode.savedRun;if(!run){hooks.result?.('This round was played offline.');return;}const saved=await api.request('/runs/'+run.id+'/finish',{score:Math.max(0,Math.round(result.score||0)),won:!!result.success});player=saved.player;save();hooks.result?.('+'+(saved.points||0)+' practice XP saved · '+player.points+' XP total.');
  }catch(e){hooks.result?.('Score not saved: '+e.message);}
 };
 $('club-button').onclick=attempt(open);$('club-close').onclick=()=>{$('club-dialog').close();$('player-recovery').value='';};
 $('create-player').onclick=attempt(async()=>{const created=await api.request('/players',{name:$('new-player-name').value});player=created.player;api.token=created.token;save();message('Your player is ready. Save a recovery key to keep your progress across devices.');});
 $('rename-player').onclick=attempt(async()=>{player=await api.request('/me',{name:$('rename-player-name').value});save();message('Name updated.');});
 $('save-player-key').onclick=attempt(async()=>{const blob=new Blob(['Ghana Street Games player recovery key\nKeep this private. Anyone with it can use your player.\n\n'+api.token+'\n'],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ghana-street-games-player-key.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Recovery key downloaded. Keep it private.');});
 $('restore-player').onclick=attempt(async()=>{const token=$('player-recovery').value.trim();if(!/^[a-f0-9]{64}$/.test(token))throw Error('Paste the 64-character key from your saved file.');const previous=api.token;api.token=token;try{player=await api.request('/me');save();$('player-recovery').value='';message('Player restored.');}catch(e){api.token=previous;throw e;}});
 for(const g of hooks.catalogue){const option=document.createElement('option');option.value=g.id;option.textContent=g.name+(duelGames.has(g.id)?' · live duel':' · score challenge');$('room-game').append(option);} $('room-game').value='ampe';
 $('room-create').onclick=attempt(async()=>{await enter(await api.request('/rooms',{game:$('room-game').value}));});
 $('room-join').onclick=attempt(async()=>{const code=$('join-room-code').value.trim().toUpperCase();if(!/^[A-Z2-9]{8}$/.test(code))throw Error('Enter your friend’s 8-character room code.');await enter(await api.request('/rooms/'+code+'/join',{}));});
 $('room-share').onclick=attempt(async()=>{if(navigator.share)await navigator.share({title:'Ghana Street Games',text:'Join my '+$('room-title').textContent+' room: '+room.code+'. Open Play with friends and enter the code.',url:location.origin});else{await navigator.clipboard.writeText(room.code);message('Room code copied.');}});
 $('room-start').onclick=attempt(async()=>accept(await api.request('/rooms/'+room.code+'/start',{})));
 $('room-leave').onclick=attempt(async()=>{await leave();hooks.leave();await open();});
 $('room-return').onclick=attempt(async()=>{if(hooks.getMode()?.roomCode===room.code){$('club-dialog').close();hooks.resume?.();return;}club.launchContext=room;await hooks.start(room);});
 $('leaderboard-refresh').onclick=attempt(async()=>{const data=await api.request('/leaderboard?game='+$('leaderboard-game').value),list=$('leaderboard-list');list.replaceChildren();for(const [i,p]of data.entries.entries()){const li=document.createElement('li'),name=document.createElement('span'),points=document.createElement('strong');name.textContent=(i+1)+'. '+p.name;points.textContent=p.points+' pts · '+p.wins+' wins';li.append(name,points);list.append(li);}if(!data.entries.length)message('No friend-match results yet. Start a private duel to set the first score.');});
 $('result-friends').onclick=attempt(open);$('pause-friends').onclick=attempt(open);
 renderProfile();
 if(player){let code;try{code=localStorage.getItem('gsg.room');}catch{}if(code?.match(/^[A-Z2-9]{8}$/))api.request('/rooms/'+code+'/join',{}).then(enter).catch(()=>{try{localStorage.removeItem('gsg.room');}catch{}});}
 return club;
}
