import * as THREE from './vendor/three.module.js';
import {surface} from './surfaces.js';
import {footballGoal} from './football-assets.js';
export const goalStyles=['net','blocks','sticks','footwear'];
export function goalSpec(style='net',height=2.5){style=goalStyles.includes(style)?style:'net';return {style,height:style==='net'?height:style==='sticks'?Math.min(height,1.35):.65,postHeight:style==='net'?height:style==='sticks'?Math.min(height,1.35):style==='blocks'?.24:.12,postRadius:style==='blocks'?.14:style==='footwear'?.12:.045,crossbar:style==='net'};}
const material=(color)=>new THREE.MeshStandardMaterial({color,roughness:.92});
function mesh(g,geometry,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
function block(g,w,h,d,x,y,z,color=0x9c9789){return mesh(g,new THREE.BoxGeometry(w,h,d),surface('plastered_wall_02',color,1,1),x,y,z);}
export function goalMarker(parent,style='sticks',height=1.35){const g=new THREE.Group();g.userData.kind=style;parent.add(g);if(style==='blocks'){
 // Hollow concrete block: two visible cavities, a central web, chipped-tone edges.
 for(const z of [-.105,.105])block(g,.43,.24,.045,0,.12,z);for(const x of [-.195,0,.195])block(g,.045,.24,.21,x,.12,0);block(g,.36,.015,.16,0,.014,0,0x454840);
 }else if(style==='footwear'){
 const sole=mesh(g,new THREE.SphereGeometry(1,20,12),material(0x4c4a40),0,.035,0);sole.scale.set(.115,.035,.23);const shoe=mesh(g,new THREE.SphereGeometry(1,20,12),material(0x51666b),0,.085,-.015);shoe.scale.set(.105,.065,.205);const opening=mesh(g,new THREE.SphereGeometry(1,16,8),material(0x202c2c),0,.133,-.1);opening.scale.set(.065,.012,.07);for(let i=0;i<4;i++){const lace=mesh(g,new THREE.BoxGeometry(.13,.009,.012),material(0xdbd2bc),0,.144,.005+i*.026);lace.rotation.y=(i%2?1:-1)*.2;}
 }else{const pole=mesh(g,new THREE.CylinderGeometry(.037,.052,height,12),surface('wood_planks',0xa18a66,.4,height),0,height/2,0);pole.rotation.z=.012;for(let i=0;i<3;i++){const stone=mesh(g,new THREE.DodecahedronGeometry(.07,0),material(0x8d8270),Math.sin(i*2.1)*.085,.035,Math.cos(i*2.1)*.085);stone.scale.y=.5;}}
 return g;}
// Local outward direction +X; the visible opening faces back into the field.
export function makeStreetGoal(parent,x,z,angle=0,width=2,height=1,style='net'){
 const spec=goalSpec(style,height),g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;g.userData.goalStyle=spec.style;parent.add(g);
 if(spec.style==='net'){const asset=footballGoal(width,height,Math.max(.6,width*.22));if(asset){asset.rotation.y=-Math.PI/2;g.add(asset);g.userData.net=asset.userData.net;}else{for(const side of [-1,1]){const p=goalMarker(g,'sticks',height);p.position.z=side*width/2;}mesh(g,new THREE.BoxGeometry(.08,.08,width),material(0xe1d9c3),0,height,0);}}
 else{for(const side of [-1,1]){const p=goalMarker(g,spec.style,spec.postHeight);p.position.z=side*width/2;p.rotation.y=side*.12;}}
 return g;
}
