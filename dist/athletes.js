import {animateJumpShape} from './jump-animation.js';
import {finishJersey} from './scene-finish.js';
import {femaleGeometry} from './female-shape.js';
import {animateAmpeArms} from './ampe-motion.js';
import {animateKeeperArms} from './keeper-arms.js';
import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {clone as cloneRig} from './vendor/addons/utils/SkeletonUtils.js';
let template=null,clips=[];
const loader=new GLTFLoader();
export async function loadAthletes(progress=()=>{},quality="high"){
 const names=['body','shirt','shorts','shoes','hair','afro'];let completed=0;
 const outfits=await Promise.all(names.map(async name=>{const gltf=await loader.loadAsync(`assets/${quality==='low'?'mobile/':''}characters/athlete-${name}.glb`);progress(++completed,names.length);return gltf;}));
 const body=outfits[0];let skeleton;body.scene.traverse(o=>{if(o.isSkinnedMesh&&!skeleton)skeleton=o.skeleton;});
 body.scene.updateMatrixWorld(true);
 for(const outfit of outfits.slice(1)){outfit.scene.updateMatrixWorld(true);const parts=[];outfit.scene.traverse(o=>{if(o.isSkinnedMesh)parts.push(o);});for(const mesh of parts){mesh.removeFromParent();mesh.bind(skeleton,mesh.bindMatrix);body.scene.add(mesh);}}
 template=body.scene;clips=body.animations;template.traverse(o=>{const zone=o.geometry?.getAttribute('_cczone'),index=o.geometry?.index;if(zone&&index){const kept=[];for(let i=0;i<index.count;i+=3){const triangle=[index.getX(i),index.getX(i+1),index.getX(i+2)];if(!triangle.every(v=>(zone.getX(v)&265)!==0))kept.push(...triangle);}o.geometry.setIndex(kept);}});
 template.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.userData.sharedAsset=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m)continue;m.metalness=0;for(const key of ['map','normalMap','roughnessMap'])if(m[key])m[key].anisotropy=8;}}});
}
export function createAthlete(parent,{x=0,z=0,color=0xa93424,skin=0x895237,scale=1,gender='male'}={}){
 if(!template)return null;
 const root=new THREE.Group(),model=cloneRig(template);root.add(model);parent?.add(root);root.position.set(x,0,z);root.scale.setScalar(scale);const identity=Math.abs(Math.round(x*97+z*131))%5,heights=[1,.98,1.025,.965,1.015],builds=[1,.97,1.025,1.01,.985];model.scale.set(1.28*builds[identity],1.34*heights[identity],1.28*builds[identity]);
 const afro=gender==='female'||Math.abs(Math.round(x*3+z*7))%3===0;const bones={};model.traverse(o=>{if(o.isBone)bones[o.name]=o;if(o.isMesh){if(gender==='female')o.geometry=femaleGeometry(o.geometry,o.name);if(o.name==='Hair_afro01')o.visible=afro;if(o.name==='Hair_short04')o.visible=!afro;o.userData.sharedAsset=true;if(o.material){const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const n=m.clone();n.userData.sharedTextures=true;if(n.name==='Skin'){n.color.setHex(skin).lerp(new THREE.Color([0x89573e,0x744a34,0x976344,0x634331,0x805039][identity]),.25);n.roughness=.62;n.normalScale?.set(.65,.65);n.envMapIntensity=.8;}
 if(n.name==='Cloth_tshirt'){n.color.setHex(color);n.roughness=.78;n.normalScale?.set(.9,.9);finishJersey(n,o.geometry);}
 if(n.name==='Cloth_shorts'){n.color.setHex([0x283438,0x34312a,0x222f3e,0x302b29,0x2b3532][identity]);n.roughness=.9;}
 if(n.name==='Cloth_shoes'){n.color.setHex([0xe4d6b2,0x2c3334,0xb4502f,0x284945,0xc9b16b][identity]);n.roughness=.7;}
 if(n.name.startsWith('Hair')){n.color.setHex(identity%2?0x241b16:0x191714);n.roughness=.82;}
 if(n.name==='Eye'||n.name==='Iris')n.roughness=.18;
 if(n.name==='Cornea'){n.roughness=.035;n.depthWrite=false;}
 if(n.name==='Teeth')n.roughness=.35;
 return n;});o.material=Array.isArray(o.material)?materials:materials[0];}}});
 const mixer=new THREE.AnimationMixer(model),actions={};for(const clip of clips){const a=mixer.clipAction(clip);a.play();a.setEffectiveWeight(0);actions[clip.name]=a;}actions.idle?.setEffectiveWeight(1);mixer.update(0);
 root.updateMatrixWorld(true);const feet=['foot_l','foot_r'].map(n=>bones[n]).filter(Boolean);const restFootY=feet.length?Math.min(...feet.map(b=>root.worldToLocal(b.getWorldPosition(new THREE.Vector3())).y)):0;
 root.userData={gender,basePose:Object.fromEntries(Object.entries(bones).map(([n,b])=>[n,b.quaternion.clone()])),gestures:{},feet,restFootY,human:true,model,mixer,actions,bones,run:0,pose:'idle',jump:0,lastT:null,phase:Math.random()*6,skin,kick:0,lean:0,rest:{}};
 return root;
}
export function animateAthlete(root,t,speed=0,pose='idle',jump=0){
 const u=root.userData,dt=u.lastT===null?1/60:THREE.MathUtils.clamp(t-u.lastT,0,.06);u.lastT=t;
 const moving=Math.min(1,Math.abs(speed)),shuffle=pose.startsWith('keeper')&&moving>.12&&Math.abs(u.lateral||0)>.00001?(u.lateral<0?'strafe_left':'strafe_right'):null;const action=moving>.12?(shuffle&&u.actions[shuffle]?shuffle:'run'):'idle';u.basePose??=Object.fromEntries(Object.entries(u.bones).map(([n,b])=>[n,b.quaternion.clone()]));u.gestures??={};for(const [name,q]of Object.entries(u.basePose))u.bones[name].quaternion.copy(q);
 for(const [name,a]of Object.entries(u.actions)){const target=action==='idle'&&u.actions.idle_breathe?(name==='idle'?.8:name==='idle_breathe'?.2:0):name===action?1:0;a.setEffectiveWeight(THREE.MathUtils.damp(a.getEffectiveWeight(),target,10,dt));if(name==='run')a.timeScale=.82+moving*.3;}
 u.mixer.update(dt);for(const [name,q]of Object.entries(u.basePose))q.copy(u.bones[name].quaternion);u.model.position.y=jump;const b=u.bones,offsets={};
 const rot=(name,x=0,y=0,z=0)=>{if(!b[name])return;const o=offsets[name]??={x:0,y:0,z:0};o.x+=x;o.y+=y;o.z+=z;};
 // Additive gestures preserve the imported rig and its natural gait.
 if(pose==='ampe'){rot('thigh_'+(u.ampeFoot?'r':'l'),-.65*(u.ampeExtend||0));rot('calf_'+(u.ampeFoot?'r':'l'),.35*(u.ampeExtend||0));u.model.position.y-=u.ampeCrouch||0;}if(pose==='clap'){rot('upperarm_l',-.8,0,-.55);rot('upperarm_r',-.8,0,.55);rot('lowerarm_l',-1);rot('lowerarm_r',-1);}
 if(pose==='defend'){rot('spine_01',.1);rot('thigh_l',-.13);rot('thigh_r',-.09);rot('calf_l',.12);rot('lowerarm_l',-.16);rot('lowerarm_r',-.12);}
 if(pose==='keeperReady'){rot('spine_01',.12);rot('thigh_l',-.12);rot('thigh_r',-.12);}
 if(pose==='keeperDive'){rot('thigh_l',-.25);rot('thigh_r',.15);rot('calf_r',.35);}
 if(pose==='cheer'){rot('upperarm_l',-.35,0,-2.3);rot('upperarm_r',-.35,0,2.3);}
 if(pose==='left')rot('thigh_l',-.75);if(pose==='right')rot('thigh_r',-.75);
 if(pose==='head'){rot('upperarm_l',-.2,0,-1.8);rot('upperarm_r',-.2,0,1.8);rot('lowerarm_l',-1.4);rot('lowerarm_r',-1.4);}
 if(pose==='hips'){rot('upperarm_l',.15,0,-.55);rot('upperarm_r',.15,0,.55);rot('lowerarm_l',-1.1);rot('lowerarm_r',-1.1);}
 if(pose==='knees'||pose==='sit'){rot('thigh_l',-1.2);rot('thigh_r',-1.2);rot('calf_l',pose==='sit'?.15:1.6);rot('calf_r',pose==='sit'?.15:1.6);u.model.position.y-=pose==='sit'?.74:.45;rot('spine_01',.3);}
 if(pose==='fold-left'||pose==='fold-right'){rot('thigh_l',-1.2);rot('thigh_r',-1.2);rot(pose==='fold-left'?'calf_l':'calf_r',1.9);u.model.position.y-=.74;}
 if(pose==='band'){rot('upperarm_l',-1.25,0,-.3);rot('lowerarm_l',-.15);rot('upperarm_r',-.9,0,.35);rot('lowerarm_r',-.4-(u.bandPull||0)*1.2);}
 if(pose==='point'){rot('upperarm_r',-1.3);rot('lowerarm_r',-.2);}
 if(pose==='reach'){rot('spine_01',.45);rot('upperarm_r',-.7);rot('thigh_l',-.3);rot('calf_l',.6);u.model.position.y-=.12;}
 if(moving>.12&&u.dribble){rot('thigh_r',-.13*u.dribble);rot('lowerarm_l',-.05*u.dribble);}
 if(u.kick>0){u.kick=Math.max(0,u.kick-dt);const swing=Math.sin((1-u.kick/.38)*Math.PI);rot('thigh_r',-1.25*swing);rot('calf_r',.3*swing);rot('upperarm_l',.5*swing);}
 for(const name of new Set([...Object.keys(offsets),...Object.keys(u.gestures)])){const target=offsets[name]||{x:0,y:0,z:0},current=u.gestures[name]??={x:0,y:0,z:0};for(const axis of ['x','y','z']){current[axis]=THREE.MathUtils.damp(current[axis],target[axis],18,dt);b[name].rotation[axis]+=current[axis];}}
 if(['knees','fold-left','fold-right'].includes(pose)&&u.feet?.length){root.updateMatrixWorld(true);const lowest=Math.min(...u.feet.map(foot=>root.worldToLocal(foot.getWorldPosition(new THREE.Vector3())).y));u.model.position.y+=THREE.MathUtils.clamp(u.restFootY+jump-lowest,-.8,.8);}
 u.model.rotation.z=THREE.MathUtils.damp(u.model.rotation.z,u.lean||0,9,dt);
 animateKeeperArms(root,pose,moving,dt);if(pose==='ampe')animateAmpeArms(root);animateJumpShape(root,pose,dt);
}
export function disposeAthlete(root){root.userData.mixer?.stopAllAction();root.traverse(o=>{if(o.skeleton)o.skeleton.dispose();if(o.userData.contactShadow)o.geometry.dispose();if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});}
