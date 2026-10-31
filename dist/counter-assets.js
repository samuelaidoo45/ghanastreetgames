import * as THREE from './vendor/three.module.js';

// Original bottle-top and folded-paper models. Their dimensions are in the
// counter game's local units; the caller places/scales the complete floor set.
const finishes={coke:{color:0xa72c27,ink:'#f0e4ce',word:'Coke',metal:true},pepsi:{color:0x235b91,ink:'#f4eee1',word:'Pepsi',metal:true},water:{color:0x8cb9c6,ink:'#2c647b',word:'WATER',metal:false}};
const material=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function mesh(parent,geometry,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function disk(parent,r,h,y,color,roughness=.65,metalness=0){return mesh(parent,new THREE.CylinderGeometry(r,r,h,64),material(color,roughness,metalness),0,y,0);}
function annulus(parent,inner,outer,y,color){const m=mesh(parent,new THREE.RingGeometry(inner,outer,64),material(color,.48,.45),0,y,0);m.rotation.x=-Math.PI/2;return m;}
function printedTop(kind){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
 // Geometry tests use a minimal canvas stub; printing is optional there.
 if(!ctx||!['fillRect','beginPath','arc','fill','stroke','fillText','save','restore'].every(k=>typeof ctx[k]==='function'))return null;
 const f=finishes[kind];ctx.fillStyle='#'+f.color.toString(16).padStart(6,'0');ctx.fillRect(0,0,256,256);
 ctx.strokeStyle=f.ink;ctx.globalAlpha=.72;ctx.lineWidth=3;ctx.beginPath();ctx.arc(128,128,108,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
 ctx.fillStyle=f.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=kind==='coke'?'italic bold 66px Georgia, serif':kind==='pepsi'?'bold 61px Arial, sans-serif':'bold 43px Arial, sans-serif';ctx.fillText(f.word,128,kind==='water'?117:126,205);
 ctx.font='13px Arial, sans-serif';ctx.globalAlpha=.7;ctx.fillText(kind==='water'?'DRINKING WATER':'BOTTLE TOP',128,169,180);
 // Small deterministic scratches make the print feel handled and reused.
 let seed=kind==='coke'?43:kind==='pepsi'?71:113;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<65;i++){ctx.globalAlpha=.07+random()*.14;ctx.fillStyle=i%2?'#e4ddc9':'#493c34';ctx.fillRect(24+random()*208,24+random()*208,1+random()*5,1+random()*2);}
 ctx.globalAlpha=1;const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function crimpedSkirt(radius,height,metal){
 const teeth=metal?21:48,segments=teeth*4,positions=[],indices=[],rings=metal?[[0,1],[.17,1.015],[.72,.94],[1,.89]]:[[0,.99],[.12,1],[.91,1],[1,.97]];
 rings.forEach(([y,r],j)=>{for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,wave=(.5+.5*Math.cos(a*teeth))*(metal?(1-j/(rings.length-1))*.045:.017),rr=radius*(r+wave);positions.push(Math.cos(a)*rr,y*height,Math.sin(a)*rr);}});
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

export function bottleCap(parent,{radius=.42,kind='coke'}={}){
 kind=Object.hasOwn(finishes,kind)?kind:'coke';const f=finishes[kind],g=new THREE.Group(),height=radius*(f.metal?.35:.45);g.name=kind+'-bottle-cap';g.userData.kind=kind;g.userData.radius=radius;g.userData.height=height;parent?.add(g);
 mesh(g,crimpedSkirt(radius,height,f.metal),material(f.color,f.metal?.48:.78,f.metal?.42:.03));
 disk(g,radius*.91,radius*.035,radius*.019,0x494742,.8,.3);
 annulus(g,radius*.89,radius*1.01,radius*.038,f.metal?0x9b9380:0x719ba8);
 const top=disk(g,radius*(f.metal?.895:.97),radius*.025,height-radius*.0125,f.color,.53,f.metal?.25:.02);
 top.name='painted-cap-top';
 const print=printedTop(kind);if(print){const label=mesh(g,new THREE.CircleGeometry(radius*(f.metal?.86:.93),64),new THREE.MeshStandardMaterial({map:print,roughness:.62,metalness:f.metal?.1:0}),0,height+.001,0);label.rotation.x=-Math.PI/2;label.name='cap-print';}
 annulus(g,radius*(f.metal?.86:.93),radius*(f.metal?.9:.97),height+.002,f.metal?0xb2a58b:f.color);
 if(!f.metal){disk(g,radius*1.01,height*.13,height*.09,0x77a4b3,.8);annulus(g,radius*.96,radius*1.018,height*.17,0x537e8b);}
 return g;
}

function paperBeam(parent,start,end,radius=.075){
 const direction=end.clone().sub(start),length=direction.length(),mid=start.clone().add(end).multiplyScalar(.5);
 const tube=mesh(parent,new THREE.CylinderGeometry(radius*.94,radius,length,12),material(0xddd8c9,.96));tube.position.copy(mid);tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
 // A flattened seam and soft tape rings distinguish rolled paper from metal.
 const seam=mesh(tube,new THREE.BoxGeometry(radius*.12,length*.94,radius*.04),material(0xbab5a5,.98),radius*.985,0,0);seam.rotation.y=Math.PI/2;
 for(const y of [-length*.34,length*.34]){const tape=mesh(tube,new THREE.CylinderGeometry(radius*1.01,radius*1.015,Math.min(.075,length*.14),16),material(0xc9c2a7,.83),0,y,0);tape.name='paper-tape';}
 return tube;
}
export function foldedPaperGoal(parent,{width=3,height=.8,depth=.7}={}){
 const g=new THREE.Group();g.name='folded-paper-goal';g.userData.kind='paper';g.userData.width=width;g.userData.height=height;g.userData.depth=depth;parent?.add(g);
 const radius=Math.min(.075,height*.08);
 for(const side of [-1,1]){const x=side*width/2;paperBeam(g,new THREE.Vector3(x,radius,0),new THREE.Vector3(x,height,0),radius);
  paperBeam(g,new THREE.Vector3(x,radius,-depth),new THREE.Vector3(x,height*.92,0),radius*.7);
  const foot=mesh(g,new THREE.BoxGeometry(radius*4,.012,depth+.2),material(0xd8d1bb,.98),x,.006,-depth*.42);foot.rotation.y=side*.04;
  const fold=mesh(g,new THREE.BoxGeometry(.012,.025,depth),material(0xaaa28c,.98),x,.024,-depth*.5);fold.rotation.y=side*.04;
 }
 paperBeam(g,new THREE.Vector3(-width/2,height,0),new THREE.Vector3(width/2,height,0),radius);
 return g;
}
export function smallPaperBall(parent,radius=.17){
 const geometry=new THREE.IcosahedronGeometry(radius,2),p=geometry.attributes.position;
 // Quantized position hashing keeps coincident vertices together at seams.
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=Math.sin(Math.round(x*1000)*12.9898+Math.round(y*1000)*78.233+Math.round(z*1000)*39.425)*43758.5453,f=.94+(n-Math.floor(n))*.12;p.setXYZ(i,x*f,y*f,z*f);}
 geometry.computeVertexNormals();const b=mesh(parent||new THREE.Group(),geometry,material(0xdad4bd,.98));b.name='scrunched-paper-ball';b.userData.kind='paper-ball';b.userData.radius=radius;return b;
}
