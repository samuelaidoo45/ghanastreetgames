import * as THREE from './vendor/three.module.js';

// Original, deterministic art. One cached texture per surface; no extra downloads.
const finishes=new Map();let contactMap;
function canvas(size){if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');return x?.createRadialGradient&&x?.arc?{c,x}:null;}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function courtPatina(parent,w,d,type='dirt',markings=true){
 const key=type+(markings?'-court':'-ground');
 if(!finishes.has(key)){
  const art=canvas(512);if(!art)return null;const {c,x}=art,r=rng(type==='concrete'?62:type==='grass'?87:31),n=1024;x.scale(.5,.5);
  x.clearRect(0,0,n,n);
  if(type==='concrete'){
   // Faded municipal court paint, with a dusty unpainted perimeter.
   x.fillStyle='rgba(31,88,94,.52)';x.fillRect(28,28,968,968);
   x.fillStyle='rgba(186,138,80,.36)';x.fillRect(28,28,180,968);x.fillRect(816,28,180,968);
   x.strokeStyle='rgba(245,218,162,.48)';x.lineWidth=5;x.strokeRect(30,30,964,964);
   for(let i=0;i<20;i++){let px=r()*n,py=r()*n;x.beginPath();x.moveTo(px,py);for(let j=0;j<5;j++){px+=(r()-.5)*70;py+=r()*28;x.lineTo(px,py);}x.strokeStyle='rgba(44,45,38,.16)';x.lineWidth=.7+r();x.stroke();}
  }else if(type==='grass'){
   for(let i=0;i<10;i++){x.fillStyle=i%2?'rgba(14,56,22,.15)':'rgba(167,179,65,.09)';x.fillRect(i*n/10,0,n/10,n);}
  }
  for(let i=0;i<90;i++){
   const px=r()*n,py=r()*n,rad=12+r()*100,g=x.createRadialGradient(px,py,0,px,py,rad);
   g.addColorStop(0,type==='grass'?'rgba(154,111,54,.14)':i%2?'rgba(255,219,158,.035)':'rgba(58,39,22,.065)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px-rad,py-rad,rad*2,rad*2);
  }
  // Tiny gravel, worn flecks and shoe tracks break the repeated PBR texture.
  for(let i=0;i<3000;i++){const px=r()*n,py=r()*n;x.fillStyle=i%3?'rgba(248,223,177,.16)':'rgba(47,38,27,.17)';x.fillRect(px,py,.5+r()*2,1+r()*3);}
  for(let i=0;i<180;i++){x.save();x.translate(r()*n,r()*n);x.rotate(r()*6.28);x.fillStyle='rgba(55,35,22,.075)';x.fillRect(-1,-4,2,8);x.restore();}
  if(type==='dirt'){for(let i=0;i<4;i++){x.beginPath();x.ellipse(n*.5,n*.48,120+i*2,270+i*2,-.35,.2,5.4);x.strokeStyle='rgba(65,38,22,.085)';x.lineWidth=2;x.stroke();}}
  if(markings&&type!=='grass'){
   x.save();x.fillStyle='rgba(255,235,191,.38)';x.font='bold 35px sans-serif';x.textAlign='center';x.translate(130,512);x.rotate(-Math.PI/2);x.fillText('STREET KINGS',0,0);x.restore();
   x.save();x.fillStyle='rgba(255,235,191,.38)';x.font='bold 35px sans-serif';x.textAlign='center';x.translate(894,512);x.rotate(Math.PI/2);x.fillText('AKWAABA',0,0);x.restore();
  }
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;tex.userData.sharedAsset=true;finishes.set(key,tex);
 }
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:finishes.get(key),transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1}));
 m.name='Worn '+type+' court';m.rotation.x=-Math.PI/2;m.position.y=.003;m.receiveShadow=true;parent.add(m);return m;
}
export function contactShadow(parent,radius=.48){
 if(!contactMap){const art=canvas(64);if(!art)return null;const {c,x}=art,g=x.createRadialGradient(32,32,3,32,32,31);g.addColorStop(0,'rgba(25,18,12,.5)');g.addColorStop(.4,'rgba(25,18,12,.24)');g.addColorStop(1,'rgba(25,18,12,0)');x.fillStyle=g;x.fillRect(0,0,64,64);contactMap=new THREE.CanvasTexture(c);contactMap.userData.sharedAsset=true;}
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(radius*2,radius*2),new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));mesh.name='Foot contact shadow';mesh.rotation.x=-Math.PI/2;mesh.position.y=.018;mesh.userData.contactShadow=true;parent.add(mesh);return mesh;
}

// Material accents are evaluated in the original garment coordinates, so they
// follow the skinning without extra meshes, textures or animation work.
export function finishJersey(material,geometry){
 geometry.computeBoundingBox();const b=geometry.boundingBox,lo=b.min.y,span=Math.max(.01,b.max.y-lo);
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vJerseyHeight;').replace('#include <begin_vertex>',`#include <begin_vertex>\nvJerseyHeight = (position.y - ${lo.toFixed(6)}) / ${span.toFixed(6)};`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vJerseyHeight;').replace('#include <color_fragment>','#include <color_fragment>\nfloat chestBand = smoothstep(0.62,0.635,vJerseyHeight) * (1.0-smoothstep(0.68,0.695,vJerseyHeight));\nfloat hem = 1.0-smoothstep(0.04,0.065,vJerseyHeight);\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86,0.79,0.57),chestBand * 0.7);\ndiffuseColor.rgb *= 1.0 - hem * 0.25;');
 };
 material.customProgramCacheKey=()=>`street-kit-${lo.toFixed(6)}-${span.toFixed(6)}`;
}

export function venueShadow(parent,solids){
 const art=canvas(1024);if(!art)return null;const {c,x}=art,extent=96,scale=1024/extent;
 // A single baked ground layer substitutes for the shadow-map pass on phones.
 x.translate(512,512);x.scale(scale,scale);x.fillStyle='rgba(39,35,39,.23)';
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(const s of solids){
  const points=[];for(const dx of [-s.w/2,s.w/2])for(const dz of [-s.d/2,s.d/2]){points.push([s.x+dx,s.z+dz],[s.x+dx+s.h*22/24,s.z+dz-s.h*14/24]);}points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const lower=[],upper=[];for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}for(const p of [...points].reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}const hull=lower.slice(0,-1).concat(upper.slice(0,-1));
  x.beginPath();hull.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.fill();
 }
 const map=new THREE.CanvasTexture(c),m=new THREE.Mesh(new THREE.PlaneGeometry(extent,extent),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));m.name='Mobile baked building shadows';m.rotation.x=-Math.PI/2;m.position.y=.004;parent.add(m);return m;
}
