// Exercises the actual Worker, D1 and Durable Object runtime with two clients.
// Run against wrangler dev; optionally pass the deployed API and allowed origin.
import {writeFileSync} from 'node:fs';import assert from 'node:assert/strict';import WebSocket from 'ws';
const base=process.argv[2]||'http://127.0.0.1:8787',origin=process.argv[3]||'http://localhost:4173';
let calls=0;const clients=[];
async function api(path,data,token,expected=200){calls++;const r=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,...(token?{Authorization:'Bearer '+token}:{}),...(data===undefined?{}:{'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});const result=await r.json();assert.equal(r.status,expected,path+': '+(result.error||''));return result;}
async function socket(code,token){const {ticket}=await api('/rooms/'+code+'/ticket',{},token);const ws=new WebSocket(base.replace(/^http/,'ws')+'/rooms/'+code+'/socket?ticket='+ticket,{headers:{Origin:origin}});const client={ws,room:null,errors:[]};clients.push(client);ws.on('message',raw=>{const d=JSON.parse(String(raw));if(d.type==='room')client.room=d.room;if(d.type==='error')client.errors.push(d.error);});await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});await until(()=>client.room);return client;}
async function until(fn,timeout=6000){const end=Date.now()+timeout;while(Date.now()<end){if(fn())return;await new Promise(r=>setTimeout(r,30));}throw Error('Timed out waiting for room state');}
try{
 await api('/health');await api('/me',undefined,null,401);
 const evil=await fetch(base+'/health',{headers:{Origin:'https://evil.example'}});assert.equal(evil.status,403);
 const tag=Date.now().toString(36).slice(-5),a=await api('/players',{name:'QA Host '+tag},null,201),b=await api('/players',{name:'QA Guest '+tag},null,201);
 assert.equal((await api('/me',undefined,a.token)).id,a.player.id);
 await api('/me',{name:'<script>'},a.token,400);
 const r=await api('/rooms',{game:'ampe'},a.token,201);assert.match(r.code,/^[A-Z2-9]{8}$/);await api('/rooms/'+r.code+'/ticket',{},b.token,403);
 await api('/rooms/'+r.code+'/join',{},b.token);await api('/rooms/'+r.code+'/start',{},b.token,400);
 let ca=await socket(r.code,a.token),cb=await socket(r.code,b.token);await api('/rooms/'+r.code+'/start',{},a.token);await until(()=>ca.room.phase==='playing'&&cb.room.phase==='playing');
 for(let round=0;round<5;round++){
  ca.ws.send(JSON.stringify({type:'move',round,action:{foot:0}}));await until(()=>cb.room.state.locked[0]);assert.equal(cb.room.state.choices,undefined);assert.equal(cb.room.state.feet,undefined);
  ca.ws.send(JSON.stringify({type:'move',round,action:{foot:1}}));await until(()=>ca.errors.length>round);
  cb.ws.send(JSON.stringify({type:'move',round,action:{foot:0}}));await until(()=>ca.room.state.phase==='reveal');assert.deepEqual(ca.room.state.scores,[round+1,0]);
  if(round===1){ca.ws.close();ca=await socket(r.code,a.token);ca.errors=['previous','previous'];assert.equal(ca.room.state.round,1);}
  await until(()=>ca.room.phase==='finished'||ca.room.state.round>round,7000);
 }
 assert.equal(ca.room.phase,'finished');assert.equal(cb.room.state.winner,0);
 const pa=await api('/me',undefined,a.token),pb=await api('/me',undefined,b.token);assert.equal(pa.points,100);assert.equal(pb.points,25);assert.equal(pa.wins,1);
 ca.ws.send(JSON.stringify({type:'move',round:4,action:{foot:0}}));await new Promise(r=>setTimeout(r,100));assert.equal((await api('/me',undefined,a.token)).points,100);
 const league=await api('/leaderboard');assert.ok(league.entries.some(p=>p.id===a.player.id&&p.points===100));
 const run=await api('/runs',{game:'ampe'},a.token,201);await api('/runs/'+run.id+'/finish',{score:5,won:true},b.token,400);await api('/runs/'+run.id+'/finish',{score:5,won:true},a.token,400);await new Promise(r=>setTimeout(r,8100));
 const finished=await api('/runs/'+run.id+'/finish',{score:5,won:true},a.token);assert.equal(finished.player.points,150);await api('/runs/'+run.id+'/finish',{score:5,won:true},a.token);assert.equal((await api('/me',undefined,a.token)).points,150);assert.equal((await api('/leaderboard')).entries.find(p=>p.id===a.player.id).points,100);
 // Actual server turn enforcement for the board games.
 for(const game of ['oware','dame','ludo']){
  const board=await api('/rooms',{game},a.token,201);await api('/rooms/'+board.code+'/join',{},b.token);const ba=await socket(board.code,a.token),bb=await socket(board.code,b.token);await api('/rooms/'+board.code+'/start',{},a.token);await until(()=>bb.room.phase==='playing');bb.ws.send(JSON.stringify({type:'move',revision:bb.room.revision,action:{type:'roll',pit:0,from:60,to:51}}));await until(()=>bb.errors.length===1);assert.match(bb.errors[0],/turn/);await api('/rooms/'+board.code+'/leave',{},a.token);ba.ws.close();bb.ws.close();
 }
 const challenge=await api('/rooms',{game:'counters'},a.token,201);await api('/rooms/'+challenge.code+'/join',{},b.token);await api('/rooms/'+challenge.code+'/start',{},a.token);await new Promise(r=>setTimeout(r,8100));const caResult=await api('/rooms/'+challenge.code+'/result',{score:3,won:true},a.token);assert.equal(caResult.phase,'playing');const cbResult=await api('/rooms/'+challenge.code+'/result',{score:1,won:false},b.token);assert.equal(cbResult.phase,'finished');assert.equal(cbResult.state.results[a.player.id].score,3);assert.equal((await api('/me',undefined,a.token)).points,200);await api('/rooms/'+challenge.code+'/result',{score:3,won:true},a.token,400);assert.equal((await api('/me',undefined,a.token)).points,200);
 const ids=[a.player.id,b.player.id];writeFileSync('/tmp/gsg-qa-cleanup.sql',ids.map(id=>`DELETE FROM awards WHERE player_id='${id}'; DELETE FROM runs WHERE player_id='${id}'; DELETE FROM players WHERE id='${id}';`).join('\n'));
 console.log(JSON.stringify({ok:true,checks:['two authenticated players','private membership','host-only start','hidden Ampe choices','five rounds via real alarms','mid-match reconnect','server awarded winner and loser','duplicate award rejected','persistent practice XP','practice excluded from leaderboard','board turn enforcement','wrong-origin rejected','two-player score challenge persisted'],requests:calls,qaPlayerIds:[a.player.id,b.player.id]},null,2));
}finally{for(const {ws}of clients)ws.close();}
