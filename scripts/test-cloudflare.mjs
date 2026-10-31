// Exercises the actual Worker, D1 and Durable Object runtime with two clients.
// Run against wrangler dev; optionally pass the deployed API and allowed origin.
import {writeFileSync} from 'node:fs';import assert from 'node:assert/strict';import WebSocket from 'ws';
const base=process.argv[2]||'http://127.0.0.1:8787',origin=process.argv[3]||'http://localhost:4173';
let calls=0;const clients=[];
async function api(path,data,token,expected=200){calls++;const r=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,...(token?{Authorization:'Bearer '+token}:{}),...(data===undefined?{}:{'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});const result=await r.json();assert.equal(r.status,expected,path+': '+(result.error||''));return result;}
async function socket(code,token){const {ticket}=await api('/rooms/'+code+'/ticket',{},token);const ws=new WebSocket(base.replace(/^http/,'ws')+'/rooms/'+code+'/socket?ticket='+ticket,{headers:{Origin:origin}});const client={ws,room:null,errors:[],events:[]};clients.push(client);ws.on('message',raw=>{const d=JSON.parse(String(raw));client.events.push(d);if(d.type==='room')client.room=d.room;if(d.type==='error')client.errors.push(d.error);});await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});await until(()=>client.room);return client;}
async function until(fn,timeout=6000){const end=Date.now()+timeout;while(Date.now()<end){if(fn())return;await new Promise(r=>setTimeout(r,30));}throw Error('Timed out waiting for room state');}
try{
 await api('/health');await api('/me',undefined,null,401);
 const evil=await fetch(base+'/health',{headers:{Origin:'https://evil.example'}});assert.equal(evil.status,403);
 const tag=Date.now().toString(36).slice(-5),a=await api('/players',{name:'QA Host '+tag},null,201),b=await api('/players',{name:'QA Guest '+tag},null,201);
 writeFileSync('/tmp/gsg-qa-cleanup.sql',[a.player.id,b.player.id].map(id=>`DELETE FROM awards WHERE player_id='${id}'; DELETE FROM runs WHERE player_id='${id}'; DELETE FROM players WHERE id='${id}';`).join('\n'));
 assert.equal((await api('/me',undefined,a.token)).id,a.player.id);
 await api('/me',{name:'<script>'},a.token,400);
 const r=await api('/rooms',{game:'ampe'},a.token,201);assert.match(r.code,/^[A-Z2-9]{8}$/);await api('/rooms/'+r.code+'/ticket',{},b.token,403);
 await api('/rooms/'+r.code+'/join',{},b.token);await api('/rooms/'+r.code+'/start',{},b.token,400);
 let ca=await socket(r.code,a.token),cb=await socket(r.code,b.token);await api('/rooms/'+r.code+'/start',{},a.token);await until(()=>ca.room.phase==='playing'&&cb.room.phase==='playing');
 for(let round=0;round<5;round++){
  ca.ws.send(JSON.stringify({type:'move',round,action:{foot:0}}));await until(()=>cb.room.state.round===round&&cb.room.state.phase==='choose'&&cb.room.state.locked[0]);assert.equal(cb.room.state.choices,undefined);assert.equal(cb.room.state.feet,undefined);
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
 const finished=await api('/runs/'+run.id+'/finish',{score:5,won:true},a.token);assert.equal(finished.player.points,150);await api('/runs/'+run.id+'/finish',{score:5,won:true},a.token);assert.equal((await api('/me',undefined,a.token)).points,150);assert.equal((await api('/leaderboard')).entries.find(p=>p.id===a.player.id).points,150);
 // Actual server turn enforcement for the board games.
 for(const game of ['oware','dame','ludo']){
  const board=await api('/rooms',{game},a.token,201);await api('/rooms/'+board.code+'/join',{},b.token);const ba=await socket(board.code,a.token),bb=await socket(board.code,b.token);await api('/rooms/'+board.code+'/start',{},a.token);await until(()=>bb.room.phase==='playing');bb.ws.send(JSON.stringify({type:'move',revision:bb.room.revision,action:{type:'roll',pit:0,from:60,to:51}}));await until(()=>bb.errors.length===1);assert.match(bb.errors[0],/turn/);await api('/rooms/'+board.code+'/leave',{},a.token);ba.ws.close();bb.ws.close();
 }
 const live=await api('/rooms',{game:'counters'},a.token,201);assert.equal(live.type,'live');await api('/rooms/'+live.code+'/join',{},b.token);const la=await socket(live.code,a.token),lb=await socket(live.code,b.token);await api('/rooms/'+live.code+'/start',{},a.token);await until(()=>lb.room.phase==='playing');
 la.ws.send(JSON.stringify({type:'ready'}));lb.ws.send(JSON.stringify({type:'ready'}));await until(()=>la.room.state.ready.length===2);
 lb.ws.send(JSON.stringify({type:'input',input:{x:.5,z:0,action:'next'}}));await until(()=>la.events.some(e=>e.type==='input'&&e.slot===1&&e.input.action==='next'));
 const frame={nodes:[[0,1,0,0,0,0,0,1,1,1,1]],people:[],actions:[{id:'flick',label:'Flick',key:'Space'}],main:'0 – 0',sub:'Human turn',note:'',scores:[0,0]};
 lb.ws.send(JSON.stringify({type:'frame',frame,sequence:1,seat:0}));await until(()=>lb.errors.some(e=>e.includes('host')));la.ws.send(JSON.stringify({type:'frame',frame,sequence:1,seat:0}));await until(()=>lb.events.some(e=>e.type==='frame'&&e.frame.nodes[0][1]===1));
 lb.ws.close();const rejoined=await socket(live.code,b.token);assert.equal(rejoined.room.state.frame.nodes[0][1],1);
 await new Promise(r=>setTimeout(r,8100));la.ws.send(JSON.stringify({type:'round-end',seat:0,scores:[3,1]}));await until(()=>rejoined.room.phase==='finished');assert.equal((await api('/me',undefined,a.token)).points,250);assert.equal((await api('/me',undefined,b.token)).points,50);assert.equal((await api('/leaderboard?game=counters')).entries.find(p=>p.id===a.player.id).points,100);
 la.ws.send(JSON.stringify({type:'round-end',seat:0,scores:[3,1]}));await new Promise(r=>setTimeout(r,100));assert.equal((await api('/me',undefined,a.token)).points,250);
 const turns=await api('/rooms',{game:'tumatu'},b.token,201);assert.equal(turns.type,'turns');await api('/rooms/'+turns.code+'/join',{},a.token);const th=await socket(turns.code,b.token),tg=await socket(turns.code,a.token);await api('/rooms/'+turns.code+'/start',{},b.token);await until(()=>tg.room.phase==='playing');await new Promise(r=>setTimeout(r,8100));
 th.ws.send(JSON.stringify({type:'round-end',seat:0,scores:[5,0]}));await until(()=>tg.room.state.seat===1);assert.equal(tg.room.phase,'playing');th.ws.send(JSON.stringify({type:'round-end',seat:0,scores:[5,13]}));await until(()=>th.errors.length>0);th.ws.send(JSON.stringify({type:'round-end',seat:1,scores:[5,13]}));await until(()=>tg.room.phase==='finished');assert.equal(tg.room.state.winner,1);assert.equal((await api('/me',undefined,a.token)).points,350);assert.equal((await api('/me',undefined,b.token)).points,75);
 const ids=[a.player.id,b.player.id];writeFileSync('/tmp/gsg-qa-cleanup.sql',ids.map(id=>`DELETE FROM awards WHERE player_id='${id}'; DELETE FROM runs WHERE player_id='${id}'; DELETE FROM players WHERE id='${id}';`).join('\n'));
 console.log(JSON.stringify({ok:true,checks:['two authenticated players','private membership','host-only start','hidden Ampe choices','five rounds via real alarms','mid-match reconnect','server awarded winner and loser','duplicate award rejected','persistent practice XP','practice points in all-game leaderboard','board turn enforcement','wrong-origin rejected','human live inputs and shared frames','host-only results','snapshot reconnect','live points exactly once','shared human turn progression'],requests:calls,qaPlayerIds:[a.player.id,b.player.id]},null,2));
}finally{for(const {ws}of clients)ws.close();}
