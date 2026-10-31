import {closestChallenger,separatePlayers,dribbleBall,supportPosition,avoidPlayers} from './street-ball-control.js';
import {pitchSurface,pitchType} from './football-assets.js';
import {Mode} from './mode-base.js';
import {THREE,moveActor,distance} from './world.js';
import {matchBall,stepBall,clamp,chalk} from './ball-physics.js';
const names=['YOU','KOJO','ESI','NII','AMA'];
// A low ball must actually pass through the defender's leg plane.
export function crossedLegs(before,after,defender){const p=defender.position,n=new THREE.Vector3(Math.sin(defender.rotation.y),0,Math.cos(defender.rotation.y)),side=new THREE.Vector3(n.z,0,-n.x),a=before.clone().sub(p).dot(n),b=after.clone().sub(p).dot(n);if(a*b>0||Math.abs(a-b)<.001)return false;const t=a/(a-b);if(t<0||t>1)return false;const hit=before.clone().lerp(after,t);return hit.y<=.3&&Math.abs(hit.clone().sub(p).dot(side))<.19;}
export class Sulia extends Mode{
 constructor(ctx){super(ctx);this.surfaceType=pitchType(this.game.id,this.settings.pitchSurface);pitchSurface(this.root,18,18,this.surfaceType);this.world.setCamera([0,10,13,0,.5,0]);this.players=[];for(let i=0;i<5;i++){const a=i*Math.PI*2/5,p=this.player(Math.sin(a)*4,Math.cos(a)*4,i? [0,0x326b85,0xb59546,0x468367,0x9b684a][i]:this.settings.color);p.rotation.y=Math.atan2(-p.position.x,-p.position.z);p.userData.id=i;p.userData.pose='idle';this.players.push(p);}this.you=this.players[0];this.b=matchBall(this.root);this.v=new THREE.Vector3();this.points=Array(5).fill(0);this.carrier=0;this.lastKicker=-1;this.target=1;this.cool=0;this.phase='play';this.marker=this.circle(0,0,.5);this.charge=null;this.limit=120;this.playTime=0;this.stamina=1;for(const [x,z,w,d]of [[0,-9,18,.03],[0,9,18,.03],[-9,0,.03,18],[9,0,.03,18]])chalk(this.root,x,z,w,d);this.setActions([{id:'nutmeg',label:'Nutmeg / tackle',key:'Space',charge:true},{id:'target',label:'Next player',key:'E'},{id:'shield',label:'Shield',key:'Q'},{id:'sprint',label:'Sprint',key:'Shift',hold:true}]);this.note('Sulia: put the ball between someone’s legs for one point. The nutmegged player is chased and tagged, then play restarts. First to five, or most points in two minutes.');this.placeBall();}
 placeBall(){const p=this.players[this.carrier];this.b.position.set(p.position.x+Math.sin(p.rotation.y)*.48,.12,p.position.z+Math.cos(p.rotation.y)*.48);this.v.set(0,0,0);}
 hold(){if(this.phase==='play')this.charge=this.age;}
 action(id){if(id==='target'){this.target=this.target%4+1;return;}if(this.phase!=='play')return;if(id==='shield'&&this.carrier===0){this.shieldUntil=this.age+.8;this.note('Shielding the ball. Turn away from pressure.');return;}if(id!=='nutmeg')return;const power=this.charge===null?.4:clamp(this.age-this.charge,.1,1);this.charge=null;if(this.carrier===0)this.poke(0,this.target,power);else if(this.carrier!==null&&distance(this.you,this.players[this.carrier])<1.15&&this.cool<=0){this.carrier=0;this.lastKicker=-1;this.cool=.4;this.ui.sound('kick');this.note('Ball won. Face a player and thread the gap.');}else this.note('Get close enough to win the ball first.');}
 poke(i,target,power=.4){if(this.carrier!==i||this.cool>0)return false;const p=this.players[i],q=this.players[target];this.placeBall();const d=q.position.clone().sub(this.b.position);d.y=0;if(i!==0)d.x+=(Math.random()-.5)*.5;this.v.copy(d.normalize().multiplyScalar(7+power*8));this.v.y=.12;this.carrier=null;this.lastKicker=i;this.cool=.32;p.userData.kick=.38;this.ui.sound('kick');return true;}
 nutmeg(scorer,victim){if(this.phase!=='play'||scorer<0||scorer===victim)return false;this.points[scorer]++;this.score=this.points[0];this.victim=victim;this.phase='chase';this.chaseAge=0;this.carrier=null;this.lastKicker=-1;this.v.set(0,0,0);this.tagged=false;this.note(`${names[scorer]} nutmegged ${names[victim]} — one point! ${victim===0?'Run!':'Catch the nutmegged player!'} A brief tag-and-restart follows.`);this.ui.sound('point');return true;}
 hit({point}){this.input.target=point;}
 cycleCamera(){this.wide=!this.wide;this.world.setCamera(this.wide?[0,18,8,0,0,0]:[0,10,13,0,.5,0]);}
 update(dt){this.cool=Math.max(0,this.cool-dt);this.playTime+=dt;this.status(`YOU ${this.points[0]} · BEST RIVAL ${Math.max(...this.points.slice(1))}`,this.phase==='chase'?`${names[this.victim]} WAS NUTMEGGED`:`${Math.max(0,Math.ceil(this.limit-this.playTime))}s · NUTMEG ${names[this.target]}`);this.move(this.you,dt,this.input.sprint?6.5:4.6,8.5);this.you.position.z=clamp(this.you.position.z,-8.5,8.5);this.marker.position.set(this.players[this.target].position.x,.025,this.players[this.target].position.z);
 if(this.phase==='chase'){
  this.chaseAge+=dt;const victim=this.players[this.victim],chasers=this.players.filter(p=>p!==victim).sort((a,b)=>distance(a,victim)-distance(b,victim)),tagger=chasers[0];
  for(let i=1;i<5;i++){const p=this.players[i];let target;
   if(p===victim){const nearest=chasers[0],dx=p.position.x-nearest.position.x,dz=p.position.z-nearest.position.z,n=Math.hypot(dx,dz)||1;target={x:clamp(p.position.x+dx/n*3-p.position.x*.25,-7.7,7.7),z:clamp(p.position.z+dz/n*3-p.position.z*.25,-7.7,7.7)};}
   else if(p===tagger&&!this.tagged)target=victim.position;
   else{const a=i*2.399;target={x:clamp(victim.position.x+Math.sin(a)*2.6,-7.5,7.5),z:clamp(victim.position.z+Math.cos(a)*2.6,-7.5,7.5)};}
   p.userData.run=moveActor(p,avoidPlayers(p,target,this.players),p===victim?4.8:5.3,dt);
  }
  if(!this.tagged&&distance(tagger,victim)<1.1){this.tagged=true;this.tagAt=this.chaseAge;tagger.userData.pose='reach';victim.userData.pose='head';this.ui.sound('clap');}
  separatePlayers(this.players,1.02,8.5);
  if(this.chaseAge>2.8||this.tagged&&this.chaseAge-this.tagAt>.65){this.players.forEach(p=>{p.userData.pose='idle';p.userData.run=0;});this.phase='play';this.carrier=this.victim;this.cool=1;this.placeBall();this.note(`${names[this.carrier]} restarts with the ball.`);}
  return;
 }

 const carrier=this.carrier===null?null:this.players[this.carrier];
 const challenger=closestChallenger(this.players,carrier,this.b,this.you);for(const p of this.players)if(p!==carrier)p.userData.dribble=0;
 for(let i=1;i<5;i++){
  const p=this.players[i];p.userData.pose='idle';let target,speed=3.5;
  if(p===carrier){
   const rivals=this.players.filter(q=>q!==p).sort((a,b)=>distance(p,a)-distance(p,b)),q=rivals[0],d=distance(p,q);
   const away=p.position.clone().sub(q.position);away.y=0;if(away.lengthSq()<.01)away.set(1,0,0);away.normalize();
   target=q.position.clone().addScaledVector(away,1.65);speed=4.1;
   if(d<2.5&&d>.95&&this.cool<=0){p.rotation.y=Math.atan2(q.position.x-p.position.x,q.position.z-p.position.z);this.poke(i,q.userData.id,.35);target={x:p.position.x+away.z*1.3,z:p.position.z-away.x*1.3};}
   else if(d<1.4)target={x:p.position.x+away.z*2,z:p.position.z-away.x*2};
  }else if(p===challenger){target=carrier?{x:carrier.position.x+Math.sin(carrier.rotation.y)*.65,z:carrier.position.z+Math.cos(carrier.rotation.y)*.65}:this.b.position;speed=4.2;}
  else target=supportPosition(p,carrier,this.b,i);
  p.userData.run=moveActor(p,avoidPlayers(p,target,this.players,1.25),speed,dt);
 }
 separatePlayers(this.players,1.02,8.5);
 // Only the closest defender challenges, with a recovery interval after a win.
 if(carrier&&challenger&&challenger!==this.you&&this.carrier!==null&&this.cool<=0&&distance(challenger,this.b)<.72&&!(this.carrier===0&&this.age<this.shieldUntil)){
  this.carrier=challenger.userData.id;this.lastKicker=-1;this.cool=.75;this.ui.sound('kick');
 }
 if(this.carrier!==null){dribbleBall(this.b,this.players[this.carrier],dt,this.age);this.v.set(0,0,0);}else{const before=stepBall(this.b,this.v,dt,{drag:1.1,bounce:.25});for(let i=0;i<5;i++)if(i!==this.lastKicker&&this.lastKicker>=0&&crossedLegs(before,this.b.position,this.players[i])){this.nutmeg(this.lastKicker,i);return;}if(this.cool<=0&&this.b.position.y<.4){const nearest=this.players.slice().sort((a,b)=>distance(a,this.b)-distance(b,this.b))[0];if(distance(nearest,this.b)<.6){this.carrier=nearest.userData.id;this.lastKicker=-1;this.cool=.3;}}}
 if(Math.abs(this.b.position.x)>9||Math.abs(this.b.position.z)>9){this.carrier=this.lastKicker>=0?(this.lastKicker+1)%5:0;this.lastKicker=-1;this.placeBall();this.cool=.6;this.note('Out. The next player restarts.');}
 this.ui.power?.(this.charge===null?0:clamp(this.age-this.charge,0,1));if(Math.max(...this.points)>=5||this.playTime>=this.limit){const best=Math.max(...this.points);this.score=this.points[0];this.finish(this.points[0]===best?'SULIA WINNER':'SULIA ROUND OVER',`${this.points[0]} nutmeg points. Highest score: ${best}.`,this.points[0]===best);}
 }
}
