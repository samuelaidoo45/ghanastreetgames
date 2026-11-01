// Shot lanes and rolling foot touches, adapted to this game's four side goals.
import {THREE} from './world.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function goalLane(origin,goal,defenders,history=0){
 const side=new THREE.Vector3(-goal.normal.z,0,goal.normal.x);
 let best=null;
 for(const offset of [-.8,0,.8]){
  const point=goal.center.clone().addScaledVector(side,offset*(goal.width/2-.26)).addScaledVector(goal.normal,.3);
  const dx=point.x-origin.x,dz=point.z-origin.z,len=Math.hypot(dx,dz),depth=-(origin.x-goal.center.x)*goal.normal.x-(origin.z-goal.center.z)*goal.normal.z;
  let obstruction=0;
  for(const player of defenders){
   const p=player.position,v=player.userData?.velocity,x=p.x+clamp((v?.x||0)*.18,-.7,.7),z=p.z+clamp((v?.z||0)*.18,-.7,.7);
   const t=((x-origin.x)*dx+(z-origin.z)*dz)/Math.max(.01,len*len);
   if(t<.05||t>1.05)continue;
   const distance=Math.hypot(x-origin.x-dx*clamp(t,0,1),z-origin.z-dz*clamp(t,0,1));
   obstruction=Math.max(obstruction,Math.exp(-distance*distance/.45));
  }
  const openness=1-obstruction,score=openness*8+Math.max(0,depth)/Math.max(.1,len)*1.5-len*.22-Math.min(2,history*.25);
  if(!best||score>best.score)best={point,openness,score,distance:len};
 }
 return best;
}
export function rollingTouch(ball,velocity,player,dt,time){
 const u=player.userData,p=player.position,travel=u.velocity||new THREE.Vector3(),speed=travel.length();
 if(Math.hypot(ball.position.x-p.x,ball.position.z-p.z)>1.9)return false;
 u.footTimer=Math.max(0,(u.footTimer||0)-dt);
 const fx=Math.sin(player.rotation.y),fz=Math.cos(player.rotation.y),rolling=Math.hypot(velocity.x,velocity.z);
 if(u.footTimer<.07&&rolling>1&&velocity.x*fx+velocity.z*fz<rolling*.35)u.footTimer=0;
 if(u.footTimer===0){
  const lead=speed>5.5?.94:speed>.5?.63:.45;
  velocity.set(travel.x+(p.x+fx*lead-ball.position.x)*5.5,0,travel.z+(p.z+fz*lead-ball.position.z)*5.5);
  u.footTimer=speed>5.5?.23:speed>.5?.16:.1;
 }
 const before=ball.position.clone();ball.position.addScaledVector(velocity,dt);ball.position.y=.12;
 velocity.multiplyScalar(Math.exp(-(speed<.3?8:1.5)*dt));
 ball.rotation.x+=(ball.position.z-before.z)/.12;ball.rotation.z-=(ball.position.x-before.x)/.12;
 u.dribble=speed>.4?Math.max(0,Math.sin(time*13)):0;
 return true;
}
