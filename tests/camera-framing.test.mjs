import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {footballCamera} from '../dist/football-physics.js';
import {gameActionCamera,cameraPresetFrame,mobileSceneBounds,fitMobileScene} from '../dist/camera-framing.js';

function projection(frame,width,height){
 const camera=new THREE.PerspectiveCamera(width/height<1?65:52,width/height,.08,180);
 camera.position.copy(frame.position);camera.lookAt(frame.look);camera.updateMatrixWorld();
 return p=>p.clone().project(camera);
}
const screens=[[360,740],[390,844],[844,390],[1024,768],[1920,1080],[3440,1440]];
test('football cameras keep player, ball and head clear of screen edges across devices',()=>{
 for(const [width,height]of screens)for(const [p,b]of [
  [new THREE.Vector3(0,0,0),new THREE.Vector3(1,.12,0)],
  [new THREE.Vector3(-8,0,-3),new THREE.Vector3(10,.12,4)],
  [new THREE.Vector3(4,0,-8),new THREE.Vector3(4,.12,8)]
 ]){
  const frame=footballCamera(p,b,width/height),project=projection(frame,width,height);
  for(const point of [p,p.clone().add(new THREE.Vector3(0,2.3,0)),b]){
   const ndc=project(point);assert.ok(Math.abs(ndc.x)<.8&&Math.abs(ndc.y)<.7,`${width}×${height}: ${ndc.toArray()}`);
  }
 }
});
test('default player with nearby ball is large enough to read on phones and desktop',()=>{
 for(const [width,height]of screens){const p=new THREE.Vector3(),b=new THREE.Vector3(1,.12,0),frame=footballCamera(p,b,width/height),project=projection(frame,width,height);
  const pixels=Math.abs(project(new THREE.Vector3(0,2.3,0)).y-project(p).y)*height/2;
  assert.ok(pixels>=height*.075,`${width}×${height}: player ${pixels.toFixed(1)}px`);
 }
});
test('Four Corners, Stay, Laski and Sulia follow the action without replacing overview choices',()=>{
 for(const id of ['fourcorners','stay','laski','sulia','abedemu'])for(const [width,height]of screens){
  const mode={game:{id},you:{position:new THREE.Vector3(-6,0,0)},b:{position:new THREE.Vector3(4,.13,3)},cameraView:0};
  const frame=gameActionCamera(mode,width/height),project=projection(frame,width,height);
  for(const point of [mode.you.position,mode.b.position]){const ndc=project(point);assert.ok(Math.abs(ndc.x)<.8&&Math.abs(ndc.y)<.7);}
  mode.cameraView=1;assert.equal(gameActionCamera(mode,width/height),null);
 }
});

test('World applies action framing and respects a deliberately selected overview',async()=>{
 const {World}=await import('../dist/world.js');
 for(const [width,height]of screens){
  const world=Object.create(World.prototype);
  Object.assign(world,{camera:new THREE.PerspectiveCamera(width/height<1?65:52,width/height,.08,180),desired:new THREE.Vector3(),targetLook:new THREE.Vector3(),look:new THREE.Vector3(),stage:new THREE.Group(),environment:{visible:false},renderer:{render(){}},quality:'low'});
  world.gameMode={game:{id:'fourcorners'},you:{position:new THREE.Vector3(-6,0,0)},b:{position:new THREE.Vector3(2,.13,1)},cameraView:0};
  world.setCamera([0,15,18,0,.4,0]);world.render(1,1);
  const expected=gameActionCamera(world.gameMode,width/height);assert.ok(world.camera.position.distanceTo(expected.position)<.0001);
  world.gameMode.cameraView=1;world.setCamera('wide');world.render(1,2);
  assert.equal(world.targetLook.y,0);assert.ok(world.camera.position.y>=17);
 }
});

