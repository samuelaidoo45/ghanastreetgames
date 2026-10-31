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

export function gameActionCamera(mode,aspect,mobile=false){
 if(!mode?.you||!mode.b||mode.wide||mode.cameraWide||(mode.cameraView||0)!==0)return null;
 if(!['fourcorners','laski','sulia','stay'].includes(mode.game.id))return null;
 // Four-way defence needs every side goal visible on landscape displays.
 if(mode.game.id==='fourcorners'&&aspect>=1.2&&!mobile)return {position:new THREE.Vector3(0,13.8,16.5),look:new THREE.Vector3(0,.4,0)};
 const offset=aspect<.85?[0,11,8]:[1.5,10,12];
 return frameAction(mode.liveFocus||mode.you,mode.b,aspect,offset);
}

// Bounds describe equipment and play, not decorative buildings. This keeps tiny
// floor games close and fits wide groups on narrow phones without scaling people.
const phoneBounds={
 penalties:[-3,0,-9.6,3,2.8,4],onepole:[-2,0,-10.4,2,2.6,10.4],rubberband:[-1.3,0,-4.3,1.3,2.6,3.8],
 counters:[-.34,0,-.22,.34,.055,.22],oware:[-.94,.75,-.43,.94,.9,.43],dame:[-.9,.72,-.9,.9,.9,.9],ludo:[-.62,.67,-.62,.62,.88,.62],
 alikoto:[-.19,0,-.19,.19,.08,.19],ampe:[-2.1,0,-.7,2.1,2.65,.7],
 chaskele:[-3.5,0,-7.8,3.5,2.5,6.7],tumatu:[-1,0,-2.7,1,2.5,7],
 kpitinge:[-2,0,-4,2,2.5,4],alasa:[-2.2,0,-1.5,2.2,2.4,2],
 numbers:[-3.4,0,-4.3,3.4,2.5,3.7],chempe:[-1.7,0,-.7,1.7,2.5,.8],
 kyekyekule:[-2.3,0,-1.2,2.3,2.7,1.7],skipping:[-3.2,0,-1.5,3.2,3.1,1.5],
 pempenaa:[-2.6,0,-.6,2.6,1.8,1.8],mbobagor:[-3,0,-3,3,2,3],
 antoakyire:[-5.5,0,-5.5,5.5,2.6,5.5],zanzama:[-5,0,-1,5,2.6,8.8]
};
export function mobileSceneBounds(mode){
 if(!mode||mode.overview||mode.cameraWide||mode.wide||(mode.cameraView||0)!==0)return null;
 const id=mode.game.id;
 if(phoneBounds[id])return phoneBounds[id];
 if(['football','fourcorners','laski','sulia','stay'].includes(id)){
  const p=(mode.liveFocus||mode.teams?.[0]?.[mode.selected]||mode.you)?.position,b=mode.b?.position;
  if(p&&b)return [Math.min(p.x-1,b.x-.4),0,Math.min(p.z-1,b.z-.4),Math.max(p.x+1,b.x+.4),Math.max(2.6,b.y+.3),Math.max(p.z+1,b.z+.4)];
 }
 return null;
}
export function fitMobileScene(position,look,bounds,viewport,fov){
 if(!bounds)return {position,look};
 const [x0,y0,z0,x1,y1,z1]=bounds;
 const centre=new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
 const direction=position.clone().sub(look).normalize();
 const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
 const up=new THREE.Vector3().crossVectors(direction,right).normalize();
 const tanV=Math.tan(THREE.MathUtils.degToRad(fov/2));
 const fraction=Math.max(.1,(viewport.height-viewport.top-viewport.bottom)/viewport.height);
 const tanH=tanV*viewport.width/viewport.height;
 let distance=position.distanceTo(look),relative=new THREE.Vector3();
 for(const x of [x0,x1])for(const y of [y0,y1])for(const z of [z0,z1]){
  relative.set(x,y,z).sub(centre);const depth=relative.dot(direction);
  distance=Math.max(distance,depth+Math.abs(relative.dot(right))/(tanH*.91),depth+Math.abs(relative.dot(up))/(tanV*fraction*.9));
 }
 return {position:direction.multiplyScalar(distance).add(centre),look:centre};
}
