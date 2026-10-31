import {makeStreetGoal} from './goal-markers.js';
import {footballGoal,footballBall} from './football-assets.js';
import {THREE,box,cylinder,ball} from './world.js';
export const matchBall=(parent,r=.12)=>footballBall(parent,r)||ball(parent,r);
export {ball};
export const clamp=THREE.MathUtils.clamp;
export function stepBall(mesh,v,dt,{drag=.65,bounce=.52}={}){const before=mesh.position.clone();v.y-=9.81*dt;mesh.position.addScaledVector(v,dt);if(mesh.position.y<.12){mesh.position.y=.12;v.y=Math.abs(v.y)*bounce;if(v.y<.45)v.y=0;v.x*=Math.exp(-drag*dt);v.z*=Math.exp(-drag*dt);}mesh.rotation.x+=v.z*dt/.12;mesh.rotation.z-=v.x*dt/.12;return before;}
export function sweptDistance(a,b,p){const d=b.clone().sub(a),t=clamp(p.clone().sub(a).dot(d)/(d.lengthSq()||1),0,1);return a.clone().addScaledVector(d,t).distanceTo(p);}
export function chalk(parent,x,z,w,d){const m=box(w,.007,d,0xd3c6aa,x,.016,z,parent);m.castShadow=false;return m;}
export const streetGoal=makeStreetGoal;
export function ringTarget(parent,color=0xf4dc93){const mesh=new THREE.Mesh(new THREE.RingGeometry(.13,.16,40),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.85,depthTest:false}));parent.add(mesh);mesh.renderOrder=20;return mesh;}
