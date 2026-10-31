import test from 'node:test';
import assert from 'node:assert/strict';
import {formationFor,planTeam} from '../dist/football-formations.js';
const make=(n,team=0,style='balanced')=>formationFor(n,style).slots.map(slot=>({position:{x:slot.x*15*(team?-1:1),z:slot.z*10},userData:{team,slot}}));
function plan(players,changes={}){return planTeam({players,opponents:make(players.length,1),ball:{x:4,z:3},carrier:null,receiver:null,controlled:null,halfX:15,halfZ:10,now:1,...changes});}
test('every formation assigns exactly the selected outfield count and distinct positions',()=>{
 for(let n=1;n<=7;n++)for(const style of ['balanced','defensive','attacking']){const f=formationFor(n,style);assert.equal(f.slots.length,n);assert.equal(new Set(f.slots.map(s=>s.x+':'+s.z)).size,n);if(n>1){assert.equal(f.slots[0].role,'Defender');assert.equal(f.slots.at(-1).role,'Forward');}}
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
