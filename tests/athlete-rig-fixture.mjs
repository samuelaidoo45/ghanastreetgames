import {readFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
// The shipped skeleton and animation tracks, without textures or WebGL.
export function athleteRig(){
 const bytes=readFileSync(new URL('../dist/assets/mobile/characters/athlete-body.glb',import.meta.url)),jsonSize=bytes.readUInt32LE(12),g=JSON.parse(bytes.subarray(20,20+jsonSize).toString()),binary=20+jsonSize+8;
 const nodes=g.nodes.map(n=>{const o=new THREE.Bone();o.name=n.name||'';if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});
 g.nodes.forEach((n,i)=>n.children?.forEach(j=>nodes[i].add(nodes[j])));
 const root=new THREE.Group(),model=new THREE.Group();root.add(model);for(const i of g.scenes[g.scene||0].nodes)model.add(nodes[i]);model.scale.set(1.18,1.28,1.18);
 function values(index){const a=g.accessors[index],view=g.bufferViews[a.bufferView],size={SCALAR:1,VEC3:3,VEC4:4}[a.type];if(a.componentType!==5126)throw new Error('Expected float animation data');return Array.from({length:a.count*size},(_,i)=>bytes.readFloatLE(binary+view.byteOffset+(a.byteOffset||0)+Math.floor(i/size)*(view.byteStride||size*4)+(i%size)*4));}
 const mixer=new THREE.AnimationMixer(model),actions={};
 for(const animation of g.animations){const tracks=animation.channels.filter(c=>c.target.path!=='weights').map(c=>{const s=animation.samplers[c.sampler],property={rotation:'quaternion',translation:'position',scale:'scale'}[c.target.path],Track=property==='quaternion'?THREE.QuaternionKeyframeTrack:THREE.VectorKeyframeTrack;return new Track(nodes[c.target.node].uuid+'.'+property,values(s.input),values(s.output),s.interpolation==='STEP'?THREE.InterpolateDiscrete:THREE.InterpolateLinear);});const action=mixer.clipAction(new THREE.AnimationClip(animation.name,-1,tracks));action.play();action.setEffectiveWeight(animation.name==='idle'?1:0);actions[animation.name]=action;}
 mixer.update(0);const bones=Object.fromEntries(nodes.filter(n=>n.name).map(n=>[n.name,n]));
 root.userData={model,bones,mixer,actions,lastT:null,kick:0,lean:0};return root;
}
