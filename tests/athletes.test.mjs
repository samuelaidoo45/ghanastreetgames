import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {animateAthlete} from '../dist/athletes.js';
function rig(){const root=new THREE.Group(),model=new THREE.Group();root.add(model);const bones={};for(const name of ['upperarm_r','lowerarm_r','upperarm_l','lowerarm_l','spine_01','thigh_l','thigh_r','calf_l','calf_r']){bones[name]=new THREE.Bone();model.add(bones[name]);}const actions=Object.fromEntries(['idle','run','idle_breathe'].map(name=>[name,{weight:name==='idle'?1:0,getEffectiveWeight(){return this.weight;},setEffectiveWeight(w){this.weight=w;}}]));root.userData={model,bones,mixer:{update(){}},actions,lastT:null,kick:0,lean:0};return root;}
test('untracked gesture bones never accumulate rotations over a long pose',()=>{const root=rig();for(let i=0;i<1200;i++)animateAthlete(root,i/60,0,'point');assert.ok(Math.abs(root.userData.bones.upperarm_r.rotation.x+1.3)<.0001);assert.ok(Math.abs(root.userData.bones.lowerarm_r.rotation.x+.2)<.0001);for(let i=1200;i<1500;i++)animateAthlete(root,i/60,0,'idle');assert.ok(Math.abs(root.userData.bones.upperarm_r.rotation.x)<.0001);});
test('gesture changes blend instead of snapping and idle keeps a breathing contribution',()=>{const root=rig();animateAthlete(root,0,0,'point');const arm=root.userData.bones.upperarm_r.rotation.x;assert.ok(arm<0&&arm>-1.3);for(let i=1;i<120;i++)animateAthlete(root,i/60,0,'idle');assert.ok(root.userData.actions.idle_breathe.weight>.19);assert.ok(Math.abs(root.userData.actions.idle.weight+root.userData.actions.idle_breathe.weight-1)<.001);});

test('shipped keeper rig holds hands forward with bent elbows and bounded reach',async()=>{
 const {athleteRig}=await import('./athlete-rig-fixture.mjs');const root=athleteRig();
 for(let frame=0;frame<180;frame++)animateAthlete(root,frame/60,0,'keeperReady');root.updateMatrixWorld(true);
 for(const side of ['l','r']){const b=root.userData.bones,point=name=>root.worldToLocal(b[name+'_'+side].getWorldPosition(new THREE.Vector3())),s=point('upperarm'),e=point('lowerarm'),w=point('hand');
  assert.ok(w.y<s.y-.12,'hands below shoulder');assert.ok(w.z>s.z+.08,'hands in front');assert.ok(e.clone().sub(s).normalize().dot(w.clone().sub(e).normalize())<.98,'elbows remain bent');assert.ok(s.distanceTo(w)<s.distanceTo(e)+e.distanceTo(w));
 }
});
test('keeper dive reaches both hands toward the save and blends back into running',async()=>{
 const {athleteRig}=await import('./athlete-rig-fixture.mjs');
 for(const side of [-1,1]){const root=athleteRig();root.userData.diveSide=side;
  for(let frame=0;frame<90;frame++)animateAthlete(root,frame/60,0,'keeperDive');root.updateMatrixWorld(true);
  for(const suffix of ['l','r']){const b=root.userData.bones,s=root.worldToLocal(b['upperarm_'+suffix].getWorldPosition(new THREE.Vector3())),w=root.worldToLocal(b['hand_'+suffix].getWorldPosition(new THREE.Vector3()));assert.ok((w.x-s.x)*side>.03,'both hands reach toward the ball');}
  for(let frame=90;frame<240;frame++)animateAthlete(root,frame/60,1,'idle');assert.ok(root.userData.keeperBlend<.001);assert.ok(root.userData.actions.run.getEffectiveWeight()>.99);
 }
});

test('a moving keeper uses the shipped lateral shuffle instead of running forward',async()=>{
 const {athleteRig}=await import('./athlete-rig-fixture.mjs');const root=athleteRig();root.userData.lateral=-.05;
 for(let frame=0;frame<90;frame++)animateAthlete(root,frame/60,.8,'keeperReady');
 assert.ok(root.userData.actions.strafe_left.getEffectiveWeight()>.99);assert.ok(root.userData.actions.run.getEffectiveWeight()<.01);
});
