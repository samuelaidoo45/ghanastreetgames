import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {footballCamera} from '../dist/football-physics.js';
import {gameActionCamera} from '../dist/camera-framing.js';

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
 for(const id of ['fourcorners','stay','laski','sulia'])for(const [width,height]of screens){
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

test('Four Corners landscape default keeps all four side goals visible',()=>{
 for(const [width,height]of screens.filter(([w,h])=>w/h>=1.2)){
  const mode={game:{id:'fourcorners'},you:{position:new THREE.Vector3(-6,0,0)},b:{position:new THREE.Vector3()},cameraView:0};
  const project=projection(gameActionCamera(mode,width/height),width,height);
  for(const [x,z]of [[-9,0],[9,0],[0,-9],[0,9]]){const p=project(new THREE.Vector3(x,.3,z));assert.ok(Math.abs(p.x)<.9&&Math.abs(p.y)<.9);}
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
