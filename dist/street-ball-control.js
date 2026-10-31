import * as THREE from './vendor/three.module.js';

export function closestChallenger(players,carrier,ball,manualPlayer=null){
 let best=null,range=Infinity;
 for(const p of players){if(p===carrier)continue;if(p===manualPlayer&&p.userData.run<.1&&p.position.distanceTo(ball.position)>.85)continue;const d=p.position.distanceToSquared(carrier?.position||ball.position);if(d<range){best=p;range=d;}}
 return best;
}

// Resolve even exact overlaps; two relaxed passes avoid shoving the whole group.
export function separatePlayers(players,gap=.9,bounds=8){
 for(let pass=0;pass<2;pass++)for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
  const a=players[i].position,b=players[j].position;let dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz);if(d>=gap)continue;
  if(d<.0001){const angle=(i*2.4+j)*2.399;dx=Math.cos(angle);dz=Math.sin(angle);d=1;const push=gap*.5;a.x+=dx*push;a.z+=dz*push;b.x-=dx*push;b.z-=dz*push;}
  else{const push=(gap-d)*.5/d;a.x+=dx*push;a.z+=dz*push;b.x-=dx*push;b.z-=dz*push;}
 }
 for(const p of players){p.position.x=THREE.MathUtils.clamp(p.position.x,-bounds,bounds);p.position.z=THREE.MathUtils.clamp(p.position.z,-bounds,bounds);}
}

// Short alternating touches keep the ball visibly rolling in front of the feet.
export function dribbleBall(ball,player,dt,time){
 const before=ball.position.clone(),u=player.userData,moving=u.run>.1;
 const pulse=moving?.5+.5*Math.sin(time*11+(u.id||0)*1.7):0;
 const lead=moving?.5+pulse*.27:.46,side=moving?Math.sin(time*5.5)*.10:0;
 const x=player.position.x+Math.sin(player.rotation.y)*lead+Math.cos(player.rotation.y)*side;
 const z=player.position.z+Math.cos(player.rotation.y)*lead-Math.sin(player.rotation.y)*side;
 const blend=1-Math.exp(-dt*24);
 ball.position.x=THREE.MathUtils.lerp(ball.position.x,x,blend);ball.position.z=THREE.MathUtils.lerp(ball.position.z,z,blend);ball.position.y=.12;
 ball.rotation.x+=(ball.position.z-before.z)/.12;ball.rotation.z-=(ball.position.x-before.x)/.12;
 // A light foot tap, rather than repeatedly playing the full shooting swing.
 u.dribble=moving?pulse:0;
}

export function supportPosition(player,carrier,ball,index,attack=false){
 const focus=carrier?.position||ball.position;
 const angle=index*2.399+(attack?0:.5),radius=attack?3.1:3.6;
 const target={x:THREE.MathUtils.clamp(focus.x+Math.sin(angle)*radius,-7,7),z:THREE.MathUtils.clamp(focus.z+(attack?-1.5:0)+Math.cos(angle)*radius,-6.6,7.5)};
 // Go around the carrier rather than cutting through the contested ball.
 const dx=player.position.x-focus.x,dz=player.position.z-focus.z,current=Math.atan2(dx,dz),desired=Math.atan2(target.x-focus.x,target.z-focus.z);
 const difference=Math.atan2(Math.sin(desired-current),Math.cos(desired-current));
 if(Math.hypot(dx,dz)<2.5||Math.abs(difference)>.65){const waypoint=current+(Math.hypot(dx,dz)<2.2?0:Math.sign(difference)*.55);return {x:THREE.MathUtils.clamp(focus.x+Math.sin(waypoint)*3.2,-7.5,7.5),z:THREE.MathUtils.clamp(focus.z+Math.cos(waypoint)*3.2,-7,8)};}
 return target;
}
