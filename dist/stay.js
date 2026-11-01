import {separatePlayers,avoidPlayers} from './street-ball-control.js';
import {Mode} from './mode-base.js';
import {THREE,ball,ring,moveActor,distance} from './world.js';

// The neighbourhood rule supplied by the player: hit somebody, then catch the
// rebound before it touches the floor. Otherwise retrieve the ball and try again.
export class Stay extends Mode {
 constructor(ctx){
  super(ctx);this.world.setCamera([0,17,17,0,0,0]);
  const spots=[[-4,5],[3,-4],[-7,-2],[6,3],[-1,-6],[8,-5],[-8,6],[2,7]];
  this.players=spots.map(([x,z],i)=>{const p=this.player(x,z,[this.settings.color,0x357e7c,0xc49e4e,0x416e82,0xa65640,0x687a48,0x9d7957,0x6f6690][i]);Object.assign(p.userData,{id:i,stayVelocity:new THREE.Vector3(),nextRoam:i*.3});return p;});
  this.you=this.players[0];this.throwerIndex=0;this.thrower=this.you;this.targetIndex=4;this.b=ball(this.root,.13);this.v=new THREE.Vector3();this.phase='held';this.hitIndex=null;this.catchWindow=0;this.kickCooldown=0;this.roleTime=0;this.transfers=Array(8).fill(0);this.marker=ring(.5,0xf2bd51,0,0,this.root,.025);this.targetMarker=ring(.48,0xd88853,0,0,this.root,.018);this.youMarker=ring(.38,0xf3e6c7,0,0,this.root,.016);this.labels=this.players.map((p,i)=>this.text(i?String(i+1):'YOU',p.position.x,2.45,p.position.z,'#f5e5bc',.22));
  this.controls();
  this.note('You have the ball. Aim at a player, throw, then catch the rebound before it lands. E changes target.');this.attachBall();
 }
 controls(){const key=this.throwerIndex+':'+this.phase;if(this.controlKey===key)return;this.controlKey=key;const mine=this.throwerIndex===0,held=this.phase==='held',loose=this.phase==='loose';this.setActions([{id:'ball',label:held?'Throw':'Catch',key:'Space',disabled:!mine||loose},{id:'play',label:held?'Target':'Kick away',key:'E',disabled:!(mine&&held||!mine&&loose)},{id:'sprint',label:'Sprint',key:'Shift',hold:true}]);}
 attachBall(){this.b.position.copy(this.thrower.position);this.b.position.y=1.15;this.b.position.x+=Math.sin(this.thrower.rotation.y)*.38;this.b.position.z+=Math.cos(this.thrower.rotation.y)*.38;}
 chooseTarget(){const choices=this.players.map((p,i)=>({p,i})).filter(q=>q.i!==this.throwerIndex);choices.sort((a,b)=>distance(a.p,this.thrower)-distance(b.p,this.thrower));return choices[0].i;}
 launch(){if(this.phase!=='held')return;const p=this.players[this.targetIndex];this.thrower.rotation.y=Math.atan2(p.position.x-this.thrower.position.x,p.position.z-this.thrower.position.z);this.attachBall();const duration=THREE.MathUtils.clamp(distance(p,this.thrower)/13,.25,1.2);const lead=p.userData.stayVelocity||{x:0,z:0};this.v.set((p.position.x+lead.x*duration*.6-this.b.position.x)/duration,(1.05-this.b.position.y+4*duration*duration)/duration,(p.position.z+lead.z*duration*.6-this.b.position.z)/duration);this.phase='flight';this.flightTime=0;this.hitIndex=null;this.catchWindow=0;this.thrower.userData.pose='keeperThrow';this.thrower.userData.poseUntil=this.age+.45;this.ui.sound('throw');this.note(this.throwerIndex===0?'Follow the ball. If it hits, move under the rebound and press Catch.':'Dodge the throw. If it lands loose, kick it away from the thrower.');}
 action(id){if(id==='ball'){if(this.throwerIndex!==0)return this.note('Keep clear of the throw. E kicks a loose ball away.');if(this.phase==='held')this.launch();else if(this.phase==='rebound'||this.phase==='flight'){this.catchWindow=.6*this.difficultyTuning.window;this.you.userData.pose='reach';this.you.userData.poseUntil=this.age+.6;}else this.note('Run to the loose ball to collect it.');}else if(id==='play'){if(this.phase==='held'&&this.throwerIndex===0){do{this.targetIndex=(this.targetIndex+1)%this.players.length;}while(this.targetIndex===0);}else if(this.phase==='loose'&&this.throwerIndex!==0)this.kickLoose(0);}}
 hit({point}){if(this.phase==='held'&&this.throwerIndex===0){let best=Infinity;this.players.forEach((p,i)=>{const d=distance(p,point);if(i!==0&&d<best){best=d;this.targetIndex=i;}});}else this.input.target=point;}
 rebound(index){if(this.phase!=='flight')return;this.hitIndex=index;this.phase='rebound';
  const victim=this.players[index],normal=this.b.position.clone().sub(victim.position);normal.y=0;if(normal.lengthSq()<.0025)normal.set(-this.v.x,0,-this.v.z);if(normal.lengthSq()<.0025)normal.copy(this.thrower.position).sub(this.b.position);normal.y=0;normal.normalize();
  const impact=this.v.x*normal.x+this.v.z*normal.z;
  this.v.set((this.v.x-2*impact*normal.x)*.62,2.8,(this.v.z-2*impact*normal.z)*.62);
  this.ui.sound('ballHit');this.note(this.throwerIndex===0?'Hit! Catch the rebound before it touches the ground.':'Hit — the role changes only if the thrower catches the rebound.');}
 catchRebound(){if(this.phase!=='rebound'||this.hitIndex===null)return false;const old=this.throwerIndex,next=this.hitIndex;this.transfers[old]++;this.score=this.transfers[0];this.throwerIndex=next;this.thrower=this.players[next];this.hitIndex=null;this.phase='held';this.roleTime=0;this.catchWindow=0;this.v.set(0,0,0);this.targetIndex=this.chooseTarget();this.attachBall();this.ui.sound('catch');this.note(next===0?'They hit you and caught it. Your turn to throw, hit and catch.':'Caught! The hit player now becomes the thrower. Keep the loose ball away from them.');return true;}
 loose(){this.phase='loose';this.hitIndex=null;this.catchWindow=0;this.note(this.throwerIndex===0?'No catch. Chase and collect the ball — everyone else can kick it away.':'Loose ball! Reach it and press E to kick it away from the thrower.');}
 kickLoose(index){if(this.phase!=='loose'||index===this.throwerIndex||this.kickCooldown>0||distance(this.players[index],this.b)>1.1||this.b.position.y>.65)return false;const dir=this.b.position.clone().sub(this.thrower.position);dir.y=0;if(dir.length()<.1)dir.set(1,0,0);dir.normalize();this.v.copy(dir.multiplyScalar(8.5));this.v.y=1.4;this.kickCooldown=.7;this.players[index].userData.kick=.38;this.players[index].userData.kickAwayUntil=this.age+1.6;this.ui.sound('kick');return true;}
 update(dt,t){
  this.controls();this.roleTime+=dt;this.catchWindow=Math.max(0,this.catchWindow-dt);this.kickCooldown=Math.max(0,this.kickCooldown-dt);const humanX=this.you.position.x,humanZ=this.you.position.z;this.move(this.you,dt,this.input.sprint?7:5,11);this.you.userData.stayVelocity.set((this.you.position.x-humanX)/Math.max(dt,.001),0,(this.you.position.z-humanZ)/Math.max(dt,.001));this.you.position.z=THREE.MathUtils.clamp(this.you.position.z,-9,9);
  // Only the nearest available runner contests a loose ball. Others find space.
  const kickers=this.players.filter((p,i)=>i!==this.throwerIndex&&(p.userData.kickAwayUntil||0)<=this.age&&(i!==0||p.userData.run>.1||distance(p,this.b)<1.1));
  const kicker=this.phase==='loose'?kickers.sort((a,b)=>distance(a,this.b)-distance(b,this.b))[0]:null;
  this.players.forEach((p,i)=>{
   p.userData.pose=i===this.throwerIndex&&this.phase==='held'?'keeperHold':this.age<(p.userData.poseUntil||0)?p.userData.pose:'idle';
   if(i===0||this.networked)return;let target,speed=2.5;p.userData.duty='Find space';
   if(i===this.throwerIndex){
    if(this.phase==='held'){target=this.players[this.targetIndex].position;speed=distance(p,target)>5.5?3.2:0;}
    else{target={x:this.b.position.x+this.v.x*.12,z:this.b.position.z+this.v.z*.12};speed=this.phase==='loose'?5.6:4.8;p.userData.duty='Retrieve';}
   }else if(p===kicker){target={x:this.b.position.x+this.v.x*.12,z:this.b.position.z+this.v.z*.12};speed=4.1;p.userData.duty='Kick away';}
   else{
    if(this.age>=p.userData.nextRoam||!p.userData.roam){
     let best=null,value=-Infinity;
     for(let j=0;j<7;j++){const q={x:-9+((i*7+j*5+Math.floor(this.age/3)*3)%19),z:-7+((i*3+j*7+Math.floor(this.age/4)*5)%15)};
      const clearance=Math.min(...this.players.filter(a=>a!==p).map(a=>distance(a,q))),score=clearance-Math.max(0,3-distance(this.thrower,q))*2-distance(p,q)*.12;
      if(score>value){value=score;best=q;}
     }p.userData.roam=best;p.userData.nextRoam=this.age+2.5+i*.12;
    }
    target=p.userData.roam;
    if((this.phase==='flight'||this.phase==='held')&&distance(p,this.b)<3){const dx=p.position.x-this.thrower.position.x,dz=p.position.z-this.thrower.position.z,n=Math.hypot(dx,dz)||1,side=i%2?1:-1;target={x:p.position.x+dz/n*side*3,z:p.position.z-dx/n*side*3};speed=4.4;}
   }
   const x=p.position.x,z=p.position.z;p.userData.run=speed>0?moveActor(p,avoidPlayers(p,target,this.players),speed*this.difficultyTuning.speed,dt):0;if(speed===0)p.rotation.y=Math.atan2(target.x-p.position.x,target.z-p.position.z);p.userData.stayVelocity.set((p.position.x-x)/Math.max(dt,.001),0,(p.position.z-z)/Math.max(dt,.001));
  });
  separatePlayers(this.players,1.02,{x:11,z:9});
  if(!this.networked&&kicker&&kicker!==this.you)this.kickLoose(this.players.indexOf(kicker));
  this.youMarker.position.set(this.you.position.x,.03,this.you.position.z);this.labels.forEach((l,i)=>l.position.set(this.players[i].position.x,2.45,this.players[i].position.z));
  this.marker.position.set(this.thrower.position.x,.025,this.thrower.position.z);this.targetMarker.visible=this.phase==='held'&&this.throwerIndex===0;this.targetMarker.position.set(this.players[this.targetIndex].position.x,.02,this.players[this.targetIndex].position.z);
  this.status(this.throwerIndex===0?'YOU HAVE THE THROW':`PLAYER ${this.throwerIndex+1} HAS THE THROW`,`${this.players.length} PLAYERS · ${this.transfers.reduce((a,b)=>a+b,0)} ROLE CHANGES · ${this.phase==='rebound'?'CATCH BEFORE IT LANDS':this.phase==='loose'?'CHASE THE BALL':'HIT + CATCH TO SWITCH'}`);
  if(this.time>=150||this.transfers.some(n=>n>=5)){this.score=this.transfers[0];this.finish('STAY ROUND COMPLETE',this.transfers.map((n,i)=>'Player '+(i+1)+': '+n+' successful transfers').join(' · '),this.score===Math.max(...this.transfers));return;}
  if(this.phase==='held'){this.attachBall();if(!this.networked&&this.throwerIndex!==0&&this.roleTime>2){this.targetIndex=this.chooseTarget();this.launch();}return;}
  const steps=Math.max(1,Math.ceil(dt/(1/120))),step=dt/steps;
  for(let n=0;n<steps;n++){if(this.advanceBall(step))break;}
 }
 advanceBall(dt){
  this.flightTime=(this.flightTime||0)+dt;this.b.position.addScaledVector(this.v,dt);this.v.y-=8*dt;
  for(const axis of ['x','z']){const bound=axis==='x'?11.5:9.5;if(Math.abs(this.b.position[axis])>bound){this.b.position[axis]=Math.sign(this.b.position[axis])*bound;this.v[axis]*=-.65;if(this.phase!=='loose')this.loose();this.ui.sound('bounce');}}
  if(this.phase==='flight'){const hit=this.players.findIndex((p,i)=>i!==this.throwerIndex&&distance(p,this.b)<.55&&this.b.position.y>.22&&this.b.position.y<1.7);if(hit>=0)this.rebound(hit);}
  if(this.phase==='rebound'&&distance(this.b,this.thrower)<.9&&this.b.position.y>.3&&this.b.position.y<1.8&&((!this.networked&&this.throwerIndex!==0)||this.catchWindow>0)){this.catchRebound();return true;}
  if(this.b.position.y<=.13){this.b.position.y=.13;if(this.phase!=='loose')this.loose();if(Math.abs(this.v.y)>.5)this.ui.sound('bounce');this.v.y=Math.abs(this.v.y)>.5?Math.abs(this.v.y)*.35:0;this.v.x*=Math.exp(-dt*4);this.v.z*=Math.exp(-dt*4);}
  if(this.phase==='loose'){this.v.x*=Math.exp(-dt*.35);this.v.z*=Math.exp(-dt*.35);if(distance(this.b,this.thrower)<.8&&this.b.position.y<.65){this.phase='held';this.v.set(0,0,0);this.roleTime=0;this.targetIndex=this.chooseTarget();this.attachBall();this.ui.sound('catch');this.note(this.throwerIndex===0?'Collected. Aim, hit a player, and catch the rebound.':'The thrower collected it. Stay alert for the next throw.');return true;}}
 }
}
