import test from 'node:test';
import assert from 'node:assert/strict';
import {formationFor,planTeam} from '../dist/football-formations.js';
const make=(n,team=0,style='balanced')=>formationFor(n,style).slots.map(slot=>({position:{x:slot.x*15*(team?-1:1),z:slot.z*10},userData:{team,slot}}));
function plan(players,changes={}){return planTeam({players,opponents:make(players.length,1),ball:{x:4,z:3},carrier:null,receiver:null,controlled:null,halfX:15,halfZ:10,now:1,...changes});}
test('every formation assigns exactly the selected outfield count and distinct positions',()=>{
 for(let n=1;n<=7;n++)for(const style of ['balanced','defensive','attacking']){const f=formationFor(n,style);assert.equal(f.slots.length,n);assert.equal(new Set(f.slots.map(s=>s.x+':'+s.z)).size,n);if(n>1){assert.equal(f.slots[0].role,'Centre-back');assert.equal(f.slots.at(-1).role,'Forward');}}
});
test('loose balls have exactly one collector and defenders keep cover',()=>{
 for(let n=2;n<=7;n++){const players=make(n),p=plan(players);assert.equal([...p.targets.values()].filter(t=>t.duty==='Collect').length,1);const off=players.filter(x=>x!==p.presser);assert.ok(off.every(x=>Math.hypot(p.targets.get(x).x-4,p.targets.get(x).z-3)>2));assert.ok(off.some(x=>p.targets.get(x).x<0));}
});
test('possession produces passing lanes without another player chasing the carrier',()=>{
 const players=make(7),p=plan(players,{carrier:players.at(-1)});assert.equal(p.presser,null);assert.ok([...p.targets.values()].every(t=>t.duty==='Support'));const targets=[...p.targets.values()];assert.ok(Math.max(...targets.map(t=>t.z))-Math.min(...targets.map(t=>t.z))>10);assert.ok(Math.max(...targets.map(t=>t.x))-Math.min(...targets.map(t=>t.x))>10);
});
test('pressing assignments remain stable against small changes in ball position',()=>{
 const players=make(3);players[0].position={x:0,z:0};players[1].position={x:0,z:.1};const first=plan(players,{ball:{x:1,z:0}});const second=plan(players,{ball:{x:1,z:.1},previous:first,now:1.1});assert.equal(first.presser,second.presser);
});
test('a nominated pass receiver collects while teammates maintain shape',()=>{const players=make(5),receiver=players.at(-1),p=plan(players,{receiver});assert.equal(p.presser,receiver);assert.equal([...p.targets.values()].filter(t=>t.duty==='Collect').length,1);});
test('a human already pressing prevents a second teammate joining the chase',()=>{const players=make(5),controlled=players[0];controlled.position={x:4,z:3};const p=plan(players,{controlled,carrier:make(1,1)[0]});assert.equal(p.presser,controlled);assert.ok(players.slice(1).every(x=>p.targets.get(x).duty==='Cover'));});
test('formation targets are mirrored for opponents and stay within the pitch',()=>{
 for(const team of [0,1])for(const style of ['balanced','defensive','attacking']){const players=make(7,team,style),p=plan(players,{ball:{x:14,z:9},opponents:make(7,1-team)});for(const target of p.targets.values()){assert.ok(Math.abs(target.x)<15);assert.ok(Math.abs(target.z)<10);}}
});
test('the passer does not override the nominated receiver immediately after releasing a pass',()=>{const players=make(5),controlled=players[0],receiver=players.at(-1);controlled.position={x:4,z:3};const p=plan(players,{controlled,receiver});assert.equal(p.presser,receiver);assert.equal(p.targets.get(controlled).duty,'Cover');});

