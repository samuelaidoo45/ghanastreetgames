import test from 'node:test';
import assert from 'node:assert/strict';
import {THREE,World} from '../dist/world.js';
import {FourCorners} from '../dist/four-corners.js';
import {catalogue} from '../dist/catalogue.js';
import {liveAdapter} from '../dist/live-adapters.js';
import {startLive} from '../cloudflare/live-room.js';

globalThis.document={createElement:()=>({width:512,height:128,getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
function harness(settings={}){
 const world={stage:new THREE.Group(),canvas:{style:{}},setCamera(){},clear:World.prototype.clear,court:World.prototype.court,goal:World.prototype.goal};
 const input={target:null,sprint:false,vector:()=>({x:0,z:0})},results=[];
 const m=new FourCorners({world,input,game:catalogue.find(g=>g.id==='fourcorners'),settings:{color:0xc05336,...settings},ui:{actions(){},status(){},context(){},note(){},sound(){},end(r){results.push(r);}}});
 m.phase='play';return {m,input,results,close:()=>world.clear()};
}
for(const seat of [0,1,2,3])test(`Four Corners seat ${seat} collects and dribbles the same physical ball`,()=>{
 const h=harness(),m=h.m;m.networked=true;m.b.position.copy(m.players[seat].position).add(new THREE.Vector3(.25,.12,0));m.v.set(0,0,0);m.cool=0;m.tick(1/60,0);assert.equal(m.carrier,seat);assert.equal(m.lastTouch,seat);
 for(let i=0;i<30;i++){m.players[seat].position.x+=.02;m.players[seat].userData.run=1;m.tick(1/60,i/60);assert.equal(m.carrier,seat);assert.ok(m.b.position.distanceTo(m.players[seat].position)<1);}
 assert.ok(Math.abs(m.b.rotation.x)+Math.abs(m.b.rotation.z)>1);h.close();
});
test('Four Corners high-speed shots deflect from an actual body without tunnelling or becoming a catch',()=>{
 const h=harness(),m=h.m;m.players[0].position.set(0,0,0);const before=new THREE.Vector3(-1,.2,0);m.b.position.set(1,.2,0);m.v.set(24,0,0);m.contactBall(before);assert.equal(m.carrier,null);assert.equal(m.lastTouch,0);assert.ok(m.v.x<0);assert.ok(m.b.position.x<0);h.close();
});
test('a placed shot can beat a central defender and score at different simulation rates',()=>{
 for(const dt of [1/30,1/60,1/120]){const h=harness(),m=h.m;m.networked=true;m.players[0].position.set(0,0,-4);m.players[3].position.set(0,0,-8.2);m.b.position.set(0,.12,-4.5);m.carrier=0;m.cool=0;
  assert.equal(m.kick(0,3,1),true);for(let t=0;t<1&&m.phase==='play';t+=dt)m.tick(dt,t);
  assert.equal(m.lives[3],2);assert.equal(m.goalsScored[0],1);assert.equal(m.score,1);h.close();}
});
test('tackles need range, face the ball and cannot repeat through a cooldown',()=>{
 const h=harness(),m=h.m;m.players[0].position.set(0,0,0);m.players[1].position.set(0,0,1);m.b.position.set(0,.12,.9);m.carrier=1;m.you.rotation.y=Math.PI;
 assert.equal(m.tackle(0),false);m.you.rotation.y=0;assert.equal(m.tackle(0),false);m.age=1;assert.equal(m.tackle(0),true);assert.equal(m.carrier,null);assert.ok(m.v.z>0);h.close();
});
test('a dodge briefly shields possession, costs energy and has a recovery period',()=>{
 const h=harness(),m=h.m;m.carrier=1;m.players[1].position.set(0,0,1);m.players[0].position.set(0,0,0);m.you.rotation.y=0;m.b.position.set(0,.12,.9);
 assert.equal(m.feint(1),true);assert.ok(m.players[1].userData.stamina<1);assert.equal(m.feint(1),false);assert.equal(m.tackle(0),false);assert.equal(m.carrier,1);m.age=2;assert.equal(m.feint(1),true);h.close();
});
test('idle human does not stop a bot contesting the ball, and only one bot presses',()=>{
 const h=harness(),m=h.m;m.b.position.set(-.2,.12,0);m.v.set(0,0,0);m.think();assert.equal(m.plans.slice(1).filter(p=>p.press).length,1);
 for(let t=0;t<4&&m.lastTouch<0;t+=1/60)m.tick(1/60,t);assert.ok(m.lastTouch>0);h.close();
});
test('opponents carry into an attack before shooting, instead of kicking every contact',()=>{
 const h=harness(),m=h.m;m.players[1].position.set(0,0,2);m.b.position.set(0,.12,1.5);m.players[1].rotation.y=Math.PI;m.takeBall(1);const start=m.players[1].position.clone();
 for(let i=0;i<20;i++)m.tick(1/60,i/60);assert.equal(m.carrier,1);assert.ok(m.players[1].position.distanceTo(start)>.2);
 let struck=false;for(let i=0;i<240&&!struck;i++){m.tick(1/60,i/60);struck=m.lastTouch===1&&m.carrier===null&&m.v.length()>8;}assert.ok(struck);h.close();
});
test('carrying never triggers the dead-ball timer and eliminated goals cannot be targeted',()=>{
 const h=harness(),m=h.m;m.networked=true;m.carrier=2;m.b.position.copy(m.players[2].position).add(new THREE.Vector3(0,.12,.4));m.time=200;m.stillTime=0;m.tick(.02,0);assert.equal(m.phase,'play');
 m.active[1]=false;m.active[3]=false;assert.equal(m.pickGoal(0),2);m.aim=1;assert.equal(m.selectTarget(0),2);assert.equal(m.kick(2,1),false);h.close();
});
test('one-touch rules still reject a second strike and disallow dribbling and dodge',()=>{
 const h=harness({cornersTouch:'one'}),m=h.m;m.networked=true;m.b.position.copy(m.you.position).setY(.12);m.v.set(0,0,0);m.tick(.01,0);assert.equal(m.carrier,null);assert.equal(m.feint(0),false);
 assert.equal(m.kick(0,1),true);m.cool=0;assert.equal(m.kick(0,2),false);h.close();
});
test('four human seats use the shared possession, tackle and skill rules without bots',()=>{
 const h=harness(),m=h.m,room={game:'fourcorners',type:'live',players:Array.from({length:4},(_,i)=>({id:String(i),name:'Friend '+i})),phase:'playing',startedAt:0};startLive(room);const a=liveAdapter(m,room);m.update=a.update;
 const positions=m.players.map(p=>p.position.clone());m.b.position.set(0,.12,0);m.v.set(0,0,0);for(let i=0;i<30;i++)m.tick(1/60,i/60);m.players.forEach((p,i)=>assert.ok(p.position.equals(positions[i])));
 m.b.position.copy(m.players[2].position).setY(.12);m.tick(1/60,1);assert.equal(m.carrier,2);a.action(2,{action:'feint',x:0,z:1});m.tick(.05,2);assert.ok(m.players[2].position.z>positions[2].z);m.cool=0;
 a.action(2,{action:'kick',power:.7,x:0,z:0});assert.equal(m.carrier,null);assert.equal(m.lastTouch,2);assert.ok(m.v.length()>10);assert.ok(a.controls(2).some(x=>x.id==='feint'));h.close();
});

test('four-corner dribbling rolls between touches and releases a ball outside control range',()=>{
 const h=harness(),m=h.m;m.networked=true;const p=m.you;p.position.set(0,0,0);p.rotation.y=0;m.b.position.set(0,.12,.45);m.takeBall(0);p.userData.velocity.set(0,0,5);
 for(let n=0;n<8;n++){p.position.z+=5/60;m.tick(1/60,n/60);}
 assert.ok(m.v.z>0);assert.ok(m.b.position.z>p.position.z);assert.equal(m.carrier,0);
 m.b.position.z=p.position.z+2.2;m.tick(1/60,1);assert.equal(m.carrier,null);assert.ok(m.v.z>0);h.close();
});
test('an early tackle stays active briefly so moving into reach can win the ball',()=>{
 const h=harness(),m=h.m;m.networked=true;m.you.position.set(0,0,0);m.you.rotation.y=0;m.players[1].position.set(0,0,1.5);m.b.position.set(0,.12,1.4);m.carrier=1;m.cool=0;
 assert.equal(m.tackle(0),false);m.you.position.z=.3;m.age=.08;assert.equal(m.challenge(0),true);assert.equal(m.carrier,null);assert.equal(m.lastTouch,0);assert.equal(m.tackle(0),false);h.close();
});
test('attack selection values a clear lane over the nearest defended goal',()=>{
 const h=harness(),m=h.m;m.you.position.set(0,0,0);m.players[1].position.set(0,0,6);m.players[2].position.set(6,0,0);m.players[3].position.set(0,0,-6);
 const exposed=m.lane(0,3).score;m.players[3].position.set(6,0,-3);assert.ok(m.lane(0,3).score>exposed);assert.equal(m.pickGoal(0),3);h.close();
});
test('off-ball defenders step into distinct lanes instead of camping beside their goals',()=>{
 const h=harness(),m=h.m;m.b.position.set(0,.12,0);m.think();const covers=m.plans.map((plan,i)=>({plan,i})).filter(x=>x.i&& !x.plan.press);
 for(const {plan,i} of covers)assert.ok(plan.target.distanceTo(m.goals[i].center)>3);assert.ok(covers[0].plan.target.distanceTo(covers[1].plan.target)>2);h.close();
});

test('defender can block a close shot during the kicker’s pickup cooldown',()=>{
 const h=harness(),m=h.m;m.carrier=null;m.lastTouch=1;m.cool=.18;m.you.position.set(0,0,0);
 const before=new THREE.Vector3(-1,.2,0);m.b.position.set(1,.2,0);m.v.set(20,0,0);
 m.contactBall(before);assert.ok(m.v.x<0);assert.equal(m.lastTouch,0);h.close();
});
test('contextual Tackle leaves a recoverable loose ball alongside the separate Press action',()=>{
 const h=harness(),m=h.m;m.you.position.set(0,0,0);m.you.rotation.y=0;m.players[1].position.set(0,0,1.2);m.b.position.set(0,.12,1);m.carrier=1;m.cool=0;
 assert.equal(m.actions.find(a=>a.id==='press').charge,undefined);m.action('kick');assert.equal(m.carrier,null);assert.ok(m.v.length()<3);assert.ok(m.you.userData.challengeUntil===0);h.close();
});
test('Recover runs goal-side and steering immediately returns manual control',()=>{
 const h=harness(),m=h.m;m.you.position.set(0,0,0);m.carrier=1;m.b.position.set(3,.12,0);
 m.action('feint');assert.ok(m.you.userData.recoverUntil>m.age);
 for(let frame=0;frame<90;frame++)m.tick(1/60,frame/60);
 assert.ok(m.you.position.x<-4,'recover toward the left-hand home goal');
 assert.deepEqual(m.recoveryInput(0,{x:0,z:1}),{x:0,z:1});assert.equal(m.you.userData.recoverUntil,0);h.close();
});
test('a close CPU challenger gives the carrier time to turn before tackling',()=>{
 const h=harness(),m=h.m;m.age=1;m.carrier=0;m.you.position.set(0,0,0);m.b.position.set(0,.12,.5);m.you.rotation.y=0;m.players[1].position.set(0,0,1.2);m.players[1].rotation.y=Math.PI;m.players[2].position.set(8,0,8);m.players[3].position.set(-8,0,-8);m.cool=0;
 m.update(0);assert.equal(m.carrier,0);assert.ok(m.players[1].userData.challengeReady>m.age);
 m.age+=.4;m.update(0);assert.equal(m.carrier,null);h.close();
});
test('CPU shot has a visible wind-up and can be interrupted by a tackle',()=>{
 const h=harness(),m=h.m;m.age=1;m.carrier=1;m.cool=0;m.players[1].position.set(0,0,-5);m.b.position.set(0,.12,-5.5);m.players[3].position.set(7,0,7);m.players[1].rotation.y=Math.PI;m.players[1].userData.carryTime=4;m.think();m.nextThink=10;
 m.update(0);assert.equal(m.carrier,1);assert.ok(m.players[1].userData.shotAt>m.age);assert.ok(m.players[1].userData.kick>0);
 m.you.position.set(0,0,-6.5);m.you.rotation.y=0;m.action('tackle');assert.equal(m.carrier,null);h.close();
});

test('Four Corners replaces target cycling with Dodge/Defend in solo and friend controls',()=>{
 const h=harness(),m=h.m;assert.ok(!m.actions.some(a=>a.id==='target'));assert.equal(m.actions.find(a=>a.id==='feint').label,'Defend');
 const a=liveAdapter(m,{game:'fourcorners',type:'live',players:m.players.map((_,i)=>({id:String(i),name:'Friend'})),state:{seat:0,scores:[0,0,0,0]}});
 assert.ok(!a.controls(2).some(b=>b.id==='target'));assert.equal(a.controls(2).find(b=>b.id==='feint').label,'Defend');m.carrier=2;assert.equal(a.controls(2).find(b=>b.id==='feint').label,'Dodge');h.close();
 const one=harness({cornersTouch:'one'});assert.equal(one.m.actions.find(a=>a.id==='recover').label,'Defend');one.close();
});
test('shooting automatically resolves an active goal at release without a Target button',()=>{
 const h=harness(),m=h.m;m.you.position.set(0,0,0);m.b.position.set(0,.12,.5);m.carrier=0;m.cool=0;m.age=1;m.aim=1;m.active[1]=false;m.active[2]=false;
 m.action('kick');assert.equal(m.lastTouch,0);assert.equal(m.shotHistory[0][3],1);assert.equal(m.aim,3);
 m.networked=true;m.players[2].userData.liveTarget=1;m.players[2].userData.liveAimUntil=0;assert.equal(m.shotGoal(2),m.pickGoal(2));h.close();
});
