import {THREE,box,cylinder,ball} from './world.js';
export {ball};
export const clamp=THREE.MathUtils.clamp;
export function stepBall(mesh,v,dt,{drag=.65,bounce=.52}={}){const before=mesh.position.clone();v.y-=9.81*dt;mesh.position.addScaledVector(v,dt);if(mesh.position.y<.12){mesh.position.y=.12;v.y=Math.abs(v.y)*bounce;if(v.y<.45)v.y=0;v.x*=Math.exp(-drag*dt);v.z*=Math.exp(-drag*dt);}mesh.rotation.x+=v.z*dt/.12;mesh.rotation.z-=v.x*dt/.12;return before;}
export function sweptDistance(a,b,p){const d=b.clone().sub(a),t=clamp(p.clone().sub(a).dot(d)/(d.lengthSq()||1),0,1);return a.clone().addScaledVector(d,t).distanceTo(p);}
export function chalk(parent,x,z,w,d){const m=box(w,.007,d,0xd3c6aa,x,.016,z,parent);m.castShadow=false;return m;}
export function streetGoal(parent,x,z,angle=0,width=2,height=1){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;parent.add(g);for(const side of [-1,1]){const post=cylinder(.045,.055,height,0x8a7352,0,height/2,side*width/2,g,10);post.rotation.z=side*.02;box(.8,.04,.06,0x75684f,.4,.025,side*width/2,g);}const bar=box(.07,.07,width,0xb4a085,0,height,0,g);return g;}
export function ringTarget(parent,color=0xf4dc93){const mesh=new THREE.Mesh(new THREE.RingGeometry(.13,.16,40),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.85,depthTest:false}));parent.add(mesh);mesh.renderOrder=20;return mesh;}
