import {THREE,box,cylinder,sphere} from './world.js';
import {surface} from './surfaces.js';

export const venueFor=id=>['pampanaa','shooting','pilolo'].includes(id)?'neighbourhood':id==='rubberband'?'wall':id==='onepole'?'lane':['fourcorners','penalties','laski','football','sulia'].includes(id)?'pitch':['oware','dame','ludo','counters','chempe','pretend'].includes(id)?'veranda':['alikoto','kpitinge','alasa'].includes(id)?'sand':id==='tyre'?'lane':'schoolyard';
export function clearVenue(world){
 if(world.venue){world.venue.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m)continue;for(const k of ['map','normalMap','roughnessMap'])if(m[k]&&!m[k].userData.sharedAsset)m[k].dispose();m.dispose();}});world.scene?.remove(world.venue);}
 world.venue=null;if(world.environment)world.environment.visible=true;
}
function textured(w,h,d,name,color,x,y,z,parent){const m=box(w,h,d,color,x,y,z,parent);m.material.dispose();m.material=surface(name,color,w/2,d/2);return m;}
function home(g,x,z,w,d,h,tint){
 textured(w,h,d,'plastered_wall_02',tint,x,h/2,z,g);
 const roof=textured(w+.4,.13,d+.4,'corrugated_iron_02',0x8d7762,x,h+.1,z,g);roof.rotation.z=.025;
 textured(.9,1.95,.08,'wood_planks',0x526c63,x+.4,.98,z+d/2+.045,g);
 for(const dx of [-w*.3,w*.3]){box(.75,.85,.09,0x263d3c,x+dx,h*.62,z+d/2+.07,g);for(let k=0;k<4;k++)box(.022,.85,.04,0x8e8d7e,x+dx-.3+k*.2,h*.62,z+d/2+.13,g);}
 box(w,.16,.28,0xa69c83,x,.08,z+d/2+.1,g);
}
export function buildVenue(world,game){
 clearVenue(world);const kind=venueFor(game.id);world.venueKind=kind;
 if(kind==='pitch'){world.venueSolids=[];return {kind,solids:[]};}
 const g=new THREE.Group();world.venue=g;world.scene?.add(g);if(world.environment)world.environment.visible=false;
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),surface(kind==='veranda'?'plastered_wall_02':'red_dirt_mud_01',kind==='veranda'?0xaaa391:0xe9c4a4,100));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;g.add(ground);
 const solids=[];const solid=(x,z,w,d,h=3.4,tint=0xc1a782)=>{home(g,x,z,w,d,h,tint);solids.push({x,z,w,d,h});};
 if(kind==='neighbourhood'){
  // Connected alleys and private courtyards: navigation and sight tests use these same walls.
  for(const q of [[-9,-9,6,5,3.2], [0,-10,5,4,3.8], [9,-9,6,5,3.2],[-10,0,5,6,3.5],[1,0,5,5,3.1],[10,1,4,7,4],[-8,9,7,4,3.1],[3,10,5,4,3.4]])solid(...q,[0xb4a288,0xb47759,0x7a9690][solids.length%3]);
  for(const [x,z,w,d]of [[-4,-4,.22,3],[6,5,3,.22],[-3,6,.22,3]]){textured(w,1.6,d,'plastered_wall_02',0xa2937b,x,.8,z,g);solids.push({x,z,w,d,h:1.6});}
  for(const [x,z]of [[-5,-6],[6,-5],[-5,4],[7,7]]){cylinder(.38,.38,.85,0x64786c,x,.425,z,g);solids.push({x,z,w:.8,d:.8,h:.85});}
  for(const x of [-17,17])solid(x,0,3,36,4,0xb6a281);
  solid(0,-18,32,3,4,0xbcae92);solid(0,18,32,3,3,0xac8970);
  for(const [x,z]of [[-5,7],[7,-4],[-14,-10]]){box(.9,.05,.6,0x9b8a70,x,.03,z,g);for(let i=0;i<5;i++)box(.1,.02,.55,0x403d35,x-.35+i*.17,.065,z,g);}
 }else if(kind==='veranda'){
  for(const x of [-9,9])solid(x,-1,4,23,3.5,0xc1b397);solid(0,-13,16,3,3.6,0xb9a387);
  for(const x of [-5,5]){cylinder(.1,.12,3.1,0x796f59,x,1.55,-2,g);textured(3,.1,20,'corrugated_iron_02',0x8f9186,x,3.2,-2,g);}
  box(16,.2,.25,0x8d8473,0,.1,11,g);
  for(const [x,z]of [[-6,2],[6,-4]]){cylinder(.4,.3,.5,0x81613e,x,.25,z,g);for(let i=0;i<6;i++)sphere(.18,0x586b43,x+Math.sin(i)*.23,.65,z+Math.cos(i)*.23,g);}
 }else if(kind==='wall'){
  textured(13,3.2,.3,'plastered_wall_02',0xbdb39a,0,1.6,-4.3,g);
  textured(2,2.1,.1,'wood_planks',0x5c7168,-4,1.05,-4.1,g);
  for(let i=0;i<8;i++)box(.8,.13,.06,0x9a8d74,-2.8+i*.8,.12,-4.1,g);
  solid(-9,0,3,14,3.4);solid(9,0,3,14,3.4,0x87978a);solid(0,-11,18,4,4);
  for(const x of [-4,4]){box(1.8,.1,.5,0x78634d,x,.48,4,g);for(const dx of [-.6,.6])box(.08,.45,.35,0x685743,x+dx,.225,4,g);}
 }else if(kind==='lane'){
  for(const x of [-7,7])for(let i=0;i<5;i++)solid(x,-14+i*7,4,6.8,3.2+i%2*.8,[0x9caa96,0xc2ab88,0xad7b62][i%3]);
  for(const x of [-4.9,4.9]){box(.3,.09,36,0x847d6e,x,.045,0,g);box(.18,.015,36,0x484b42,x+Math.sign(x)*.2,.01,0,g);}
 }else if(kind==='sand'){
  solid(0,-11,23,4,3,0xcbb28f);solid(-13,0,4,22,3.4,0x9eaa94);solid(13,-1,4,21,3.5,0xb9957c);
  for(const x of [-7,7]){box(3,.14,.65,0x796148,x,.5,0,g);for(const dx of [-1,1])box(.12,.45,.5,0x6c5b42,x+dx,.23,0,g);}
 }else{
  // School compound for call-and-response, counting, skipping and search games.
  solid(0,-15,30,4,3.4,0xd6c397);solid(-17,0,3,25,3,0xc7b787);solid(17,0,3,25,3,0xc7b787);
  box(4,1.4,.08,0x3e5c4c,0,1.6,-12.94,g);
  for(let i=0;i<10;i++){const x=-12+i*2.6;box(1.8,.1,.5,0x78634d,x,.5,-11,g);for(const dx of [-.65,.65])box(.08,.45,.4,0x635842,x+dx,.225,-11,g);}
 }
 world.venueSolids=solids;return {kind,solids};
}
// Segment-vs-expanded-wall test is shared by navigation, collision and pretend shots.
export function segmentBlocked(a,b,solids,padding=0){
 return solids.some(o=>{let lo=0,hi=1;for(const axis of ['x','z']){const half=(axis==='x'?o.w:o.d)/2+padding,min=o[axis]-half,max=o[axis]+half,d=b[axis]-a[axis];if(Math.abs(d)<1e-8){if(a[axis]<min||a[axis]>max)return false;}else{let t1=(min-a[axis])/d,t2=(max-a[axis])/d;if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)return false;}}return hi>0&&lo<1;});
}
export function slideMove(position,velocity,dt,solids,radius=.32){for(const axis of ['x','z']){const next=position.clone();next[axis]+=velocity[axis]*dt;if(!solids.some(o=>Math.abs(next.x-o.x)<o.w/2+radius&&Math.abs(next.z-o.z)<o.d/2+radius))position[axis]=THREE.MathUtils.clamp(next[axis],-15.5,15.5);}}
export function routeTo(start,end,solids){
 if(!segmentBlocked(start,end,solids,.5))return[end.clone()];
 const key=(x,z)=>x+','+z;
 const nearest=p=>{const choices=[];for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const x=Math.round(p.x/2)+dx,z=Math.round(p.z/2)+dz,q={x:x*2,z:z*2};if(Math.abs(x)<=7&&Math.abs(z)<=7&&!segmentBlocked(p,q,solids,.42))choices.push({x,z,d:Math.hypot(q.x-p.x,q.z-p.z)});}choices.sort((a,b)=>a.d-b.d);return choices[0];};
 const source=nearest(start),target=nearest(end);if(!source||!target)return[];
 const {x:sx,z:sz}=source,{x:tx,z:tz}=target,queue=[[sx,sz]],previous=new Map([[key(sx,sz),null]]);let final=null;
 for(let head=0;head<queue.length&&head<300;head++){const [x,z]=queue[head];if(x===tx&&z===tz){final=key(x,z);break;}for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz,k=key(xx,zz);if(Math.abs(xx)>7||Math.abs(zz)>7||previous.has(k)||segmentBlocked({x:x*2,z:z*2},{x:xx*2,z:zz*2},solids,.42))continue;previous.set(k,key(x,z));queue.push([xx,zz]);}}
 if(!final)return[];const points=[end.clone()];while(final){const [x,z]=final.split(',').map(Number);points.unshift(new THREE.Vector3(x*2,0,z*2));final=previous.get(final);}return points;
}
