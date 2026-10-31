import * as THREE from './vendor/three.module.js';
import {reach} from './keeper-arms.js';
export const AMPE_DURATION=2.25;
export function ampeMotion(time,foot=0){
 const t=Math.max(0,time),clap=t<.9?Math.pow(Math.abs(Math.cos((t-.24)*Math.PI/.48)),10):0;
 const flight=Math.max(0,Math.min(1,(t-.92)/.72));
 return {clap,jump:Math.sin(flight*Math.PI)*.48,crouch:t>.75&&t<.92?Math.sin((t-.75)/.17*Math.PI)*.12:0,foot,extend:t>1.15?Math.min(1,(t-1.15)/.3):0,landed:t>=1.64};
}
export function animateAmpeArms(root){
 const u=root.userData;if(u.ampeTime===undefined)return;
 const motion=ampeMotion(u.ampeTime,u.ampeFoot||0);root.updateMatrixWorld(true);
 for(const suffix of ['l','r']){
  const upper=u.bones['upperarm_'+suffix],lower=u.bones['lowerarm_'+suffix],hand=u.bones['hand_'+suffix];if(!upper||!lower||!hand)continue;
  const shoulder=root.worldToLocal(upper.getWorldPosition(new THREE.Vector3())),side=Math.sign(shoulder.x)||1;
  const spread=THREE.MathUtils.lerp(.37,.045,motion.clap);
  const target=new THREE.Vector3(side*spread,shoulder.y-.22,shoulder.z+.28);
  const pole=shoulder.clone().add(new THREE.Vector3(side*.6,-.45,.04));
  const worldTarget=root.localToWorld(target),worldPole=root.localToWorld(pole);for(let pass=0;pass<3;pass++)reach(root,upper,lower,hand,worldTarget,worldPole,1);
  // Point fingers up while the palms close, using the actual imported finger axis.
  const middle=u.bones['middle_01_'+suffix];if(middle){root.updateMatrixWorld(true);const wrist=hand.getWorldPosition(new THREE.Vector3()),current=middle.getWorldPosition(new THREE.Vector3()).sub(wrist).normalize(),up=root.localToWorld(new THREE.Vector3(0,1,0)).sub(root.getWorldPosition(new THREE.Vector3())).normalize();const rotation=new THREE.Quaternion().setFromUnitVectors(current,up).multiply(hand.getWorldQuaternion(new THREE.Quaternion()));hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));
   // Both thumbs point back towards the chest, with palms facing each other.
   const index=u.bones['index_01_'+suffix],pinky=u.bones['pinky_01_'+suffix];if(index&&pinky){for(let pass=0;pass<2;pass++){root.updateMatrixWorld(true);const across=index.getWorldPosition(new THREE.Vector3()).sub(pinky.getWorldPosition(new THREE.Vector3()));across.addScaledVector(up,-across.dot(up)).normalize();const back=root.localToWorld(new THREE.Vector3(0,0,-1)).sub(root.getWorldPosition(new THREE.Vector3())).normalize();const angle=Math.atan2(up.dot(across.clone().cross(back)),across.dot(back));const twist=new THREE.Quaternion().setFromAxisAngle(up,angle).multiply(hand.getWorldQuaternion(new THREE.Quaternion()));hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(twist));}}
  }
 }
}
