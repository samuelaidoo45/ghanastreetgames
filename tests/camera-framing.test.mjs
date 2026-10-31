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
