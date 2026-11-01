import {Mode} from './mode-base.js';
import {THREE,ball,ring,distance,palette} from './world.js';
import {footballBall,pitchSurface,pitchType} from './football-assets.js';
const clamp=THREE.MathUtils.clamp;
function segmentDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return {d:Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t),y:a.y+(b.y-a.y)*t};}
export class Abedemu extends Mode{
 get middleIndex(){return this.throwerIndex;}
 set middleIndex(i){this.throwerIndex=i;}
 constructor(ctx){
  super(ctx);const n=clamp(Math.round(Number(this.settings.abedemuCount)||6),3,6);
  Object.assign(this,{players:[],middleIndex:n-1,points:Array(n).fill(0),streak:0,limit:120,cool:0,swapUntil:0,lastPass:null,carrier:0,lastTouch:0,charge:null,shapeTurn:0});
  this.surfaceType=pitchType(this.game.id,this.settings.pitchSurface);pitchSurface(this.root,18,18,this.surfaceType);this.world.setCamera([0,15,17,0,.5,0]);
  for(let i=0;i<n;i++){
   const angle=i*Math.PI*2/(n-1),home=i===n-1?{x:0,z:0}:{x:Math.sin(angle)*5,z:Math.cos(angle)*5};
   const p=this.player(home.x,home.z,i===0?this.settings.color:i===n-1?0xe3b84f:0x387f86);p.rotation.y=Math.atan2(-home.x,-home.z);
   Object.assign(p.userData,{home,angle,velocity:new THREE.Vector3(),pressUntil:0,pressStarted:0,tackleUntil:0,target:(i+1)%(n-1),nextPass:.65+i*.08,supportAt:0,receiveUntil:0,runUntil:0,controlAt:0});this.players.push(p);
  }
  this.you=this.players[0];this.b=footballBall(this.root,.14)||ball(this.root,.14);this.v=new THREE.Vector3();this.placeBall();
  this.marker=ring(.48,palette.gold,0,5,this.root,.04);this.middleMarker=ring(.5,0xdd633f,0,0,this.root,.045);this.targetMarker=ring(.43,0xeddba8,0,0,this.root,.025);
  ring(6.6,0xd9c7a0,0,0,this.root,.018,.006);this.refreshActions();
  this.note('Move into space and keep the ball moving. In the middle, tap Press to close down and Tackle when you reach the ball. Rushing a passer can force a loose touch.');
 }
 refreshActions(){
  if(this.networked)return;const middle=this.middleIndex===0;if(this.controlsMiddle===middle)return;this.controlsMiddle=middle;
  this.setActions(middle?[{id:'pass',label:'Tackle',key:'Space'},{id:'press',label:'Press',key:'Q'},{id:'sprint',label:'Sprint',key:'Shift',hold:true}]:[{id:'pass',label:'Pass',key:'Space',charge:true},{id:'target',label:'Next player',key:'E'},{id:'press',label:'Call for ball',key:'Q'},{id:'lob',label:'Lob pass',key:'R'},{id:'sprint',label:'Sprint',key:'Shift',hold:true}]);
 }
 name(i){return this.roomPlayers?.[i]?.name||(i===0?'YOU':'PLAYER '+(i+1));}
 pressure(i){return clamp((2.9-distance(this.players[i],this.players[this.middleIndex]))/2.25,0,1);}
 placeBall(){const p=this.players[this.carrier];if(p){const stride=p.userData.run>.1?Math.sin(this.age*12)*.07:0;this.b.position.set(p.position.x+Math.sin(p.rotation.y)*(.48+stride),.14,p.position.z+Math.cos(p.rotation.y)*(.48+stride));}}
 receiver(i,aim={x:0,z:0}){
  const p=this.players[i],mates=this.players.map((q,j)=>({q,j})).filter(o=>o.j!==i&&o.j!==this.middleIndex);
  if(Math.hypot(aim.x||0,aim.z||0)>.2)return mates.sort((a,b)=>{const dot=o=>((o.q.position.x-p.position.x)*aim.x+(o.q.position.z-p.position.z)*aim.z)/Math.max(.01,distance(p,o.q));return dot(b)-dot(a);})[0]?.j;
  return mates.some(o=>o.j===p.userData.target)?p.userData.target:mates[0]?.j;
 }
 hold(id){if(id==='pass'&&this.middleIndex!==0)this.charge=this.age;}
 action(id){const power=this.charge===null?.45:clamp((this.age-this.charge)/1.1,.15,1);this.actionFor(0,id,power,this.world.movementVector?.(this.input.vector())||this.input.vector());this.charge=null;}
 actionFor(i,id,power=.45,aim={x:0,z:0}){
  if(this.done)return;const p=this.players[i];if(!p)return;
  if(i===this.middleIndex){if(id==='pass')this.tackle(i);else if(id==='press')this.startPress(i);return;}
  if(id==='target'){const options=this.players.map((_,j)=>j).filter(j=>j!==i&&j!==this.middleIndex);p.userData.target=options[(options.indexOf(this.receiver(i))+1)%options.length];return;}
  if(id==='press'){const owner=this.players[this.carrier];if(owner&&this.carrier!==i){owner.userData.target=i;owner.userData.calledUntil=this.age+1;if(!this.networked)owner.userData.nextPass=Math.min(owner.userData.nextPass,this.age+.35);this.note(this.name(i)+' calls for the ball.');}return;}
  if(this.carrier!==i||!['pass','lob'].includes(id)||this.cool>0)return;const j=this.receiver(i,aim);if(j===undefined)return;
  const target=this.players[j],pressure=this.pressure(i),speed=(9+clamp(power,0,1)*7)*(1-pressure*.19),lead=clamp(distance(p,target)/speed,0,.4);
  const dir=target.position.clone().addScaledVector(target.userData.velocity,lead).sub(p.position);dir.y=0;dir.normalize();
  // Pressure disturbs contact, not the score: the resulting ball still has to be intercepted.
  const defender=this.players[this.middleIndex],side=Math.sign((defender.position.x-p.position.x)*dir.z-(defender.position.z-p.position.z)*dir.x)||1;
  dir.applyAxisAngle(new THREE.Vector3(0,1,0),side*pressure*(.06+power*.11)*(i===0?1:this.difficultyTuning.error));
  p.rotation.y=Math.atan2(dir.x,dir.z);this.b.position.copy(p.position).addScaledVector(dir,.55);this.b.position.y=.14;
  this.v.copy(dir.multiplyScalar(speed));this.v.y=id==='lob'?4.2:.45;this.carrier=null;this.lastTouch=i;this.lastPass={from:i,to:j};this.cool=.16;
  p.userData.kick=.38;p.userData.runUntil=this.age+2.2;p.userData.supportAt=0;this.shapeTurn+=(i%2?1:-1)*.25;this.ui.sound('kick');
  if(pressure>.5)this.note('Under pressure! Chase the loose pass.');
 }
 startPress(i){
  if(i!==this.middleIndex)return false;const p=this.players[i];
  if(this.age<(p.userData.pressRecovery||0))return false;
  p.userData.pressStarted=this.age;p.userData.pressUntil=this.age+2.6;p.userData.pressRecovery=this.age+3.2;this.input.target=null;
  this.note('Pressing — close the lane, then tackle. Steer to take control.');this.tackle(i);return true;
 }
 pressTarget(i){
  const p=this.players[i];
  if(this.carrier!==null){const owner=this.players[this.carrier],target=owner.position.clone().addScaledVector(owner.userData.velocity,.3),j=this.receiver(this.carrier);
   // Approach the ball-side shoulder to block the next passing lane.
   if(j!==undefined&&distance(p,owner)>2.2){const lane=this.players[j].position.clone().sub(owner.position).normalize();target.addScaledVector(lane,.65);}return target;
  }
  // Choose a reachable intercept point, instead of following the ball's old position.
  let target=this.b.position.clone();for(let t=.08;t<=.55;t+=.08){const q=this.b.position.clone().addScaledVector(this.v,t);q.y=0;if(distance(p,q)<=6.1*t+.8){target=q;break;}target=q;}return target;
 }
 pressInput(i,raw){
  const p=this.players[i];if(i!==this.middleIndex||this.age>=p.userData.pressUntil)return raw;
  if(Math.hypot(raw.x,raw.z)>.2){p.userData.pressUntil=0;return raw;}
  const q=this.pressTarget(i),dx=q.x-p.position.x,dz=q.z-p.position.z,d=Math.hypot(dx,dz);
  if(distance(p,this.b)<1.2)this.tackle(i);
  return d>.15?{x:dx/d,z:dz/d}:{x:0,z:0};
 }
 tackle(i){
  if(i!==this.middleIndex||this.age<this.swapUntil)return false;const p=this.players[i];if(this.age<p.userData.tackleUntil)return false;
  p.userData.tackleUntil=this.age+.6;p.userData.kick=.3;
  if(this.b.position.y<1&&distance(p,this.b)<1.25)return this.intercept(i);
  return false;
 }
 intercept(i){
  if(i!==this.middleIndex||this.age<this.swapUntil)return false;const offender=this.carrier??this.lastTouch;if(offender===i)return false;
  this.points[i]+=2;this.streak=0;this.middleIndex=offender;
  this.players[i].userData.angle=this.players[offender].userData.angle;this.players[i].userData.home={...this.players[offender].userData.home};
  this.carrier=i;this.lastTouch=i;this.lastPass=null;this.v.set(0,0,0);this.swapUntil=this.age+1.1;this.cool=.25;
  for(const p of this.players){p.userData.supportAt=0;p.userData.pressUntil=0;p.userData.receiveUntil=0;}
  this.players[i].userData.nextPass=this.age+.9;this.shapeTurn+=.3;this.placeBall();this.refreshActions();
  this.note((offender===0?'You go':this.name(offender)+' goes')+' into the middle. '+this.name(i)+' wins 2 points.');this.ui.sound('point');return true;
 }
 hit({point}){const i=this.players.findIndex((p,j)=>j!==0&&j!==this.middleIndex&&distance(p,point)<1.2);if(i>=0)this.you.userData.target=i;else this.input.target=point;}
 supportTarget(i){
  const p=this.players[i],u=p.userData,owner=this.players[this.carrier??this.lastPass?.from??this.lastTouch],middle=this.players[this.middleIndex];
  if(this.lastPass?.to===i){const intercept=this.b.position.clone().addScaledVector(this.v,clamp(distance(p,this.b)/12,.05,.25));intercept.x=clamp(intercept.x,-7.8,7.8);intercept.z=clamp(intercept.z,-7.8,7.8);return intercept;}
  if(this.age<u.supportAt&&u.supportTarget)return u.supportTarget;
  const angle=u.angle+this.shapeTurn+Math.sin(this.age*.25+i)*.55,centre={x:clamp(owner.position.x*.23,-1.4,1.4),z:clamp(owner.position.z*.23,-1.4,1.4)};
  let best=null,bestScore=-Infinity;
  for(const turn of [-.7,-.35,0,.35,.7])for(const radius of [3.3,4.6,5.8]){
   const a=angle+turn+(this.age<u.runUntil?.55:0),q={x:clamp(centre.x+Math.sin(a)*radius,-7.4,7.4),y:0,z:clamp(centre.z+Math.cos(a)*radius,-7.4,7.4)};
   const gap=Math.min(...this.players.filter((_,j)=>j!==i&&j!==this.middleIndex).map(other=>distance(other,q)));
   const lane=segmentDistance(middle.position,owner.position,q).d,range=distance(owner,q);
   const score=Math.min(gap,3)*1.7+Math.min(lane,2.4)*1.1+Math.min(distance(middle,q),3)*.35-Math.abs(range-4.8)*.45-distance(p,q)*.24-Math.abs(turn)*.2;
   if(score>bestScore){bestScore=score;best=q;}
  }
  u.supportAt=this.age+.65+(i%3)*.13;u.supportTarget=best;return best;
 }
 carryTarget(i){
  const p=this.players[i],middle=this.players[this.middleIndex],away=p.position.clone().sub(middle.position);away.y=0;away.normalize();
  const mate=this.players[this.receiver(i)],toward=mate?mate.position.clone().sub(p.position).normalize():new THREE.Vector3();
  const pressure=this.pressure(i),sign=i%2?1:-1;
  return {x:clamp(p.position.x+away.x*(1+pressure*2)+toward.x*.6+away.z*sign,-7.2,7.2),z:clamp(p.position.z+away.z*(1+pressure*2)+toward.z*.6-away.x*sign,-7.2,7.2)};
 }
 moveRunner(p,target,speed,dt,faceBall=false){
  const dx=target.x-p.position.x,dz=target.z-p.position.z,d=Math.hypot(dx,dz),pace=Math.min(speed,d*3.5),desired=new THREE.Vector3(d>.08?dx/d*pace:0,0,d>.08?dz/d*pace:0);
  const old=p.position.clone();p.userData.velocity.lerp(desired,1-Math.exp(-dt*8));p.position.addScaledVector(p.userData.velocity,dt);p.position.x=clamp(p.position.x,-8.2,8.2);p.position.z=clamp(p.position.z,-8.2,8.2);
  p.userData.run=distance(old,p.position)/Math.max(.001,dt*6);
  const facing=faceBall&&p.userData.run<.35?Math.atan2(this.b.position.x-p.position.x,this.b.position.z-p.position.z):Math.atan2(p.userData.velocity.x,p.userData.velocity.z);
  if(p.userData.run>.03||faceBall)p.rotation.y+=Math.atan2(Math.sin(facing-p.rotation.y),Math.cos(facing-p.rotation.y))*Math.min(1,dt*9);
 }
 choosePass(i){
  const p=this.players[i],middle=this.players[this.middleIndex];
  if(this.cool>0||this.age<p.userData.controlAt||this.age<p.userData.nextPass&&this.pressure(i)<.5)return;
  const options=this.players.map((q,j)=>({q,j})).filter(o=>o.j!==i&&o.j!==this.middleIndex);
  const score=o=>Math.min(segmentDistance(middle.position,p.position,o.q.position).d,2)*1.4-Math.abs(distance(p,o.q)-4.7)*.22+Math.sin(i*2+o.j+this.age*.8)*.3+(p.userData.calledUntil>this.age&&o.j===p.userData.target?.8:0);
  options.sort((a,b)=>score(b)-score(a));const best=options[0];if(!best)return;
  // A blocked lane makes a player hesitate and carry, giving the defender time to close.
  if(segmentDistance(middle.position,p.position,best.q.position).d<.9&&this.pressure(i)<.65){p.userData.nextPass=this.age+.3;return;}
  p.userData.target=best.j;this.actionFor(i,'pass',.35+(i%3)*.1);
 }
 receive(i){
  const p=this.players[i],pressure=this.pressure(i),speed=Math.hypot(this.v.x,this.v.z);
  this.lastTouch=i;
  if(pressure>.4&&speed>8&&this.age>=this.swapUntil){
   const dir=this.v.clone().setY(0).normalize();this.b.position.copy(p.position).addScaledVector(dir,.75);this.b.position.y=.16;this.v.copy(dir.multiplyScalar(2.2+pressure*2));this.v.y=.55;
   p.userData.receiveUntil=this.age+.32;this.cool=.12;this.lastPass=null;this.note('Heavy touch under pressure — the ball is loose!');this.ui.sound('kick');return;
  }
  this.carrier=i;if(this.lastPass&&this.lastPass.from!==i){this.points[this.lastPass.from]++;this.streak++;this.ui.sound('kick');}
  this.lastPass=null;this.v.set(0,0,0);this.cool=.12;p.userData.controlAt=this.age+.32;p.userData.nextPass=this.age+.72+(i%3)*.13;this.players.forEach(q=>q.userData.supportAt=0);
 }
 update(dt,t){
  this.cool=Math.max(0,this.cool-dt);
  if(!this.networked){
   for(let i=0;i<this.players.length;i++){
    const p=this.players[i];let target,speed;
    if(i===0){const manual=this.world.movementVector?.(this.input.vector())||this.input.vector(),raw=this.pressInput(i,manual),pressing=i===this.middleIndex&&this.age<p.userData.pressUntil;
     if(Math.hypot(raw.x,raw.z)>.05)target={x:p.position.x+raw.x*3,z:p.position.z+raw.z*3};else target=this.input.target||p.position;
     speed=this.input.sprint?6.8:pressing?(this.age-p.userData.pressStarted<.55?6.2:5.5):5.1;
    }else if(i===this.middleIndex){target=this.pressTarget(i);speed=this.settings.difficulty==='easy'?4.8:this.settings.difficulty==='hard'?6.2:5.6;}
    else{target=i===this.carrier?this.carryTarget(i):this.supportTarget(i);speed=(i===this.carrier?3.8:this.age<p.userData.runUntil?4.9:4.1)*this.difficultyTuning.speed;}
    this.moveRunner(p,target,speed,dt,i!==this.carrier&&i!==this.middleIndex);
    if(i===this.middleIndex&&(i!==0||this.age<p.userData.pressUntil)&&distance(p,this.b)<1.2)this.tackle(i);
   }
   if(this.carrier!==null&&this.carrier!==0)this.choosePass(this.carrier);
  }
  for(let i=0;i<this.players.length;i++)for(let j=i+1;j<this.players.length;j++){
   const p=this.players[i],q=this.players[j],dx=p.position.x-q.position.x,dz=p.position.z-q.position.z,d=Math.hypot(dx,dz);
   if(d<.7){const nx=d>.001?dx/d:1,nz=d>.001?dz/d:0,push=(.7-d)*.5;p.position.x+=nx*push;p.position.z+=nz*push;q.position.x-=nx*push;q.position.z-=nz*push;}
  }
  const before=this.b.position.clone();
  if(this.carrier!==null){this.placeBall();if(this.age>=this.swapUntil&&distance(this.players[this.middleIndex],this.b)<.62&&this.b.position.y<.9)this.intercept(this.middleIndex);}
  else{
   this.v.y-=9.81*dt;this.b.position.addScaledVector(this.v,dt);
   if(this.b.position.y<.14){this.b.position.y=.14;this.v.y=Math.abs(this.v.y)*.3;if(this.v.y<.45)this.v.y=0;this.v.x*=Math.exp(-.35*dt);this.v.z*=Math.exp(-.35*dt);}
   const middle=this.players[this.middleIndex],test=segmentDistance(middle.position,before,this.b.position);
   if(this.age>=this.swapUntil&&test.d<.72&&test.y<1.05)this.intercept(this.middleIndex);
   if(this.carrier===null&&this.cool===0){
    const candidates=this.players.map((p,i)=>({p,i,...segmentDistance(p.position,before,this.b.position)})).filter(o=>o.i!==this.middleIndex&&this.age>=o.p.userData.receiveUntil&&o.d<.7&&o.y<.95).sort((a,b)=>a.d-b.d);
    if(candidates[0])this.receive(candidates[0].i);
   }
   if(this.carrier===null&&Math.max(Math.abs(this.b.position.x),Math.abs(this.b.position.z))>9){this.intercept(this.middleIndex);this.note('Ball out. '+this.name(this.middleIndex)+' takes the middle.');}
  }
  const travel=this.b.position.clone().sub(before);this.b.rotation.x+=travel.z/.14;this.b.rotation.z-=travel.x/.14;
  const focus=this.liveFocus||this.you;this.marker.position.set(focus.position.x,.03,focus.position.z);const mid=this.players[this.middleIndex];this.middleMarker.position.set(mid.position.x,.025,mid.position.z);
  const target=this.players[this.receiver(this.liveSeat||0)];this.targetMarker.visible=!!target&&(this.liveSeat||0)!==this.middleIndex;if(target)this.targetMarker.position.set(target.position.x,.025,target.position.z);
  this.score=this.points[0];this.refreshActions();this.status(`${this.streak} ${this.streak===1?'PASS':'PASSES'} · ${Math.ceil(Math.max(0,this.limit-this.time))}s`,`${this.name(this.middleIndex)} IN THE MIDDLE · YOU ${this.points[0]} POINTS`);
  if(this.time>=this.limit){const best=Math.max(...this.points);this.liveWinners=this.points.flatMap((p,i)=>p===best?[i]:[]);this.finish(this.points[0]===best?'PASSING CHAMPION':'ROUND COMPLETE',this.points.map((p,i)=>this.name(i)+': '+p).join(' · '),this.points[0]===best);}
 }
}
