import * as THREE from './vendor/three.module.js';

// Keep the player and ball inside the playable centre of the screen. Only pull
// back when the action separates, rather than zooming every portrait view out.
export function frameAction(player, ball, aspect, offset, fov=aspect<1?65:52) {
 const p=player.position||player,b=ball.position||ball;
 const look=new THREE.Vector3().copy(p).lerp(b,.38);look.y=.7;
 const direction=new THREE.Vector3(...offset).normalize();
 const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
 const up=new THREE.Vector3().crossVectors(direction,right).normalize();
 const tanV=Math.tan(THREE.MathUtils.degToRad(fov/2)),tanH=tanV*Math.max(.25,aspect);
 let distance=new THREE.Vector3(...offset).length();const relative=new THREE.Vector3();
 // Room above the player for the score, and below for touch controls.
 for(const [subject,radius,height] of [[p,1.5,2.45],[b,.5,.5]])for(const x of [-radius,radius])for(const z of [-radius,radius])for(const y of [0,height]){
  relative.set(subject.x+x,subject.y+y,subject.z+z).sub(look);const depth=relative.dot(direction);
  distance=Math.max(distance,depth+Math.abs(relative.dot(right))/(tanH*.76),depth+Math.abs(relative.dot(up))/(tanV*.61));
 }
 return {position:direction.multiplyScalar(distance).add(look),look};
}

export function gameActionCamera(mode,aspect){
 if(!mode?.you||!mode.b||mode.wide||mode.cameraWide||(mode.cameraView||0)!==0)return null;
 if(!['fourcorners','laski','sulia','stay'].includes(mode.game.id))return null;
 // Four-way defence needs every side goal visible on landscape displays.
 if(mode.game.id==='fourcorners'&&aspect>=1.2)return {position:new THREE.Vector3(0,13.8,16.5),look:new THREE.Vector3(0,.4,0)};
 const offset=aspect<.85?[0,11,8]:[1.5,10,12];
 return frameAction(mode.you,mode.b,aspect,offset);
}
