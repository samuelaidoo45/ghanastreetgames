import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {clone as cloneRig} from './vendor/addons/utils/SkeletonUtils.js';
let template=null,clips=[];
const loader=new GLTFLoader();
export async function loadAthletes(progress=()=>{}){
 const names=['body','shirt','shorts','shoes','hair','afro'];let completed=0;
 const outfits=await Promise.all(names.map(async name=>{const gltf=await loader.loadAsync(`assets/characters/athlete-${name}.glb`);progress(++completed,names.length);return gltf;}));
 const body=outfits[0];let skeleton;body.scene.traverse(o=>{if(o.isSkinnedMesh&&!skeleton)skeleton=o.skeleton;});
 body.scene.updateMatrixWorld(true);
 for(const outfit of outfits.slice(1)){outfit.scene.updateMatrixWorld(true);const parts=[];outfit.scene.traverse(o=>{if(o.isSkinnedMesh)parts.push(o);});for(const mesh of parts){mesh.removeFromParent();mesh.bind(skeleton,mesh.bindMatrix);body.scene.add(mesh);}}
 template=body.scene;clips=body.animations;template.traverse(o=>{const zone=o.geometry?.getAttribute('_cczone'),index=o.geometry?.index;if(zone&&index){const kept=[];for(let i=0;i<index.count;i+=3){const triangle=[index.getX(i),index.getX(i+1),index.getX(i+2)];if(!triangle.every(v=>(zone.getX(v)&265)!==0))kept.push(...triangle);}o.geometry.setIndex(kept);}});
 template.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.userData.sharedAsset=true;if(o.material){o.material.roughness=Math.max(o.material.roughness??.7,.65);o.material.metalness=0;}}});
}
export function createAthlete(parent,{x=0,z=0,color=0xa93424,skin=0x895237,scale=1}={}){
 if(!template)return null;
 const root=new THREE.Group(),model=cloneRig(template);root.add(model);parent?.add(root);root.position.set(x,0,z);root.scale.setScalar(scale);model.scale.setScalar(1.16);
 const afro=Math.abs(Math.round(x*3+z*7))%3===0;const bones={};model.traverse(o=>{if(o.isBone)bones[o.name]=o;if(o.isMesh){if(o.name==='Hair_afro01')o.visible=afro;if(o.name==='Hair_short04')o.visible=!afro;o.userData.sharedAsset=true;if(o.material){const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const n=m.clone();n.userData.sharedTextures=true;if(n.name==='Skin')n.color.setHex(skin);if(n.name==='Cloth_tshirt')n.color.setHex(color);if(n.name==='Cloth_shorts')n.color.setHex(0x202d31);if(n.name==='Cloth_shoes')n.color.setHex(0x363a36);if(n.name.startsWith('Hair'))n.color.setHex(0x1d1612);return n;});o.material=Array.isArray(o.material)?materials:materials[0];}}});
 const mixer=new THREE.AnimationMixer(model),actions={};for(const clip of clips){const a=mixer.clipAction(clip);a.play();a.setEffectiveWeight(0);actions[clip.name]=a;}actions.idle?.setEffectiveWeight(1);mixer.update(0);
 root.userData={human:true,model,mixer,actions,bones,run:0,pose:'idle',jump:0,lastT:null,phase:Math.random()*6,skin,kick:0,lean:0,rest:{}};
 return root;
}
export function animateAthlete(root,t,speed=0,pose='idle',jump=0){
 const u=root.userData,dt=u.lastT===null?1/60:THREE.MathUtils.clamp(t-u.lastT,0,.06);u.lastT=t;
 const moving=Math.min(1,Math.abs(speed));const action=moving>.12?'run':'idle';
 for(const [name,a]of Object.entries(u.actions)){const target=name===action?1:0;a.setEffectiveWeight(THREE.MathUtils.damp(a.getEffectiveWeight(),target,10,dt));if(name==='run')a.timeScale=.82+moving*.3;}
 u.mixer.update(dt);u.model.position.y=jump;const b=u.bones;
 const rot=(name,x=0,y=0,z=0)=>{const bone=b[name];if(bone){bone.rotation.x+=x;bone.rotation.y+=y;bone.rotation.z+=z;}};
 // Additive gestures preserve the imported rig and its natural gait.
 if(pose==='clap'){rot('upperarm_l',-.8,0,-.55);rot('upperarm_r',-.8,0,.55);rot('lowerarm_l',-1);rot('lowerarm_r',-1);}
 if(pose==='cheer'){rot('upperarm_l',-.35,0,-2.3);rot('upperarm_r',-.35,0,2.3);}
 if(pose==='left')rot('thigh_l',-.75);if(pose==='right')rot('thigh_r',-.75);
 if(pose==='head'){rot('upperarm_l',-.2,0,-1.8);rot('upperarm_r',-.2,0,1.8);rot('lowerarm_l',-1.4);rot('lowerarm_r',-1.4);}
 if(pose==='hips'){rot('upperarm_l',.15,0,-.55);rot('upperarm_r',.15,0,.55);rot('lowerarm_l',-1.1);rot('lowerarm_r',-1.1);}
 if(pose==='knees'||pose==='sit'){rot('thigh_l',-1.2);rot('thigh_r',-1.2);rot('calf_l',pose==='sit'?.15:1.6);rot('calf_r',pose==='sit'?.15:1.6);u.model.position.y-=pose==='sit'?.74:.45;rot('spine_01',.3);}
 if(pose==='fold-left'||pose==='fold-right'){rot('thigh_l',-1.2);rot('thigh_r',-1.2);rot(pose==='fold-left'?'calf_l':'calf_r',1.9);u.model.position.y-=.74;}
 if(pose==='band'){rot('upperarm_l',-1.25,0,-.3);rot('lowerarm_l',-.15);rot('upperarm_r',-.9,0,.35);rot('lowerarm_r',-.4-(u.bandPull||0)*1.2);}
 if(pose==='point'){rot('upperarm_r',-1.3);rot('lowerarm_r',-.2);}
 if(pose==='reach'){rot('spine_01',.45);rot('upperarm_r',-.7);rot('thigh_l',-.3);rot('calf_l',.6);u.model.position.y-=.12;}
 if(u.kick>0){u.kick=Math.max(0,u.kick-dt);const swing=Math.sin((1-u.kick/.38)*Math.PI);rot('thigh_r',-1.25*swing);rot('calf_r',.3*swing);rot('upperarm_l',.5*swing);}
 u.model.rotation.z=THREE.MathUtils.damp(u.model.rotation.z,u.lean||0,9,dt);
}
export function disposeAthlete(root){root.userData.mixer?.stopAllAction();root.traverse(o=>{if(o.skeleton)o.skeleton.dispose();if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});}
