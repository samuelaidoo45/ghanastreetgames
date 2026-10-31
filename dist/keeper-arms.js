import * as THREE from './vendor/three.module.js';
const v=()=>new THREE.Vector3();

// Two-bone reach keeps the elbows bent and respects the imported limb lengths.
export function reach(root,upper,lower,hand,target,pole,weight){
 root.updateMatrixWorld(true);
 const shoulder=upper.getWorldPosition(v()),elbow=lower.getWorldPosition(v()),wrist=hand.getWorldPosition(v());
 const a=shoulder.distanceTo(elbow),b=elbow.distanceTo(wrist);if(a<.001||b<.001)return;
 const direction=target.clone().sub(shoulder),distance=THREE.MathUtils.clamp(direction.length(),Math.abs(a-b)+.001,(a+b)*.98);direction.normalize();
 const bend=pole.clone().sub(shoulder);bend.addScaledVector(direction,-bend.dot(direction));if(bend.lengthSq()<.00001)bend.set(0,0,1);bend.normalize();
 const along=(a*a+distance*distance-b*b)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
 const desiredElbow=shoulder.clone().addScaledVector(direction,along).addScaledVector(bend,height);
 const desiredWrist=shoulder.clone().addScaledVector(direction,distance);
 function aim(bone,child,destination){
  const origin=bone.getWorldPosition(v()),current=child.getWorldPosition(v()).sub(origin).normalize(),next=destination.clone().sub(origin).normalize();
  const worldRotation=bone.getWorldQuaternion(new THREE.Quaternion()),parentRotation=bone.parent.getWorldQuaternion(new THREE.Quaternion());
  const result=parentRotation.invert().multiply(new THREE.Quaternion().setFromUnitVectors(current,next)).multiply(worldRotation);
  bone.quaternion.slerp(result,weight);bone.updateMatrixWorld(true);
 }
 aim(upper,lower,desiredElbow);aim(lower,hand,desiredWrist);
}

export function animateKeeperArms(root,pose,moving,dt){
 const u=root.userData,active=['keeperReady','keeperDive','keeperHold','keeperThrow'].includes(pose);
 u.keeperBlend=THREE.MathUtils.damp(u.keeperBlend||0,active?(pose==='keeperReady'?1-moving*.55:1):0,12,dt);
 if(active)u.lastKeeperPose=pose;if(u.keeperBlend<.001)return;
 u.keeperTargets??={};root.updateMatrixWorld(true);
 for(const suffix of ['l','r']){
  const upper=u.bones['upperarm_'+suffix],lower=u.bones['lowerarm_'+suffix],hand=u.bones['hand_'+suffix];if(!upper||!lower||!hand)continue;
  const shoulder=root.worldToLocal(upper.getWorldPosition(v())),side=Math.sign(shoulder.x)|| (suffix==='l'?1:-1),kind=u.lastKeeperPose;
  const target=shoulder.clone().add(new THREE.Vector3(side*.04,-.34,.28));
  if(kind==='keeperHold')target.set(side*.14,shoulder.y-.3,shoulder.z+.38);
  if(kind==='keeperDive'){const dive=u.diveSide||-Math.sign(u.lean||0)||1;target.set(dive*.58,shoulder.y+.08,shoulder.z+.36);}
  if(kind==='keeperThrow')target.add(new THREE.Vector3(side===-1?0:side*.12,side===-1?.35:0,side===-1?.26:0));
  const smooth=u.keeperTargets[suffix]??=root.worldToLocal(hand.getWorldPosition(v()));smooth.lerp(target,1-Math.exp(-12*dt));
  const pole=shoulder.clone().add(new THREE.Vector3(side*.65,-.55,-.22));
  reach(root,upper,lower,hand,root.localToWorld(smooth.clone()),root.localToWorld(pole),u.keeperBlend);
 }
}
