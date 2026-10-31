import * as THREE from './vendor/three.module.js';
import {surface} from './surfaces.js';

// Original, metre-scaled street architecture. Repeated fittings share instanced draws.
const wallColors=[0xbba88a,0xa97961,0x7e9990,0xc2b99c,0x9a9982];
function mesh(parent,geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function block(parent,w,h,d,color,x,y,z,texture){return mesh(parent,new THREE.BoxGeometry(w,h,d),texture?surface(texture,color,Math.max(.3,w/2),Math.max(.3,h/2)):new THREE.MeshStandardMaterial({color,roughness:.9}),x,y,z);}
function batch(parent){const items=new Map();return {
 box(color,x,y,z,w,h,d,rx=0,ry=0,rz=0){const key=String(color);if(!items.has(key))items.set(key,[]);items.get(key).push({x,y,z,w,h,d,rx,ry,rz});},
 finish(){for(const [color,parts]of items){const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:Number(color),roughness:.88}),parts.length),m=new THREE.Matrix4(),q=new THREE.Quaternion();for(let i=0;i<parts.length;i++){const p=parts[i];q.setFromEuler(new THREE.Euler(p.rx,p.ry,p.rz));m.compose(new THREE.Vector3(p.x,p.y,p.z),q,new THREE.Vector3(p.w,p.h,p.d));inst.setMatrixAt(i,m);}inst.castShadow=true;inst.receiveShadow=true;parent.add(inst);}}
};}
function pipe(parent,a,b,r=.035,color=0x515950){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),m=mesh(parent,new THREE.CylinderGeometry(r,r,delta.length(),7),new THREE.MeshStandardMaterial({color,roughness:.7}));m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
function wire(parent,points,r=.013){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(parent,new THREE.TubeGeometry(curve,18,r,4,false),new THREE.MeshStandardMaterial({color:0x343930,roughness:.85}));}
function sign(parent,text,x,y,z,w=2.3){
 const canvas=globalThis.document?.createElement('canvas');if(!canvas)return;canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#d3c29b';ctx.fillRect?.(0,0,512,128);ctx.fillStyle='#354c43';ctx.fillRect?.(5,5,502,118);ctx.fillStyle='#e4d9b8';ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText?.(text,256,65,480);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const m=mesh(parent,new THREE.PlaneGeometry(w,.5),new THREE.MeshStandardMaterial({map,roughness:.95}),x,y,z);m.castShadow=false;
}
export function detailedHome(parent,x,z,w,d,h,tint=0xbba88a,index=0,front=0){
 const g=new THREE.Group();g.name='Street house '+index;g.position.set(x,0,z);g.rotation.y=front;parent.add(g);
 // A quarter-turn facade retains the caller's world-space collision footprint.
 if(Math.abs(Math.sin(front))>.5)[w,d]=[d,w];
 block(g,w,h,d,tint,0,h/2,0,'plastered_wall_02');
 const fittings=batch(g),face=d/2;
 fittings.box(0x8b8271,0,.19,face+.025,w,.38,.055);
 fittings.box(0x6b6456,0,h-.12,face+.035,w,.08,.07);
 const roofColor=index%3===0?0xa09b87:index%3===1?0x8b6f5b:0x7b8a85,roofRise=Math.min(.48,d*.12),pitch=Math.atan2(roofRise,d/2+.3);
 for(const side of [-1,1]){const roof=block(g,w+.5,.055,d/2+.4,roofColor,0,h+roofRise*.5+.1,side*d/4,'corrugated_iron_02');roof.rotation.x=side*pitch;fittings.box(0x68685b,0,h+.07,side*(face+.25),w+.5,.13,.09);}
 fittings.box(0x777566,0,h+roofRise+.13,0,w+.5,.08,.16);
 const doorX=index%2?w*.18:-w*.18;
 fittings.box(0x353d36,doorX,1.04,face+.035,1.08,2.08,.06);
 block(g,.92,1.96,.07,index%2?0x526c60:0x747967,doorX,1.01,face+.075,'wood_planks');
 for(const side of [-1,1])fittings.box(0xaaa38d,doorX+side*.55,1.07,face+.1,.07,2.14,.12);
 fittings.box(0xaaa38d,doorX,2.13,face+.1,1.16,.08,.12);
 fittings.box(0x3e4339,doorX+.3,1.04,face+.13,.045,.16,.08);
 fittings.box(0xb1a58c,doorX,.08,face+.12,1.15,.16,.24);
 const wx=doorX>0?-w*.28:w*.28;
 fittings.box(0x393f35,wx,1.57,face+.025,1.23,1.1,.06);
 fittings.box(0x263b38,wx,1.57,face+.065,1.08,.96,.04);
 for(let j=0;j<5;j++)fittings.box(index%2?0x6f7f70:0x8a8b76,wx,1.19+j*.18,face+.1,1.08,.13,.055,.14);
 for(const dx of [-.43,0,.43])fittings.box(0x353d35,wx+dx,1.57,face+.155,.025,1.03,.03);
 for(const dy of [-.5,.5])fittings.box(0x353d35,wx,1.57+dy,face+.155,1.14,.025,.03);
 fittings.box(0xb6aa91,wx,1.01,face+.13,1.38,.1,.24);
 // A side window makes corners read as buildings rather than blank cubes.
 const side=w/2+.035;
 fittings.box(0x37453c,side,1.6,-d*.15,.07,.92,1.2);
 for(let j=0;j<5;j++)fittings.box(0x748274,side+.045,1.22+j*.18,-d*.15,.055,.13,1.1);
 for(const dz of [-.44,0,.44])fittings.box(0x303d34,side+.085,1.6,-d*.15+dz,.03,.94,.025);
 // Small masonry repairs, vents and a meter stay inside the wall collision margin.
 for(let row=0;row<2;row++)for(let k=0;k<3;k++)fittings.box(index%2?0x997d62:0xaba18c,-w*.4+k*.22+(row%2)*.08,.15+row*.14,face+.034,.2,.12,.027);
 fittings.box(0x727a6b,w*.38,1.38,face+.11,.23,.32,.16);
 fittings.box(0x343f38,w*.38,1.43,face+.2,.13,.11,.015);
 for(let k=0;k<4;k++)fittings.box(0x666c5e,-w*.33+k*.14,h-.45,face+.04,.09,.09,.045);
 pipe(g,[-w*.46,.1,face+.1],[-w*.46,h+.05,face+.1],.028,0x797b68);
 pipe(g,[w*.38,1.55,face+.1],[w*.38,h-.2,face+.1],.009,0x4a5044);
 if(index%3===0&&h>3){const awning=block(g,w*.7,.04,.78,roofColor,0,2.55,face+.32,'corrugated_iron_02');awning.rotation.x=.11;fittings.box(0x6c6754,-w*.3,2.48,face+.28,.035,.08,.8);fittings.box(0x6c6754,w*.3,2.48,face+.28,.035,.08,.8);}
 if(index%2===0)sign(g,['PROVISIONS','COLD DRINKS','KOJO REPAIRS','BARBER SHOP'][Math.floor(index/2)%4],0,Math.min(h-.34,2.95),face+.12,Math.min(2.8,w*.68));
 fittings.finish();return g;
}
function bench(parent,x,z,rotation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);const b=batch(g);for(let i=0;i<3;i++)b.box(0x77634b,0,.47,-.18+i*.18,1.65,.07,.15);for(const side of [-1,1])b.box(0x5d5847,side*.58,.22,0,.08,.45,.5);b.finish();}
function basin(parent,x,z){const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);mesh(g,new THREE.CylinderGeometry(.24,.18,.22,12,1,true),new THREE.MeshStandardMaterial({color:0x788b84,roughness:.5,side:THREE.DoubleSide}),0,.11,0);mesh(g,new THREE.TorusGeometry(.24,.018,6,18),new THREE.MeshStandardMaterial({color:0xb0b6a5,roughness:.55}),0,.22,0).rotation.x=Math.PI/2;}
function planter(parent,x,z){const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);mesh(g,new THREE.CylinderGeometry(.25,.19,.4,10),new THREE.MeshStandardMaterial({color:0x98775b,roughness:.95}),0,.2,0);const leaves=[];for(let i=0;i<13;i++){const a=i*2.4,r=.19+(i%3)*.08,base=new THREE.Vector3(Math.sin(a)*.06,.4,Math.cos(a)*.06),tip=new THREE.Vector3(Math.sin(a)*r,.62+(i%4)*.09,Math.cos(a)*r),side=new THREE.Vector3(Math.cos(a)*.09,0,-Math.sin(a)*.09);leaves.push(...base.toArray(),...tip.clone().add(side).toArray(),...tip.clone().sub(side).toArray());}const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(leaves,3));geom.computeVertexNormals();mesh(g,geom,new THREE.MeshStandardMaterial({color:0x586a43,roughness:.95,side:THREE.DoubleSide}));}
function tree(parent,x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);pipe(g,[0,0,0],[.24,5,0],.15,0x6a6650);for(let i=0;i<5;i++){const a=i*2.4;pipe(g,[.12,3.3,0],[Math.sin(a)*1.4,4.5+i%2*.5,Math.cos(a)*1.4],.05,0x6a6650);}const geom=new THREE.IcosahedronGeometry(1,1),mat=new THREE.MeshStandardMaterial({color:0x5b704c,roughness:1}),foliage=new THREE.InstancedMesh(geom,mat,14),m=new THREE.Matrix4();for(let i=0;i<14;i++){const a=i*2.4,r=.6+(i%3)*.52;m.compose(new THREE.Vector3(Math.sin(a)*r,4.7+(i%4)*.27,Math.cos(a)*r),new THREE.Quaternion(),new THREE.Vector3(.85, .65, .95));foliage.setMatrixAt(i,m);}foliage.castShadow=true;g.add(foliage);}
function washing(parent,a,b){wire(parent,[a,[(a[0]+b[0])/2,Math.min(a[1],b[1])-.18,(a[2]+b[2])/2],b],.008);for(let i=1;i<5;i++){const t=i/5,x=THREE.MathUtils.lerp(a[0],b[0],t),z=THREE.MathUtils.lerp(a[2],b[2],t),y=THREE.MathUtils.lerp(a[1],b[1],t)-Math.sin(t*Math.PI)*.18;const cloth=mesh(parent,new THREE.PlaneGeometry(.45,.65,2,3),new THREE.MeshStandardMaterial({color:[0xc3b69b,0x647e82,0x9e7e65,0x748368][i-1],roughness:1,side:THREE.DoubleSide}),x,y-.32,z);cloth.rotation.y=Math.atan2(b[0]-a[0],b[2]-a[2])+Math.PI/2;cloth.rotation.z=(i%2?1:-1)*.05;}}
function groundWear(parent,width,length){const geometry=new THREE.CircleGeometry(1,18),material=new THREE.MeshStandardMaterial({color:0x967558,roughness:1,transparent:true,opacity:.12,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),inst=new THREE.InstancedMesh(geometry,material,28),m=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0));for(let i=0;i<28;i++){const x=Math.sin(i*7.13)*width*.46,z=Math.cos(i*3.71)*length*.45;m.compose(new THREE.Vector3(x,.006,z),q,new THREE.Vector3(.4+(i%4)*.23, .8+(i%5)*.4,1));inst.setMatrixAt(i,m);}inst.receiveShadow=true;parent.add(inst);}
export function neighbourhoodDetails(parent,solids){
 // Props sit on solid footprints; the existing alley navigation graph stays intact.
 const decor=batch(parent);for(let i=0;i<solids.length;i++){const o=solids[i];if(o.w<2||o.d<2||o.w>10||o.d>10)continue;const x=o.x-o.w*.33,z=o.z+o.d/2-.02;decor.box(0x9c9179,x,.12,z,.55,.24,.18);decor.box(0x596556,x,.28,z,.44,.06,.19);}
 for(const [x,z]of [[-15.55,-11],[-15.55,7],[15.55,-6],[15.55,10]])planter(parent,x,z);
 washing(parent,[-6,3.3,-5.5],[-3,3.3,-5.5]);washing(parent,[5,3.5,8],[8,3.5,8]);
 for(const x of [-15.65,15.65]){pipe(parent,[x,0,-14],[x,7,-14],.07,0x777564);wire(parent,[[x,6.8,-14],[x,6.2,0],[x,6.8,14]],.015);}
 wire(parent,[[-15.65,6.8,-14],[0,5.9,-14],[15.65,6.8,-14]],.015);
 for(const [x,z]of [[-20,-10],[20,5],[0,-22],[-20,16],[13,22]])tree(parent,x,z,1.1);
 for(let i=0;i<6;i++)detailedHome(parent,-16+i*6.4,-23,6,4,3.6+i%3*.35,wallColors[i%5],30+i);
 groundWear(parent,30,30);decor.finish();
}
export function streetCourtDetails(parent,wide=false){
 const edge=wide?10.25:4.8,decor=batch(parent);
 for(const side of [-1,1]){
  const x=side*edge;
  // Shallow open drains and segmented concrete edges stay beyond the players' bounds.
  decor.box(0x484c3d,x,.012,0,.18,.025,34);
  for(let i=0;i<24;i++){const z=-16.3+i*1.4;decor.box(0x9d9784,x+side*.2,.07,z,.22,.14,1.34);if(i%5===0)for(let j=0;j<5;j++)decor.box(0x747564,x,.065,z-.3+j*.15,.35,.035,.055);}
  pipe(parent,[x+side*.5,0,-12],[x+side*.5,6.5,-12],.07,0x7f7761);
  wire(parent,[[x+side*.5,6.35,-12],[x+side*.5,5.8,0],[x+side*.5,6.35,14]],.014);
  for(const z of [-5,8])bench(parent,x+side*.45,z,Math.PI/2);
  planter(parent,x+side*.4,-8.8);basin(parent,x+side*.45,10.8);
  tree(parent,x+side*4.4,-18,1.15);tree(parent,x+side*4.4,19,1.15);
 }
 wire(parent,[[-edge-.5,6.35,-12],[0,5.5,-12],[edge+.5,6.35,-12]],.014);
 washing(parent,[-edge-.4,3.5,16],[edge+.4,3.5,16]);
 for(let i=0;i<3;i++)detailedHome(parent,(i-1)*7,-18,6.8,4,3.8+i*.3,wallColors[(i+2)%5],40+i);
 groundWear(parent,edge*2,27);decor.finish();
}

