import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {compactVenueGeometry} from '../dist/venue-details.js';
import {courtPatina,contactShadow,venueShadow,finishJersey} from '../dist/scene-finish.js';
import {clearVenue} from '../dist/venues.js';
const gradient={addColorStop(){}};
const ctx=new Proxy({createRadialGradient(){return gradient;}},{get:(o,k)=>o[k]||(()=>{})});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};

test('textured static batching preserves world-space bounds and each original UV repeat',()=>{
 const group=new THREE.Group(),source=new THREE.Texture({width:16,height:16});source.wrapS=source.wrapT=THREE.RepeatWrapping;
 for(const [x,repeat]of [[-3,2],[3,5]]){const map=source.clone();map.repeat.set(repeat,repeat);const mesh=new THREE.Mesh(new THREE.BoxGeometry(2,3,1),new THREE.MeshStandardMaterial({map,color:0x987654}));mesh.position.x=x;group.add(mesh);}
 const before=new THREE.Box3().setFromObject(group);compactVenueGeometry(group);
 assert.equal(group.children.length,1,'two identical surfaces become one draw');const mesh=group.children[0],after=new THREE.Box3().setFromObject(group);assert.ok(before.equals(after));assert.deepEqual(mesh.material.map.repeat.toArray(),[1,1]);
 assert.equal(mesh.material.map.source,source.source);const uv=mesh.geometry.attributes.uv;assert.equal(Math.max(...Array.from({length:24},(_,i)=>uv.getX(i))),2);assert.equal(Math.max(...Array.from({length:24},(_,i)=>uv.getX(i+24))),5);
});
test('venue disposal releases local art but keeps shared patina and contact maps reusable',()=>{
 const scene=new THREE.Scene(),venue=new THREE.Group();scene.add(venue);const finish=courtPatina(venue,20,20,'dirt'),contact=contactShadow(venue),shadow=venueShadow(venue,[{x:0,z:0,w:5,d:4,h:3}]);
 let sharedDisposed=0,localDisposed=0;finish.material.map.addEventListener('dispose',()=>sharedDisposed++);contact.material.map.addEventListener('dispose',()=>sharedDisposed++);shadow.material.map.addEventListener('dispose',()=>localDisposed++);
 clearVenue({scene,venue});assert.equal(sharedDisposed,0);assert.equal(localDisposed,1);assert.equal(scene.children.length,0);
 const replacement=courtPatina(new THREE.Group(),12,18,'dirt');assert.equal(replacement.material.map,finish.material.map);assert.equal(replacement.geometry.parameters.width,12);
});
test('kit shader preserves normal Three.js skinning and differentiates garment bounds',()=>{
 const materials=[new THREE.MeshStandardMaterial(),new THREE.MeshStandardMaterial()];const geometries=[new THREE.BoxGeometry(1,1,1),new THREE.BoxGeometry(1,2,1)];
 materials.forEach((m,i)=>finishJersey(m,geometries[i]));assert.notEqual(materials[0].customProgramCacheKey(),materials[1].customProgramCacheKey());const shader={vertexShader:'#include <common>\n#include <begin_vertex>\n#include <skinning_vertex>',fragmentShader:'#include <common>\n#include <color_fragment>'};materials[0].onBeforeCompile(shader);assert.match(shader.vertexShader,/#include <skinning_vertex>/);assert.match(shader.fragmentShader,/chestBand/);
});

test('coastal pavement surfaces clear the surrounding terrain instead of z-fighting',async()=>{
 const {footballStreetscape}=await import('../dist/venue-details.js');const group=new THREE.Group();footballStreetscape(group,'concrete',10,10,[]);const pavements=[];group.traverse(o=>{const p=o.geometry?.parameters;if(p?.width===2.6&&p.height===.09)pavements.push(o);});assert.equal(pavements.length,2);
 for(const p of pavements){const bounds=new THREE.Box3().setFromObject(p);assert.ok(bounds.max.y>=.05,'pavement top is above y=0 terrain');}
});
