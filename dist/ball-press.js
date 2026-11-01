// A short, player-requested pursuit. Steering or winning possession cancels it;
// contact still uses the game's physical range, shield and tackle cooldown rules.
export function startBallPress(mode,player,carrier){
 if(!player||mode.phase!=='play'||player.visible===false||carrier===player)return false;
 player.userData.pressUntil=mode.age+3;player.userData.recoverUntil=0;
 if(player===mode.you&&!mode.networked)mode.input.target=null;
 return true;
}
export function steerBallPress(mode,player,raw,carrier,velocity,challenge){
 const u=player.userData;
 if(mode.phase!=='play'||carrier===player||Math.hypot(raw.x,raw.z)>.18){u.pressUntil=0;return raw;}
 if(mode.age>=(u.pressUntil||0))return raw;
 const ball=mode.b.position,lead=carrier?.userData.velocity||velocity;
 const dx=ball.x-player.position.x+Math.max(-.8,Math.min(.8,(lead?.x||0)*.12)),dz=ball.z-player.position.z+Math.max(-.8,Math.min(.8,(lead?.z||0)*.12)),d=Math.hypot(dx,dz);
 const contact=Math.hypot(ball.x-player.position.x,ball.z-player.position.z);
 if(contact<1.3&&ball.y<.7){player.rotation.y=Math.atan2(ball.x-player.position.x,ball.z-player.position.z);challenge();}
 return d>.18?{x:dx/d,z:dz/d}:{x:0,z:0};
}
