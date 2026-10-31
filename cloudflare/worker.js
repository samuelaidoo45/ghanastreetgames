import {multiplayerGame} from '../dist/multiplayer-games.js';
import {startLive,applyLiveMessage} from './live-room.js';
import {gameIds,duels,scoreCaps,practicePoints,initialGame,publicGame,applyMove,advanceAmpe,validName} from './rules.js';
const now=()=>Date.now(),uid=()=>crypto.randomUUID();
export const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const secret=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const json=(data,status=200)=>Response.json(data,{status,headers:{...(status===429?{'Retry-After':'60'}:{}),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function body(request){let total=0,chunks=[];const reader=request.body?.getReader();if(!reader)throw Error('Missing request body');while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>4096){await reader.cancel();throw Error('Request too large');}chunks.push(value);}const bytes=new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw Error('Invalid JSON');}}
async function auth(request,env){const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');if(!/^[a-f0-9]{64}$/.test(token||''))return null;return env.DB.prepare('SELECT id,name FROM players WHERE token_hash=?').bind(await digest(token)).first();}
async function rate(env,key,limit=60){const bucket=Math.floor(now()/60000);const k=await digest(key+':'+bucket);const r=await env.DB.prepare('INSERT INTO rate_limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits').bind(k,now()+120000).first();return r.hits<=limit;}
async function playerData(env,player){const stats=await env.DB.prepare('SELECT COALESCE(SUM(points),0) points, COUNT(*) games, COALESCE(SUM(CASE WHEN kind=\'friend\' THEN won ELSE 0 END),0) wins FROM awards WHERE player_id=?').bind(player.id).first();return {...player,...stats};}
export default {
 async fetch(request,env,ctx){
  const origin=request.headers.get('Origin'),allowed=(env.ALLOWED_ORIGINS||'').split(','),url=new URL(request.url),path=url.pathname;
  if(origin&&!allowed.includes(origin))return json({error:'Origin not allowed'},403);
  const cors=response=>{if(response.status===101)return response;const headers=new Headers(response.headers);if(origin)headers.set('Access-Control-Allow-Origin',origin);headers.set('Vary','Origin');headers.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');headers.set('Access-Control-Allow-Headers','Authorization,Content-Type');return new Response(response.body,{status:response.status,headers});};
  if(request.method==='OPTIONS')return cors(new Response(null,{status:204}));
  try{
   if(path==='/health')return cors(json({ok:true,version:'4.15',duels:[...duels]}));
   if(!['GET','POST'].includes(request.method))return cors(json({error:'Method not allowed'},405));
   if(!await rate(env,'ip:'+(path==='/players'?'signup:':'general:')+request.headers.get('CF-Connecting-IP'),path==='/players'?10:120))return cors(json({error:'Too many requests. Try again in a minute.'},429));
   if(path==='/players'&&request.method==='POST'){
    const data=await body(request),name=validName(data.name),id=uid(),token=secret();
    await env.DB.prepare('INSERT INTO players(id,name,token_hash,created_at) VALUES(?,?,?,?)').bind(id,name,await digest(token),now()).run();return cors(json({player:{id,name,points:0,games:0,wins:0},token},201));
   }
   if(path==='/leaderboard'&&request.method==='GET'){
    const game=url.searchParams.get('game')||'all';if(game!=='all'&&!gameIds.has(game))throw Error('Unknown game');
    const scope=url.searchParams.get('scope')==='friends'?'friend':null;const q=(scope?" AND a.kind='friend'":'')+(game==='all'?'':' AND a.game=?');const query=env.DB.prepare(`SELECT p.id,p.name,SUM(a.points) points,SUM(a.won) wins,COUNT(*) games FROM awards a JOIN players p ON p.id=a.player_id WHERE 1=1${q} GROUP BY p.id ORDER BY points DESC,wins DESC,p.id LIMIT 50`);
    const result=await (game==='all'?query:query.bind(game)).all();return cors(json({entries:result.results,scope:scope?'Friend matches (live arena results reported by host)':'All games and practice points'}));
   }
   const ws=path.match(/^\/rooms\/([A-Z2-9]{8})\/socket$/);
   if(ws){if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return cors(json({error:'WebSocket required'},426));if(!origin||!allowed.includes(origin))return cors(json({error:'Origin required'},403));return env.ROOMS.getByName(ws[1]).fetch(request);}
   const player=await auth(request,env);if(!player)return cors(json({error:'Restore or create your player first.'},401));
   if(!await rate(env,'player:'+player.id,90))return cors(json({error:'Please slow down.'},429));
   if(path==='/me'){
    if(request.method==='POST'){const d=await body(request);player.name=validName(d.name);await env.DB.prepare('UPDATE players SET name=? WHERE id=?').bind(player.name,player.id).run();}
    return cors(json(await playerData(env,player)));
   }
   if(path==='/runs'&&request.method==='POST'){
    const d=await body(request);if(!gameIds.has(d.game))throw Error('Unknown game');
    const count=await env.DB.prepare('SELECT COUNT(*) n FROM runs WHERE player_id=? AND started_at>?').bind(player.id,now()-3600000).first();if(count.n>=30)return cors(json({error:'Practice limit reached. You can still play; new points resume within an hour.'},429));
    const id=uid();await env.DB.prepare('INSERT INTO runs(id,player_id,game,started_at,room) VALUES(?,?,?,?,?)').bind(id,player.id,d.game,now(),null).run();return cors(json({id},201));
   }
   const finish=path.match(/^\/runs\/([a-f0-9-]{36})\/finish$/);
   if(finish&&request.method==='POST'){
    const d=await body(request),r=await env.DB.prepare('SELECT * FROM runs WHERE id=? AND player_id=?').bind(finish[1],player.id).first();if(!r)throw Error('Round not found');
    if(r.finished_at){const award=await env.DB.prepare('SELECT points FROM awards WHERE id=? AND player_id=?').bind(r.id,player.id).first();if(!award)throw Error('This older round was closed without a saved award');return cors(json({player:await playerData(env,player),saved:true}));}
    if(now()-r.started_at<1500||now()-r.started_at>7200000)throw Error('Round duration is outside the allowed window');
    const points=practicePoints(r.game,d.score,d.won);
    await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO awards VALUES(?,?,?,?,?,?,?,?)').bind(r.id,player.id,r.game,'practice',points,d.won?1:0,d.score,now()),env.DB.prepare('UPDATE runs SET finished_at=?,score=?,won=? WHERE id=? AND player_id=?').bind(now(),d.score,d.won?1:0,r.id,player.id)]);
    return cors(json({player:await playerData(env,player),points,saved:true}));
   }
   if(path==='/rooms'&&request.method==='POST'){
    const d=await body(request);if(!gameIds.has(d.game))throw Error('Unknown game');if(!await rate(env,'create:'+player.id,5))throw Error('Please wait before creating another room');
    const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code=Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%32]).join('');
    return cors(await env.ROOMS.getByName(code).fetch('https://room/create',{method:'POST',body:JSON.stringify({player,game:d.game,code})}));
   }
   const room=path.match(/^\/rooms\/([A-Z2-9]{8})\/(join|ticket|start|result|leave)$/);
   if(room&&request.method==='POST'){const data=await body(request);return cors(await env.ROOMS.getByName(room[1]).fetch('https://room/'+room[2],{method:'POST',body:JSON.stringify({player,data})}));}
   return cors(json({error:'Not found'},404));
  }catch(error){return cors(json({error:error.message?.length<160?error.message:'Request failed'},400));}
 },
 async scheduled(event,env){await env.DB.prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(now()).run();await env.DB.prepare('DELETE FROM runs WHERE finished_at IS NULL AND started_at<?').bind(now()-86400000).run();}
};