test('three-player formations no longer offer 1–1–1',()=>{
 for(const style of ['balanced','defensive','attacking'])assert.notEqual(formationFor(3,style).label,'1–1–1');
 assert.equal(formationFor(3,'balanced').label,'2–1');assert.equal(formationFor(3,'attacking').label,'1–2');
});
test('attacking teammates advance with possession instead of staying at formation coordinates',()=>{
 const players=make(7),carrier=players[3],early=plan(players,{carrier,ball:{x:-6,z:0},now:1}),late=plan(players,{carrier,ball:{x:9,z:4},now:3});
 const movers=players.filter(p=>p!==carrier&&late.targets.get(p).x-early.targets.get(p).x>5);
 assert.ok(movers.length>=3,'multiple players make forward runs');
 assert.ok([...late.targets.values()].some(t=>t.x<0),'one player covers the counterattack');
});
test('nearby defenders can challenge outside their original formation position',()=>{
 const players=make(5),carrier=make(1,1)[0];carrier.position={x:3,z:0};players[0].position={x:2.6,z:0};players[1].position={x:3,z:1.2};
 const p=plan(players,{carrier,ball:carrier.position,controlled:players[0]});assert.equal(p.presser,players[0]);assert.equal(p.targets.get(players[1]).duty,'Challenge');
 assert.ok(Math.hypot(p.targets.get(players[1]).x-3,p.targets.get(players[1]).z)<.1);
});
test('players recover their spacing once the nearby contest moves away',()=>{
 const players=make(5),carrier=make(1,1)[0];carrier.position={x:3,z:0};players[0].position={x:2.6,z:0};players[1].position={x:3,z:1.2};
 const first=plan(players,{carrier,ball:carrier.position});
 const recovered=plan(players,{previous:first,ball:{x:-10,z:-7},now:4});const target=recovered.targets.get(players[1]);
 assert.notEqual(target.duty,'Challenge');assert.ok(Math.hypot(target.x-3,target.z-1.2)>3);
});
test('a passer continues a give-and-go run after the receiving player controls the ball',()=>{
 const players=make(5),passer=players[2],receiver=players[4];
 const before=plan(players,{carrier:passer,now:1});const flight=plan(players,{carrier:null,receiver,previous:before,now:1.2});
 const received=plan(players,{carrier:receiver,ball:{x:4,z:0},previous:flight,now:1.6});const next=plan(players,{carrier:receiver,ball:{x:4,z:0},previous:received,now:1.8});
 assert.equal(next.runner,passer);assert.ok(next.targets.get(passer).x>6);
});

test('both teams recover goal-side after a turnover instead of leaving forwards upfield',()=>{
 for(const team of [0,1])for(const style of ['balanced','defensive','attacking'])for(const n of [3,5,7]){
  const direction=team===0?1:-1,players=make(n,team,style),opponents=make(n,1-team),carrier=opponents.at(-1),ball={x:-5*direction,z:3};carrier.position=ball;
  players.forEach((p,i)=>p.position={x:(5+i*.2)*direction,z:(i-2)*2});
  const attack=plan(players,{carrier:players.at(-1),opponents,ball:{x:8*direction,z:0}});
  const defense=plan(players,{carrier,opponents,ball,previous:attack,now:2});
  const covering=players.filter(p=>defense.targets.get(p).duty==='Cover');
  assert.ok(covering.length>=n-2);
  for(const p of covering){const t=defense.targets.get(p);assert.ok(t.x*direction<ball.x*direction,'recover behind the ball');assert.equal(t.recover,true);}
  assert.equal(defense.runner,null,'cancel attacking runs on a turnover');
 }
});
test('an attack retains a deep defender and a central midfield screen',()=>{
 for(const team of [0,1]){const players=make(5,team),direction=team?-1:1,carrier=players.at(-1),p=plan(players,{carrier,ball:{x:10*direction,z:6},opponents:make(5,1-team)});
  const cb=players.find(x=>x.userData.slot.position==='CB'),dm=players.find(x=>x.userData.slot.position==='DM');
  assert.ok(p.targets.get(cb).x*direction<0);assert.ok(p.targets.get(dm).x*direction<=1.8);assert.ok(Math.abs(p.targets.get(dm).z)<3);
  assert.ok(players.some(x=>p.targets.get(x).x*direction>10),'still offer forward passing options');
 }
});
test('central cover stays in the shooting lane when defending near goal',()=>{
 const players=make(5),opponents=make(5,1),carrier=opponents.at(-1);carrier.position={x:-12,z:0};players.at(-1).position={x:-11.5,z:0};
 const p=plan(players,{carrier,opponents,ball:carrier.position});const dm=players.find(x=>x.userData.slot.position==='DM');
 assert.equal(p.targets.get(dm).duty,'Cover');assert.ok(p.targets.get(dm).x<-12);assert.ok(Math.abs(p.targets.get(dm).z)<.1);
});