// Baking static fittings into colour/material groups keeps richer facades inexpensive.
// Textured meshes retain their own UV tiling; transparent ground marks remain separate.
export function compactVenueGeometry(parent){
 parent.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),groups=new Map(),original=[];
 parent.traverse(o=>{const mat=o.material;if(!o.isMesh||Array.isArray(mat)||!mat||mat.map||mat.normalMap||mat.roughnessMap||mat.transparent)return;const key=[mat.color?.getHex(),mat.roughness,mat.metalness,mat.side,o.castShadow,o.receiveShadow].join(':');let group=groups.get(key);if(!group){group={material:mat,positions:[],normals:[],uvs:[],indices:[],castShadow:o.castShadow,receiveShadow:o.receiveShadow};groups.set(key,group);}const geo=o.geometry,position=geo.attributes.position,normal=geo.attributes.normal,uv=geo.attributes.uv,baseMatrix=inverse.clone().multiply(o.matrixWorld);for(let instance=0;instance<(o.isInstancedMesh?o.count:1);instance++){const matrix=baseMatrix.clone();if(o.isInstancedMesh){const local=new THREE.Matrix4();o.getMatrixAt(instance,local);matrix.multiply(local);}const normalMatrix=new THREE.Matrix3().getNormalMatrix(matrix),offset=group.positions.length/3,p=new THREE.Vector3(),n=new THREE.Vector3();for(let i=0;i<position.count;i++){p.fromBufferAttribute(position,i).applyMatrix4(matrix);group.positions.push(p.x,p.y,p.z);if(normal)n.fromBufferAttribute(normal,i).applyMatrix3(normalMatrix).normalize();else n.set(0,1,0);group.normals.push(n.x,n.y,n.z);group.uvs.push(uv?.getX(i)||0,uv?.getY(i)||0);}if(geo.index)for(let i=0;i<geo.index.count;i++)group.indices.push(offset+geo.index.getX(i));else for(let i=0;i<position.count;i++)group.indices.push(offset+i);}original.push(o);});
 const retained=new Set([...groups.values()].map(g=>g.material)),disposedGeometry=new Set(),disposedMaterial=new Set();for(const old of original){old.removeFromParent();if(!disposedGeometry.has(old.geometry)){old.geometry.dispose();disposedGeometry.add(old.geometry);}if(!retained.has(old.material)&&!disposedMaterial.has(old.material)){old.material.dispose();disposedMaterial.add(old.material);}}
 for(const group of groups.values()){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(group.positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(group.normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(group.uvs,2));geometry.setIndex(group.indices);geometry.computeBoundingSphere();const m=new THREE.Mesh(geometry,group.material);m.name='Batched street details';m.castShadow=group.castShadow;m.receiveShadow=group.receiveShadow;parent.add(m);}
}