test('Four Corners default follows play with readable players instead of framing the compound',()=>{
 for(const [width,height]of screens){
  const mode={game:{id:'fourcorners'},you:{position:new THREE.Vector3(-6,0,0)},b:{position:new THREE.Vector3(-5,.12,0)},cameraView:0};
  const project=projection(gameActionCamera(mode,width/height),width,height);
  const feet=project(mode.you.position),head=project(mode.you.position.clone().add(new THREE.Vector3(0,2.3,0)));
  assert.ok(Math.abs(head.y-feet.y)/2>.1,`${width}×${height}: player too small`);
  assert.ok(Math.abs(project(mode.b.position).x)<.8);
 }
});

test('movement follows the actual screen direction in alternate and rotated views',async()=>{
 const {World}=await import('../dist/world.js');
 for(const kind of ['follow','wide',[12,12,7,0,.4,-2]])for(const position of [[-14,9,14],[14,9,14],[0,15,-12],[0,15,0]]){
  const world=Object.create(World.prototype);world.camera=new THREE.PerspectiveCamera();world.camera.position.set(...position);world.look=new THREE.Vector3();world.camera.lookAt(world.look);world.cameraKind=kind;world.camera.updateMatrixWorld();
  const right=new THREE.Vector3(1,0,0).applyQuaternion(world.camera.quaternion);right.y=0;right.normalize();
  const movement=world.movementVector({x:1,z:0});assert.ok(new THREE.Vector3(movement.x,0,movement.z).dot(right)>.999);
  const up=world.movementVector({x:0,z:-1});assert.ok(Math.abs(up.x*movement.x+up.z*movement.z)<.001);assert.ok(Math.abs(Math.hypot(up.x,up.z)-1)<.001);
 }
});

test('Sulia overview is not overwritten by automatic action framing',()=>{
 const mode={game:{id:'sulia'},you:{position:new THREE.Vector3()},b:{position:new THREE.Vector3()},wide:true};
 assert.equal(gameActionCamera(mode,.48),null);mode.wide=false;assert.ok(gameActionCamera(mode,.48));
});

test('portrait framing does not undo the neighbourhood camera wall clearance',async()=>{
 const {World}=await import('../dist/world.js');
 for(const [width,height]of screens){const world=Object.create(World.prototype);
  Object.assign(world,{camera:new THREE.PerspectiveCamera(65,width/height,.08,180),desired:new THREE.Vector3(1,2.2,1),targetLook:new THREE.Vector3(1,1.5,-6),look:new THREE.Vector3(),stage:new THREE.Group(),environment:{visible:false},renderer:{render(){}},quality:'low',cameraKind:'neighbourhood'});
  world.render(1,1);assert.ok(world.camera.position.distanceTo(world.desired)<.0001);
 }
});

 test('Ab3d3mu tactical view keeps every passing option visible on phone and desktop',()=>{for(const [width,height]of screens){const players=Array.from({length:5},(_,i)=>({position:new THREE.Vector3(Math.sin(i*Math.PI*2/5)*6,0,Math.cos(i*Math.PI*2/5)*6)}));players.push({position:new THREE.Vector3()});const mode={game:{id:'abedemu'},you:players[0],players,b:{position:players[0].position.clone()}};const frame=cameraPresetFrame(mode,'tactical',width/height),project=projection(frame,width,height);for(const player of players)for(const y of [0,2.4]){const p=project(player.position.clone().add(new THREE.Vector3(0,y,0)));assert.ok(Math.abs(p.x)<.94);assert.ok(Math.abs(p.y)<.85);}}});

