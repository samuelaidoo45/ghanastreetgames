import {goalLane,rollingTouch} from './corner-tactics.js';
import {Mode} from './mode-base.js';
import {THREE,distance} from './world.js';
import {goalSpec} from './goal-markers.js';
import {pitchSurface,pitchTypes,pitchType} from './football-assets.js';
import {goalFrame,collideGoalFrames,crossedGoal,sweepCapsule} from './football-physics.js';
import {matchBall,clamp,stepBall,sweptDistance,chalk,streetGoal} from './ball-physics.js';
import {separatePlayers,avoidPlayers} from './street-ball-control.js';

const names=['YOU','KOJO','NII','KOFI'],colors=[0xc05336,0x326b85,0xb59546,0x468367];
const flatDistance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export class FourCorners extends Mode{
 constructor(ctx){
  super(ctx);this.players=[];this.goals=[];this.active=[true,true,true,true];
  this.startLives=[1,3,5].includes(Number(this.settings.cornersLives))?Number(this.settings.cornersLives):3;
  this.lives=Array(4).fill(this.startLives);this.conceded=[0,0,0,0];this.goalsScored=[0,0,0,0];this.shotHistory=Array.from({length:4},()=>[0,0,0,0]);
  this.oneTouch=this.settings.cornersTouch==='one';this.layout='sides';this.goalSpec=goalSpec(this.settings.goalStyle,1.25);
  this.surfaceType=pitchType(this.game.id,this.settings.pitchSurface);this.surface=pitchTypes[this.surfaceType];pitchSurface(this.root,20,20,this.surfaceType);
  this.world.setCamera([0,15,18,0,.4,0]);this.cameraView=0;
  [[-9,0],[0,9],[9,0],[0,-9]].forEach(([x,z],i)=>{
   const normal=new THREE.Vector3(x,0,z).normalize(),g=goalFrame(x,z,normal.x,normal.z,2.5,this.goalSpec.height,this.goalSpec);
   g.mesh=streetGoal(this.root,x,z,Math.atan2(-normal.z,normal.x),g.width,g.height,this.goalSpec.style);this.goals.push(g);
   const p=this.player(x*.7,z*.7,i?colors[i]:this.settings.color);p.rotation.y=Math.atan2(-x,-z);
   Object.assign(p.userData,{id:i,velocity:new THREE.Vector3(),stamina:1,tackleUntil:0,skillUntil:0,shieldUntil:0,carryTime:0});this.players.push(p);
   this.text(names[i],x,1.8,z,'#eddcb0',.22);this.circle(x,z,.35,colors[i]);
  });
  for(const [x,z,w,d] of [[0,-10,20,.035],[0,10,20,.035],[-10,0,.035,20],[10,0,.035,20]])chalk(this.root,x,z,w,d);
  this.you=this.players[0];this.b=matchBall(this.root);this.v=new THREE.Vector3();this.marker=this.circle(0,0,.48);
  this.targetMarker=this.circle(0,9,.55,0xa9c8d0);this.aimGuide=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),2,0xffd478,.3,.18);this.root.add(this.aimGuide);this.aimGuide.visible=false;
  this.aim=1;this.manualAimUntil=0;this.lastTouch=-1;this.cool=0;this.charge=null;this.carrier=null;this.round=0;this.nextThink=0;this.plans=[];this.stillTime=0;
  this.setActions([{id:'kick',label:'Shoot',key:'Space',charge:true},{id:'tackle',label:'Tackle',key:'F'},{id:'target',label:'Next goal',key:'E'},this.oneTouch?{id:'recover',label:'Recover',key:'Q'}:{id:'feint',label:'Dodge',key:'Q'},{id:'chip',label:'Chip',key:'R'},{id:'sprint',label:'Sprint',key:'Shift',hold:true}]);
  this.serve();this.note(`${this.startLives} lives each. Defend your side. ${this.oneTouch?'One touch until someone else plays the ball.':'Collect, dribble and attack an exposed goal.'} Tap Shoot for a quick strike; hold for power. Tap Tackle to challenge. Recover helps you protect your goal; steer to take over.`);
 }
 name(i){return this.roomPlayers?.[i]?.name||names[i];}
 serve(){
  this.phase='serve';this.time=0;this.lastTouch=-1;this.carrier=null;this.charge=null;this.cool=0;this.stillTime=0;this.nextThink=0;this.aimGuide.visible=false;
  this.b.position.set(0,2.5,0);this.v.set((Math.random()-.5)*1.3,0,(Math.random()-.5)*1.3);
  this.players.forEach((p,i)=>{p.position.copy(this.goals[i].center).multiplyScalar(.7);p.position.y=0;p.rotation.y=Math.atan2(-p.position.x,-p.position.z);p.userData.velocity.set(0,0,0);p.userData.run=0;p.userData.dribble=0;p.userData.carryTime=0;p.userData.stamina=1;p.userData.tackleUntil=0;p.userData.challengeUntil=0;p.userData.controlUntil=0;p.userData.recoverUntil=0;p.userData.challengeReady=0;p.userData.shotAt=0;p.userData.footTimer=0;p.userData.skillUntil=0;p.userData.shieldUntil=0;});
 }
 cycleCamera(){this.cameraView=(this.cameraView+1)%3;this.world.setCamera([[0,15,18,0,.4,0],[-14,9,14,0,.4,0],[0,25,6,0,0,0]][this.cameraView]);}
 hold(){if(this.phase==='play')this.charge=this.age;}
 lane(i,target){return goalLane(this.players[i].position,this.goals[target],this.players.filter((_,j)=>j!==i&&this.active[j]),this.shotHistory[i][target]);}
 pickGoal(i){
  const targets=this.active.flatMap((on,j)=>on&&j!==i?[j]:[]);
  return targets.sort((a,b)=>this.lane(i,b).score-this.lane(i,a).score)[0]??i;
 }
 shotPoint(i,target,steer=0){
  const g=this.goals[target];
  if(Math.abs(steer)>.18)return g.center.clone().addScaledVector(new THREE.Vector3(-g.normal.z,0,g.normal.x),clamp(steer,-1,1)*(g.width/2-.26)).addScaledVector(g.normal,.3);
  return this.lane(i,target).point;
 }
 selectTarget(i){
  const p=this.players[i],current=i===0?this.aim:p.userData.liveTarget;
  const targets=this.active.flatMap((on,j)=>on&&j!==i?[j]:[]),next=targets[(targets.indexOf(current)+1)%targets.length]??i;
  if(i===0){this.aim=next;this.manualAimUntil=this.age+6;}p.userData.liveTarget=next;return next;
 }
 action(id){
  if(this.phase!=='play'||!this.active[0])return;
  if(id==='target'){this.selectTarget(0);return;}if(id==='tackle'){this.tackle(0);return;}if(id==='recover'||id==='feint'&&this.carrier!==0){this.recover(0);return;}if(id==='feint'){this.feint(0);return;}
  if(!['kick','chip'].includes(id))return;
  const power=this.charge===null?.5:clamp((this.age-this.charge)/.85,.2,1);this.charge=null;
  if(this.carrier!==null&&this.carrier!==0){this.tackle(0);return;}
  const direction=this.world.movementVector?.(this.input.vector())||this.input.vector(),g=this.goals[this.aim],steer=-g.normal.z*direction.x+g.normal.x*direction.z;
  if(!this.kick(0,this.aim,power,id==='chip',steer))this.tackle(0);
 }
 kick(i,target,power=.5,chip=false,steer=0){
  if(this.phase!=='play'||!this.active[i]||!this.active[target]||target===i||this.oneTouch&&this.lastTouch===i||this.cool>0||this.carrier!==null&&this.carrier!==i||distance(this.players[i],this.b)>1.15||this.b.position.y>1.3)return false;
  const point=this.shotPoint(i,target,steer);
  // CPU feet are not a laser: distance and nearby pressure make placement harder.
  if(i!==0&&!this.networked){const g=this.goals[target],range=point.distanceTo(this.b.position),pressure=this.players.some((p,j)=>j!==i&&this.active[j]&&distance(p,this.players[i])<1.6);point.addScaledVector(new THREE.Vector3(-g.normal.z,0,g.normal.x),(Math.random()-.5)*(.3+range*.055+(pressure?.35:0))*this.difficultyTuning.error);}
  const aim=point.sub(this.b.position);aim.y=0;this.v.copy(aim.normalize().multiplyScalar(chip?10+power*6:12+power*11));
  this.v.y=chip?3+power*1.3:.25+power*.3;this.carrier=null;this.lastTouch=i;this.cool=.2;
  this.shotHistory[i][target]++;this.players[i].userData.kick=.38;this.players[i].userData.carryTime=0;this.players[i].userData.shotAt=0;this.ui.sound('kick');return true;
 }
 takeBall(i){this.carrier=i;this.lastTouch=i;this.v.set(0,0,0);this.players[i].userData.carryTime=0;this.players[i].userData.shotAt=0;this.players[i].userData.challengeReady=0;this.players[i].userData.footTimer=0;this.players[i].userData.controlUntil=this.age+.38;this.cool=.12;this.nextThink=0;}
 tackle(i){
  const p=this.players[i];if(this.phase!=='play'||!this.active[i]||this.age<p.userData.tackleUntil||this.carrier===i||this.oneTouch&&this.lastTouch===i)return false;
  p.userData.tackleUntil=this.age+.65;p.userData.challengeUntil=this.age+.4;p.userData.kick=.25;
  return this.challenge(i);
 }
 challenge(i){
  const p=this.players[i],u=p.userData,dx=this.b.position.x-p.position.x,dz=this.b.position.z-p.position.z,d=Math.hypot(dx,dz);
  if(this.age>=(u.challengeUntil||0)||this.carrier===i||this.cool>0||this.b.position.y>.65||d>1.3||Math.sin(p.rotation.y)*dx+Math.cos(p.rotation.y)*dz<-.15)return false;
  if(this.carrier===null){if(!this.oneTouch&&this.v.length()<8){this.takeBall(i);u.challengeUntil=0;return true;}return false;}
  const q=this.players[this.carrier];if(this.age<q.userData.shieldUntil||this.age<(q.userData.controlUntil||0))return false;
  this.carrier=null;this.lastTouch=i;this.v.set(dx/(d||1)*2.6,.12,dz/(d||1)*2.6);this.cool=.16;q.userData.carryTime=0;u.challengeUntil=0;this.ui.sound('kick');if(i===0)this.note('Ball won. Follow your touch!');return true;
 }
 feint(i,direction=null){
  const p=this.players[i],u=p.userData;if(this.phase!=='play'||!this.active[i]||this.oneTouch||this.age<u.skillUntil||u.stamina<.18)return false;
  u.skillUntil=this.age+1.6;u.shieldUntil=this.age+.5;u.stamina-=.18;
  const v=direction|| (i===0?(this.world.movementVector?.(this.input.vector())||this.input.vector()):{x:Math.cos(p.rotation.y),z:-Math.sin(p.rotation.y)});
  const length=Math.hypot(v.x,v.z),x=length>.1?v.x/length:Math.cos(p.rotation.y),z=length>.1?v.z/length:-Math.sin(p.rotation.y);
  u.velocity.set(x*8,0,z*8);u.burstUntil=this.age+.16;return true;
 }
 recover(i){
  if(this.phase!=='play'||!this.active[i]||this.carrier===i)return false;
  this.players[i].userData.recoverUntil=this.age+3;
  if(i===0){this.input.target=null;this.note('Recovering to your goal. Steer to take over; tap Tackle when close.');}return true;
 }
 recoveryInput(i,raw){
  const p=this.players[i],u=p.userData;
  if(Math.hypot(raw.x,raw.z)>.15||this.carrier===i){u.recoverUntil=0;return raw;}
  if(this.age>=(u.recoverUntil||0))return raw;
  const g=this.goals[i],side=new THREE.Vector3(-g.normal.z,0,g.normal.x);
  const incoming=this.v.dot(g.normal),eta=this.carrier===null&&incoming>0?clamp(g.center.clone().sub(this.b.position).dot(g.normal)/incoming,0,.8):0;
  const intercept=this.b.position.clone().addScaledVector(this.v,eta),offset=clamp(intercept.sub(g.center).dot(side),-1.35,1.35);
  const target=g.center.clone().addScaledVector(g.normal,-1.15).addScaledVector(side,offset),delta=target.sub(p.position);delta.y=0;
  if(delta.length()<.25){u.recoverUntil=0;return {x:0,z:0};}delta.normalize();return {x:delta.x,z:delta.z};
 }
 advance(p,target,speed,dt){
  if(p.userData.networkControlled)return;
  const u=p.userData,dx=target.x-p.position.x,dz=target.z-p.position.z,d=Math.hypot(dx,dz),strength=Math.min(1,d/1.4);
  const desired=new THREE.Vector3(d>.03?dx/d*speed*strength:0,0,d>.03?dz/d*speed*strength:0);
  if(this.age>=(u.burstUntil||0))u.velocity.lerp(desired,1-Math.exp(-dt*(d>.1?12:20)));
  p.position.addScaledVector(u.velocity,dt);p.position.x=clamp(p.position.x,-9.2,9.2);p.position.z=clamp(p.position.z,-9.2,9.2);
  u.run=Math.min(1,u.velocity.length()/4.7);u.pose=this.carrier!==u.id&&u.run<.2?'defend':'idle';
  if(u.run>.05){const angle=Math.atan2(u.velocity.x,u.velocity.z),delta=Math.atan2(Math.sin(angle-p.rotation.y),Math.cos(angle-p.rotation.y));p.rotation.y+=delta*(1-Math.exp(-dt*18));u.lean=clamp(-delta*u.run*.1,-.13,.13);}else{u.lean=0;if(this.carrier!==u.id){const angle=Math.atan2(this.b.position.x-p.position.x,this.b.position.z-p.position.z);p.rotation.y+=Math.atan2(Math.sin(angle-p.rotation.y),Math.cos(angle-p.rotation.y))*(1-Math.exp(-dt*8));}}
 }
 defend(i){
  const g=this.goals[i],toward=this.b.position.clone().sub(g.center);toward.y=0;
  const incoming=this.v.dot(g.normal),eta=incoming>.1?g.center.clone().sub(this.b.position).dot(g.normal)/incoming:Infinity;
  if(this.carrier===null&&eta>0&&eta<1.5){const point=this.b.position.clone().addScaledVector(this.v,eta),side=new THREE.Vector3(-g.normal.z,0,g.normal.x),offset=clamp(point.sub(g.center).dot(side),-1.9,1.9);return g.center.clone().addScaledVector(g.normal,-.75).addScaledVector(side,offset);}
  const range=toward.length(),advance=clamp(range*.48,1.3,5.8),direction=toward.normalize();return g.center.clone().addScaledVector(direction,advance).addScaledVector(new THREE.Vector3(-direction.z,0,direction.x),(i%2?1:-1)*Math.min(1.1,range*.09));
 }
 think(){
  const eligible=this.active.flatMap((on,i)=>on&&i!==this.carrier&&(!this.oneTouch||this.lastTouch!==i)?[i]:[]);
  eligible.sort((a,b)=>distance(this.players[a],this.b)-distance(this.players[b],this.b));
  const challenger=eligible.find(i=>i!==0||this.players[0].userData.run>.1&&distance(this.you,this.b)<2);
  this.plans=this.players.map((p,i)=>{
   if(!this.active[i])return null;
   if(this.carrier===i){
    const target=this.pickGoal(i),g=this.goals[target],lane=this.shotPoint(i,target),nearest=eligible[0];
    let destination=g.center.clone().addScaledVector(g.normal,-3.6);destination.addScaledVector(new THREE.Vector3(-g.normal.z,0,g.normal.x),lane.clone().sub(g.center).dot(new THREE.Vector3(-g.normal.z,0,g.normal.x)));
    if(nearest!==undefined&&distance(p,this.players[nearest])<1.8){const q=this.players[nearest],away=p.position.clone().sub(q.position).normalize();destination.addScaledVector(away,2.1);}
    return {target:destination,goal:target,speed:4.7};
   }
   if(i===challenger){const intercept=this.carrier===null?this.b.position.clone().addScaledVector(this.v,Math.min(.38,distance(p,this.b)/9)):this.b.position.clone();intercept.y=0;return {target:intercept,speed:5.1,press:true};}
   return {target:this.defend(i),speed:4.6};
  });
  if(this.age>this.manualAimUntil||!this.active[this.aim])this.aim=this.pickGoal(0);
 }
 concede(i){
  if(!this.active[i])return;
  const scorer=this.lastTouch;if(scorer>=0&&scorer!==i){this.goalsScored[scorer]++;if(scorer===0)this.score++;}
  this.lives[i]--;this.ui.cornerScores?.(this.lives);this.conceded[i]++;this.round++;this.phase='result';this.time=0;this.carrier=null;this.charge=null;this.aimGuide.visible=false;this.players.forEach(p=>{p.userData.run=0;p.userData.dribble=0;});this.ui.sound('goal');
  if(this.lives[i]>0){this.note(`${scorer>=0&&scorer!==i?this.name(scorer)+' scores! ':''}${this.name(i)} has ${this.lives[i]} ${this.lives[i]===1?'life':'lives'} left.`);return;}
  this.active[i]=false;this.players[i].visible=false;this.goals[i].mesh.visible=false;this.note(`${this.name(i)} is out. ${this.active.filter(Boolean).length} defenders remain.`);
  if(i===0){const rank=this.active.filter(Boolean).length+1;this.finish('YOUR CORNER WAS BEATEN',`You finished ${rank}${rank===2?'nd':rank===3?'rd':'th'} with ${this.goalsScored[0]} goals.`,false);}
  else if(this.active.filter(Boolean).length===1){this.score=Math.max(3,this.goalsScored[0]);this.finish('LAST CORNER STANDING',`You protected your side and scored ${this.goalsScored[0]} goals.`);}
 }
 hit({point}){if(!point)return;const i=this.goals.findIndex((g,i)=>i!==0&&this.active[i]&&flatDistance(g.center,point)<1.8);if(i>=0){this.aim=i;this.manualAimUntil=this.age+6;}else this.input.target=point;}
 contactBall(before,{trap=true,block=true}={}){
  if(this.carrier!==null)return;
  const candidates=this.players.map((p,i)=>({p,i,d:flatDistance(p.position,this.b.position)})).filter(({i})=>this.active[i]&&(this.cool<=0||i!==this.lastTouch)&&(!this.oneTouch||this.lastTouch!==i)).sort((a,b)=>a.d-b.d);
  for(const {p,i,d} of candidates){
   const speed=Math.hypot(this.v.x,this.v.z);
   if(trap&&this.cool<=0&&!this.oneTouch&&d<.85&&this.b.position.y<.55&&speed<9){this.takeBall(i);return;}
   if(!block)continue;
   // A shot hits a body only along its swept flight, so a defender cannot vacuum up a wide shot.
   const hit=sweepCapsule(before,this.b.position,p.position.clone().setY(.2),p.position.clone().setY(1.25),.43);
   if(!hit)continue;
   const n=hit.normal.clone().setY(0).normalize();
   if(this.v.dot(n)>=0)continue;
   this.v.addScaledVector(n,-1.5*this.v.dot(n));this.v.multiplyScalar(.74);this.v.y=Math.max(.35,this.v.y);this.b.position.copy(hit.point).addScaledVector(n,.03);this.lastTouch=i;this.cool=.18;this.ui.sound('ballHit');return;
  }
 }
 update(dt){
  this.cool=Math.max(0,this.cool-dt);this.ui.power?.(this.charge===null?0:clamp((this.age-this.charge)/.85,0,1));this.ui.cornerScores?.(this.lives);
  const context=this.carrier===0?'carry':this.oneTouch?'one':'defend';if(context!==this.contextKey){this.contextKey=context;this.ui.context?.({kick:'Shoot',feint:this.carrier===0?'Dodge':'Recover'});}
  this.status(`${this.active.filter(Boolean).length} CORNERS · ${this.goalsScored[0]} GOALS`,this.phase==='play'?(this.oneTouch&&this.lastTouch===0?'WAIT FOR ANOTHER TOUCH':'ATTACK: '+this.name(this.aim)):'NEXT BALL');
  if(this.phase==='result'){if(this.time>1.45)this.serve();return;}
  if(this.phase==='serve'){stepBall(this.b,this.v,dt,{bounce:this.surface.bounce});if(this.b.position.y<=.14){this.phase='play';this.time=0;this.lastTouch=-1;this.note('Ball bounced. Play!');}return;}
  const before=this.b.position.clone(),field=this.players.filter((_,i)=>this.active[i]);
  if(this.age>=this.nextThink){this.think();this.nextThink=this.age+.16;}
  for(let i=0;i<4;i++){
   if(!this.active[i])continue;const p=this.players[i],u=p.userData;u.dribble=0;u.stamina=clamp(u.stamina+dt*.14,0,1);
   if(this.networked)continue;
   if(i===0){const raw=this.recoveryInput(i,this.world.movementVector?.(this.input.vector())||this.input.vector()),target=raw.x||raw.z?{x:p.position.x+raw.x*3,z:p.position.z+raw.z*3}:this.input.target||p.position,run=(this.input.sprint||this.age<(u.recoverUntil||0))&&u.stamina>.08;if(run)u.stamina=Math.max(0,u.stamina-dt*.34);this.advance(p,target,run?6.4:4.5,dt);continue;}
   const plan=this.plans[i];if(!plan)continue;
   this.advance(p,avoidPlayers(p,plan.target,field,1.1),(u.shotAt?1.8:plan.speed)*(this.settings.difficulty==='easy'?.87:this.settings.difficulty==='hard'?1.06:this.difficultyTuning.speed),dt);
   if(this.carrier===i){u.carryTime+=dt;const lane=this.lane(i,plan.goal),blocked=lane.openness<.55,goalDistance=lane.distance;
    if(u.shotAt){
     if(this.age>=u.shotAt){this.kick(i,u.shotGoal,.4+Math.min(.28,goalDistance/40));u.shotAt=0;}
    }else if(u.carryTime>.9*this.difficultyTuning.window&&(!blocked&&goalDistance<12||u.carryTime>3.4)){u.shotAt=this.age+.3*this.difficultyTuning.window;u.shotGoal=plan.goal;u.kick=.4;}

   }else if(plan.press&&this.carrier!==null&&distance(p,this.b)<1.35){
    u.shotAt=0;if(!u.challengeReady)u.challengeReady=this.age+.3*this.difficultyTuning.window;
    if(this.age>=u.challengeReady)this.tackle(i);
   }else{u.challengeReady=0;u.shotAt=0;}

   if(this.oneTouch&&distance(p,this.b)<1.05&&this.b.position.y<1.2)this.kick(i,this.pickGoal(i),.6);
  }
  separatePlayers(field,.85,9.2);
  for(let i=0;i<4;i++)if(this.active[i]&&this.age<(this.players[i].userData.challengeUntil||0))this.challenge(i);
  if(this.carrier!==null){const p=this.players[this.carrier];if(!rollingTouch(this.b,this.v,p,dt,this.age)){this.carrier=null;this.cool=.1;stepBall(this.b,this.v,dt,{drag:this.surface.drag,bounce:this.surface.bounce});}}
  else stepBall(this.b,this.v,dt,{drag:this.surface.drag,bounce:this.surface.bounce});
  const post=collideGoalFrames(this.b,this.v,before,this.goals.filter((_,i)=>this.active[i]));if(post){this.carrier=null;this.cool=.18;this.ui.sound('stone');}
  if(!post)this.contactBall(before,{trap:false});
  for(let i=0;i<4;i++)if(this.active[i]&&!post&&crossedGoal(before,this.b.position,this.goals[i])){this.concede(i);return;}
  if(!post)this.contactBall(before,{block:false});
  // Restart only an actual dead ball, never a player carrying or contesting it.
  this.stillTime=this.carrier===null&&this.v.length()<.15?this.stillTime+dt:0;
  if(Math.abs(this.b.position.x)>11||Math.abs(this.b.position.z)>11||this.stillTime>8){this.phase='result';this.time=.65;this.carrier=null;this.charge=null;this.note('Out of play. New ball; no life lost.');}
  const seat=this.liveSeat??0,p=this.players[seat]||this.you,target=this.networked?(p.userData.liveTarget??this.pickGoal(seat)):this.aim;
  this.marker.position.set(p.position.x,.035,p.position.z);
  this.aimGuide.visible=this.phase==='play'&&this.carrier===seat&&this.active[target];
  if(this.active[target]){const point=this.shotPoint(seat,target);this.targetMarker.position.set(point.x,.035,point.z);if(this.aimGuide.visible){const d=point.sub(this.b.position);d.y=0;this.aimGuide.position.copy(this.b.position).setY(.08);this.aimGuide.setDirection(d.clone().normalize());this.aimGuide.setLength(Math.min(3,d.length()),.28,.16);}}
 }
}