export class GameRoom{
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.queue=Promise.resolve();ctx.blockConcurrencyWhile(async()=>{this.room=await ctx.storage.get('room');});}
 exclusive(fn){const p=this.queue.then(fn,fn);this.queue=p.catch(()=>{});return p;}
 public(){const r=this.room;return r?{code:r.code,game:r.game,type:r.type,seed:r.seed,players:r.players,phase:r.phase,revision:r.revision,matchId:r.matchId,state:publicGame(r.game,r.state),expiresAt:r.expiresAt}:null;}
 async save(){await this.ctx.storage.put('room',this.room);await this.ctx.storage.setAlarm(this.room.pendingAwards?now()+10000:this.room.game==='ampe'&&this.room.state.phase==='reveal'?this.room.state.revealUntil:this.room.expiresAt);}
 broadcast(){const msg=JSON.stringify({type:'room',room:this.public()});for(const ws of this.ctx.getWebSockets())try{ws.send(msg);}catch{}}
 async fetch(request){return this.exclusive(async()=>{try{
  const path=new URL(request.url).pathname;if(this.room?.pendingAwards)await this.flushAwards();
  if(path.endsWith('/socket')){
   const ticket=new URL(request.url).searchParams.get('ticket');if(!/^[a-f0-9]{64}$/.test(ticket||''))return json({error:'Invalid ticket'},401);
   const key='ticket:'+await digest(ticket),auth=await this.ctx.storage.get(key);await this.ctx.storage.delete(key);
   if(!auth||auth.expires<now()||!this.room?.players.some(p=>p.id===auth.id)||this.room.expiresAt<now())return json({error:'Ticket expired'},401);
   for(const ws of this.ctx.getWebSockets())if(ws.deserializeAttachment()?.id===auth.id)ws.close(4000,'Connected on another tab');
   if(this.ctx.getWebSockets().length>=12)return json({error:'Room connections full'},429);
   const [client,server]=Object.values(new WebSocketPair());this.ctx.acceptWebSocket(server);server.serializeAttachment({id:auth.id,last:0,hits:0,bucket:0});server.send(JSON.stringify({type:'room',room:this.public()}));return new Response(null,{status:101,webSocket:client});
  }
  const d=await body(request),player=d.player;
  if(path==='/create'){
   if(this.room)return json({error:'Room already exists'},409);
   this.room={code:d.code,game:d.game,type:multiplayerGame(d.game).type,players:[player],phase:'waiting',revision:0,matchId:uid(),state:initialGame(d.game),createdAt:now(),expiresAt:now()+3600000};await this.save();return json(this.public(),201);
  }
  if(!this.room||this.room.expiresAt<now())return json({error:'Room not found or expired'},404);
  const r=this.room;if(r.type==='challenge'&&r.phase!=='finished'){r.phase='cancelled';r.state.over=true;await this.save();}
  if(path==='/join'){
   if(!r.players.some(p=>p.id===player.id)){if(r.phase!=='waiting')throw Error('This round has already started');if(r.players.length>=multiplayerGame(r.game).max)throw Error('Room is full');r.players.push(player);r.revision++;await this.save();this.broadcast();}return json(this.public());
  }
  const slot=r.players.findIndex(p=>p.id===player.id);if(slot<0)return json({error:'Join the room first'},403);
  if(path==='/ticket'){const ticket=secret();await this.ctx.storage.put('ticket:'+await digest(ticket),{id:player.id,expires:now()+30000});return json({ticket});}
  if(path==='/start'){
   if(slot!==0||r.phase!=='waiting'||r.players.length<2)throw Error('The host can start once a friend joins');if(r.type!=='duel')startLive(r);else r.state=initialGame(r.game);r.phase='playing';r.startedAt=now();r.revision++;await this.save();this.broadcast();return json(this.public());
  }
  if(path==='/result'){
   if(r.type!=='challenge'||r.phase!=='playing'||now()-r.startedAt<8000)throw Error('Challenge is not accepting results');
   const {score,won}=d.data;practicePoints(r.game,score,won);if(r.state.results[player.id])return json(this.public());
   r.state.results[player.id]={score,won};r.revision++;if(r.players.every(p=>r.state.results[p.id])){r.phase='finished';r.state.over=true;}
   r.pendingAwards=true;await this.save();await this.flushAwards();this.broadcast();return json(this.public());
  }
  if(path==='/leave'){
   if(r.phase==='waiting'){r.players.splice(slot,1);if(!r.players.length)r.expiresAt=now();}else if(r.phase==='playing'){r.phase='cancelled';r.state.over=true;r.state.winner=null;}
   r.revision++;await this.save();this.broadcast();return json(this.public());
  }
  return json({error:'Not found'},404);
 }catch(e){return json({error:e.message},400);}});}
 async webSocketMessage(ws,message){return this.exclusive(async()=>{try{
  if(typeof message!=='string'||message.length>100000)throw Error('Invalid message');
  const a=ws.deserializeAttachment();if(!a)throw Error('Not authenticated');const bucket=Math.floor(now()/1000);a.hits=a.bucket===bucket?a.hits+1:1;a.bucket=bucket;ws.serializeAttachment(a);if(a.hits>35){ws.close(1008,'Too many inputs');return;}
  const msg=JSON.parse(message);if(msg.type==='ping'){ws.send('{"type":"pong"}');return;}
  const r=this.room,slot=r?.players.findIndex(p=>p.id===a.id);if(!r||slot<0||r.phase!=='playing'||r.expiresAt<now())throw Error('No active head-to-head round');
  if(r.type==='live'||r.type==='turns'){
   const event=applyLiveMessage(r,slot,msg,now());
   if(event.type==='input'){for(const peer of this.ctx.getWebSockets())if(peer.deserializeAttachment()?.id===r.players[0].id)peer.send(JSON.stringify(event));return;}
   if(event.type==='sound'){for(const peer of this.ctx.getWebSockets())if(peer!==ws)peer.send(JSON.stringify(event));return;}
   if(event.type==='frame'){for(const peer of this.ctx.getWebSockets())if(peer!==ws)peer.send(JSON.stringify(event));if(now()-(this.lastSaved||0)>1000){this.lastSaved=now();await this.save();}return;}
   r.revision++;await this.save();if(r.pendingAwards)await this.flushAwards();this.broadcast();return;
  }
  // Ampe permits both simultaneous choices at the same public revision, but
  // each slot can lock only once in a round; all other games require revision.
  if(r.game==='ampe'){if(msg.round!==r.state.round)throw Error('Round changed');}else if(msg.revision!==r.revision)throw Error('Board changed; use the latest position');
  r.state=applyMove(r.game,r.state,slot,msg.action);r.revision++;
  if(r.state.over){r.phase='finished';r.pendingAwards=true;}
  await this.save();if(r.pendingAwards)await this.flushAwards();this.broadcast();
 }catch(e){ws.send(JSON.stringify({type:'error',error:e.message}));ws.send(JSON.stringify({type:'room',room:this.public()}));}});}
 async flushAwards(){const r=this.room;if(!r.pendingAwards)return;
  const entries=r.type==='challenge'?r.players.filter(p=>r.state.results[p.id]).map(p=>{const result=r.state.results[p.id];return {p,kind:'practice',points:practicePoints(r.game,result.score,result.won),won:result.won,score:result.score};}):r.players.map((p,i)=>({p,kind:'friend',points:r.state.winners?(r.state.winners.includes(i)?(r.state.draw?50:100):25):r.state.winner===null?50:i===r.state.winner?100:25,won:r.state.winners?r.state.winners.includes(i)&&!r.state.draw:i===r.state.winner,score:r.state.scores?.[i]||0}));
  await this.env.DB.batch(entries.map(({p,kind,points,won,score})=>this.env.DB.prepare('INSERT OR IGNORE INTO awards VALUES(?,?,?,?,?,?,?,?)').bind(r.matchId,p.id,r.game,kind,points,won?1:0,score,now())));r.pendingAwards=false;await this.save();
 }
 async alarm(){return this.exclusive(async()=>{const r=this.room;if(!r)return;
  if(r.pendingAwards){await this.flushAwards();this.broadcast();}
  if(r.expiresAt<=now()){for(const ws of this.ctx.getWebSockets())ws.close(4001,'Room expired');await this.ctx.storage.deleteAll();this.room=null;return;}
  if(r.game==='ampe'&&r.state.phase==='reveal'&&r.state.revealUntil<=now()){r.state=advanceAmpe(r.state);r.revision++;if(r.state.over){r.phase='finished';r.pendingAwards=true;}await this.save();if(r.pendingAwards)await this.flushAwards();this.broadcast();}
 });}
 webSocketClose(ws,code){try{ws.close([1005,1006,1015].includes(code)?1000:code);}catch{}}
 webSocketError(ws){try{ws.close(1011,'Reconnect to the room');}catch{}}
}