test('One Pole clears both end views of buildings after phone fitting, zoom and camera transitions',async()=>{
 const {World}=await import('../dist/world.js');
 const solids=[{x:0,z:-19.5,w:6.2,d:4,h:4.1},{x:-11.4,z:0,w:4,d:6.7,h:3.3},{x:11.4,z:0,w:4,d:6.7,h:3.3}];
 for(const [width,height]of screens)for(const turn of [0,1])for(const zoom of [1,1.5]){
  const world=Object.create(World.prototype),camera=new THREE.PerspectiveCamera(width/height<1?65:52,width/height,.08,180);
  Object.assign(world,{camera,desired:new THREE.Vector3(),targetLook:new THREE.Vector3(),look:new THREE.Vector3(),stage:new THREE.Group(),environment:{visible:false},renderer:{render(){}},quality:'low',cameraZoom:zoom,venueSolids:solids,mobileViewport:{width,height,top:55,bottom:95}});
  world.gameMode={game:{id:'onepole'},cameraView:0};world.setCamera([1.6,9,turn?-16.5:16.5,0,.7,0]);camera.position.set(1.6,4,turn?-25:25);
  for(let frame=0;frame<60;frame++){
   world.render(1/30,frame/30);
   for(const x of [-3,3])for(const z of [-10.5,10.5]){
    const target=new THREE.Vector3(x,0,z),direction=camera.position.clone().sub(target).normalize(),ray=new THREE.Ray(target,direction);
    for(const s of solids){const bounds=new THREE.Box3(new THREE.Vector3(s.x-s.w/2,0,s.z-s.d/2),new THREE.Vector3(s.x+s.w/2,s.h+.3,s.z+s.d/2)),hit=ray.intersectBox(bounds,new THREE.Vector3());assert.ok(!hit||target.distanceTo(hit)>target.distanceTo(camera.position),'building obstructed the pole lane');}
   }
  }
 }
});

test('named camera angles frame action and tactical views include every corner goal',async()=>{
 const {cameraPresetFrame}=await import('../dist/camera-framing.js');
 for(const [w,h]of screens){const mode={game:{id:'fourcorners'},you:{position:new THREE.Vector3(-5,0,1),rotation:{y:1}},b:{position:new THREE.Vector3(3,.12,-2)}};
  const positions=[];
  for(const preset of ['follow','behind','side','tactical','overhead']){const frame=cameraPresetFrame(mode,preset,w/h),project=projection(frame,w,h);positions.push(frame.position.toArray().join());for(const p of [mode.you.position,mode.b.position]){const q=project(p);assert.ok(Math.abs(q.x)<.95&&Math.abs(q.y)<.95);}
   if(['tactical','overhead'].includes(preset))for(const [x,z]of [[-9,0],[9,0],[0,-9],[0,9]]){const q=project(new THREE.Vector3(x,.2,z));assert.ok(Math.abs(q.x)<.95&&Math.abs(q.y)<.95);}
  }
  assert.equal(new Set(positions).size,5);assert.equal(cameraPresetFrame(mode,'auto',w/h),null);
 }
});
test('manual side views rise over a building between camera and action',async()=>{
 const {clearCameraObstacles}=await import('../dist/camera-framing.js');const p=clearCameraObstacles(new THREE.Vector3(14,4,0),[{x:0,z:0}],[{x:10,z:0,w:4,d:8,h:5}]);
 assert.ok(p.y>10);assert.equal(p.x,14);
});

test('field games share the Street Football angle and Ab3d3mu no longer fits distant players by default',()=>{
 for(const id of ['fourcorners','laski','sulia','stay','abedemu'])for(const [width,height]of screens){
  const p={position:new THREE.Vector3()},ball={position:new THREE.Vector3(.5,.12,0)},mode={game:{id},you:p,b:ball,players:[p,{position:new THREE.Vector3(9,0,-9)}]};
  const frame=gameActionCamera(mode,width/height),expected=footballCamera(p,ball,width/height);assert.ok(frame.position.distanceTo(expected.position)<1e-8);
  const offset=frame.position.clone().sub(frame.look);assert.ok(Math.atan2(offset.y,Math.hypot(offset.x,offset.z))<Math.PI/4,'default should be angled, not overhead');
  const bounds=mobileSceneBounds(mode);assert.ok(bounds[3]<2&&bounds[2]>-2,'distant players must not force an overview');
  const fitted=fitMobileScene(frame.position,frame.look,bounds,{width,height,top:55,bottom:110},width/height<1?65:52),project=projection(fitted,width,height);
  const feet=project(p.position),head=project(new THREE.Vector3(0,2.3,0));assert.ok(Math.abs(head.y-feet.y)/2>.075,'player must remain readable with touch-control space');
  mode.liveFocus={position:new THREE.Vector3(3,0,1)};assert.ok(gameActionCamera(mode,width/height).look.x>1.5,'friend camera follows its own player');
 }
});
