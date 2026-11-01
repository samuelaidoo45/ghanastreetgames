import {animateBackflip} from './backflip-animation.js';
// Rotate about the hips, keeping the body in the flight path rather than
// spinning the entire character around its feet. Lean carries the angle in the
// existing multiplayer actor frame; no extra skeleton data is transmitted.
export function animateJumpShape(root,pose,dt=1/60){
 const u=root.userData,m=u.model||u.body;if(!m)return;
 if(pose.startsWith('back')){u.jumpPoseApplied=true;animateBackflip(root,pose,dt);return;}
 if(!pose.startsWith('air')){if(u.jumpPoseApplied){m.rotation.x=0;m.position.z=0;u.jumpPoseApplied=false;u.backShape=null;}return;}
 u.jumpPoseApplied=true;const a=pose==='airHigh'?0:-(u.lean||0),tuck=pose==='airTuck',pike=pose==='airPike',high=pose==='airHigh',split=pose==='airSplit';
 m.rotation.x=a;m.rotation.z=0;m.position.y+=1-Math.cos(a);m.position.z=-Math.sin(a);
 if(u.bones){const bend=(n,x,z=0)=>{if(u.bones[n]){u.bones[n].rotation.x+=x;u.bones[n].rotation.z+=z;}};for(const side of ['l','r']){bend('thigh_'+side,tuck?-1.35:pike?-1.2:split?(side==='l'?-1.15:.9):high?-.85:-.06);bend('calf_'+side,tuck?1.9:high?1.15:.12);bend('upperarm_'+side,tuck?-.65:-1.5,side==='l'?-.15:.15);bend('lowerarm_'+side,tuck?-1.15:-.2);}bend('spine_01',tuck?.35:pike?.2:0);}
 else if(u.limbs){u.limbs[0].rotation.x=u.limbs[1].rotation.x=-1.2;u.limbs[2].rotation.x=tuck||pike?-1.2:split?-1.15:high?-.7:0;u.limbs[3].rotation.x=tuck||pike?-1.2:split?.9:high?-.7:0;}
}
