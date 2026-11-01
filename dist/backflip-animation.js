import * as THREE from './vendor/three.module.js';
import {reach} from './keeper-arms.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
// All angles are model-local: characters face +Z, so a negative X rotation
// sends the head behind the hips. Lean is already shared in friend-room frames.
export function backflipShape(pose,progress=0){
 const s={angle:0,hip:0,thigh:0,knee:0,arm:0,elbow:0,spine:0,split:0};
 const t=smooth(progress);
 if(pose==='backLoad')Object.assign(s,{hip:-.26*t,thigh:-.65*t,knee:1.15*t,arm:.9*t,elbow:-.15*t,spine:.25*t});
 else if(pose==='backDrive')Object.assign(s,{hip:-.26*(1-t),thigh:-.65*(1-t),knee:1.15*(1-t),arm:.9-3.65*t,elbow:-.15*(1-t),spine:.25*(1-t)});
 else if(pose==='backLand'){const compress=progress<.2?smooth(progress/.2):1-smooth((progress-.2)/.8);Object.assign(s,{hip:-.25*compress,thigh:-.65*compress,knee:1.12*compress,arm:-.8*compress,elbow:-.25*compress,spine:.25*compress});}
 else{
  s.angle=pose==='backSet'?0:progress;
  if(pose==='backSet')Object.assign(s,{arm:-2.75,knee:.05});
  if(pose==='backTuck')Object.assign(s,{thigh:-1.8,knee:2.35,arm:-.85,elbow:-1.25,spine:.2});
  if(pose==='backPike')Object.assign(s,{thigh:-1.25,knee:.1,arm:-1.25,elbow:-.12,spine:.15});
  if(pose==='backLayout')Object.assign(s,{thigh:-.06,knee:.06,arm:-2.65,elbow:-.1,spine:-.08});
  if(pose==='backSplit')Object.assign(s,{thigh:-.15,knee:.12,arm:-1.65,elbow:-.15,split:1});
  if(pose==='backOpen')Object.assign(s,{thigh:-.08,knee:.16,arm:-.75,elbow:-.3});
 }
 return s;
}
export function animateBackflip(root,pose,dt=1/60){
 const u=root.userData,m=u.model||u.body;if(!m)return;
 const target=backflipShape(pose,u.lean||0),current=u.backShape??={...target},blend=1-Math.exp(-Math.min(.1,dt)*24);
 for(const key of Object.keys(target))current[key]+=(target[key]-current[key])*blend;
 // The physics angle stays exact; the limbs blend between set, tuck and open.
 const a=target.angle,pivot=1;
 m.rotation.set(a,0,0);m.position.y+=pivot*(1-Math.cos(a))+current.hip;m.position.z=-pivot*Math.sin(a);
 const bend=(n,x,z=0)=>{if(u.bones?.[n]){u.bones[n].rotation.x+=x;u.bones[n].rotation.z+=z;}};
 if(u.bones){for(const side of ['l','r']){bend('thigh_'+side,current.thigh+(side==='l'?-1:1)*current.split);bend('calf_'+side,current.knee);bend('upperarm_'+side,current.arm,side==='l'?-.08:.08);bend('lowerarm_'+side,current.elbow);}bend('spine_01',current.spine);
  // Imported shoulder axes differ from world axes: use the actual arm chain
  // to put hands overhead, behind the body or toward the knees.
  root.updateMatrixWorld(true);
  for(const side of ['l','r']){
   const upper=u.bones['upperarm_'+side],lower=u.bones['lowerarm_'+side],hand=u.bones['hand_'+side];if(!upper||!lower||!hand)continue;
   const local=bone=>m.worldToLocal(bone.getWorldPosition(new THREE.Vector3())),shoulder=local(upper),elbow=local(lower),wrist=local(hand),length=(shoulder.distanceTo(elbow)+elbow.distanceTo(wrist))*.94,sign=Math.sign(shoulder.x)||1;
   const target=shoulder.clone().add(new THREE.Vector3(sign*.025,-Math.cos(current.arm)*length,-Math.sin(current.arm)*length));
   const pole=shoulder.clone().add(new THREE.Vector3(sign*.45,-.2,.25));
   const worldTarget=m.localToWorld(target),worldPole=m.localToWorld(pole);
   for(let pass=0;pass<2;pass++)reach(root,upper,lower,hand,worldTarget,worldPole,1);
  }
 }
 else if(u.limbs){u.limbs[0].rotation.x=u.limbs[1].rotation.x=current.arm;u.limbs[2].rotation.x=current.thigh-current.split;u.limbs[3].rotation.x=current.thigh+current.split;}
 // Keep planted feet on the ground through load, arm drive and landing recovery.
 if(['backLoad','backDrive','backLand'].includes(pose)&&u.feet?.length){root.updateMatrixWorld(true);const lowest=Math.min(...u.feet.map(foot=>root.worldToLocal(foot.getWorldPosition(root.position.clone())).y));m.position.y+=clamp(u.restFootY+(u.jump||0)-lowest,-.8,.8);}
}
