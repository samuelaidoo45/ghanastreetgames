import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {mobileProfile,touchHints,arrangeActions,joystickVector,renderPixelRatio,RenderBudget,mobileMessage} from '../dist/mobile-play.js';
import {catalogue} from '../dist/catalogue.js';
import {World,THREE} from '../dist/world.js';
import {createMode} from '../dist/modes.js';
import {clearVenue} from '../dist/venues.js';
import {mobileSceneBounds} from '../dist/camera-framing.js';
import {Mode} from '../dist/mode-base.js';

const context={clearRect(){},strokeText(){},fillText(){}};
globalThis.document={createElement:()=>({width:512,height:128,getContext:()=>context})};
function harness(id){
 const world=Object.create(World.prototype);
 Object.assign(world,{stage:new THREE.Group(),environment:new THREE.Group(),scene:new THREE.Scene(),canvas:{style:{}},camera:new THREE.PerspectiveCamera(65,390/844,.08,180),look:new THREE.Vector3(),desired:new THREE.Vector3(),targetLook:new THREE.Vector3(),spectators:[],renderer:{render(){}},quality:'low'});
 const ui={actions(){},status(){},note(){},sound(){},end(){}};
 const mode=createMode({world,ui,input:{target:null,sprint:false,vector:()=>({x:0,z:0})},settings:{color:0xc05336},game:catalogue.find(g=>g.id===id)});
 return {world,mode,close(){world.clear();clearVenue(world);}};
}
test('all games have phone instructions and the correct movement category',()=>{
 assert.equal(Object.keys(touchHints).length,catalogue.length);
 for(const game of catalogue){assert.ok(touchHints[game.id]?.length>40);assert.ok(['move','aim','none'].includes(mobileProfile(game.id).stick));}
 for(const id of ['penalties','chaskele','rubberband','onepole','alasa','kpitinge']){assert.equal(mobileProfile(id).stick,'aim');assert.equal(mobileProfile(id).autoSprint,false);}
 for(const id of ['counters','tumatu','oware','antoakyire'])assert.equal(mobileProfile(id).stick,'none');
});
test('mobile layouts preserve every game action, including sprint even when joystick auto-sprint is enabled',()=>{
 for(const game of catalogue){const h=harness(game.id),all=h.mode.actions;
  for(const automatic of [true,false]){const {primary,secondary}=arrangeActions(game.id,all,automatic,'full'),ids=[...primary,...secondary].map(a=>a.id);
   for(const a of all)assert.ok(primary.some(button=>button.id===a.id),game.id+': '+a.id);
   assert.equal(new Set(ids).size,ids.length);assert.equal(secondary.length,0);
  }
  if(game.id==='football'){const layout=arrangeActions(game.id,all);assert.deepEqual(layout.primary.map(a=>a.id),['shoot','pass','switch','save']);assert.deepEqual(layout.secondary,[]);}
  if(game.id==='antoakyire')assert.ok(arrangeActions(game.id,all).primary.some(a=>a.hold&&a.id==='sprint'));
  h.close();
 }
});
test('joystick has a drift deadzone, bounded diagonals and an outer sprint ring',()=>{
 assert.deepEqual(joystickVector(2,1,40),{x:0,z:0,sprint:false});
 const walk=joystickVector(20,0,40);assert.ok(walk.x>.4&&walk.x<.5);assert.equal(walk.sprint,false);
 const run=joystickVector(80,-80,40);assert.ok(Math.abs(Math.hypot(run.x,run.z)-1)<1e-12);assert.equal(run.sprint,true);assert.ok(run.z<0);
 assert.equal(joystickVector(0,0,0).x,0);
});
test('phone pixel budget respects density and adjusts only after sustained expensive frames',()=>{
 assert.equal(renderPixelRatio(390,844,3,'low'),1);
 assert.ok(1920*1080*renderPixelRatio(1920,1080,3,'low')**2<=900001);
 assert.ok(renderPixelRatio(390,844,3,'high')<=1.5);
 const budget=new RenderBudget();let scale=1;for(let i=0;i<89;i++)scale=budget.sample(40,67,scale);assert.equal(scale,1);scale=budget.sample(40,67,scale);assert.equal(scale,.9);
 for(let i=0;i<600;i++)scale=budget.sample(40,67,scale);assert.equal(scale,.7);
 budget.reset();for(let i=0;i<180;i++)scale=budget.sample(4,33,1);assert.equal(scale,1);
});
test('the static menu import graph does not load Three.js, scenes or 3D asset loaders',()=>{
 const seen=new Set();function visit(file){if(seen.has(file))return;seen.add(file);const source=readFileSync(file,'utf8');for(const m of source.matchAll(/^import\s+.*?from\s+['"]([^'"]+)['"]/gm))visit(resolve(dirname(file),m[1]));}
 visit(resolve('dist/arcade.js'));assert.ok(![...seen].some(f=>/vendor|world\.js|modes\.js|athletes\.js/.test(f)),[...seen].join('\n'));
});
test('physics substeps advance time without repeating expensive skeleton animation',()=>{
 const m=Object.create(Mode.prototype);let updates=0,animations=0;
 Object.assign(m,{world:{deferAnimation:true},age:0,time:0,update(){updates++;},animate(){animations++;}});
 m.tick(1/60,1/60);m.tick(1/60,2/60);assert.equal(updates,2);assert.equal(animations,0);assert.equal(m.age,1/30);
 m.animate(1/30);assert.equal(animations,1);m.world.deferAnimation=false;m.tick(1/60,3/60);assert.equal(animations,2);
});
test('equipment and action stay between the phone HUD and controls in both orientations',()=>{
 const screens=[[320,568],[390,844],[667,375],[844,390],[768,1024]];
 for(const game of catalogue){const h=harness(game.id),bounds=mobileSceneBounds(h.mode);if(!bounds){h.close();continue;}
  for(const [width,height]of screens){const top=width>height?80:130,bottom=width>height?145:182;
   h.world.mobileViewport={width,height,top,bottom};h.world.camera.aspect=width/height;h.world.camera.fov=width<height?65:52;h.world.updateViewOffset();h.world.render(1,0);h.world.camera.updateMatrixWorld();
   const [x0,y0,z0,x1,y1,z1]=mobileSceneBounds(h.mode);
   for(const x of [x0,x1])for(const y of [y0,y1])for(const z of [z0,z1]){const p=new THREE.Vector3(x,y,z).project(h.world.camera),screenY=(1-p.y)*height/2;
    assert.ok(Math.abs(p.x)<=.94&&screenY>top&&screenY<height-bottom,`${game.id} ${width}x${height}: ${p.x}, y=${screenY}, safe=${top}..${height-bottom}`);
   }
  }h.close();
 }
});
test('mobile zoom remains adjustable after automatic camera fitting',()=>{
 const h=harness('counters');h.world.mobileViewport={width:390,height:844,top:100,bottom:100};h.world.updateViewOffset();h.world.render(1);const normal=h.world.camera.position.distanceTo(h.world.look);
 h.world.cameraZoom=.8;h.world.render(1);assert.ok(Math.abs(h.world.camera.position.distanceTo(h.world.look)-normal*.8)<.00001);h.close();
});
test('touch can select a small piece near the fingertip without changing mouse precision',()=>{
 const world=Object.create(World.prototype),camera=new THREE.PerspectiveCamera(60,1,.01,50);camera.position.set(0,3,0);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 Object.assign(world,{stage:new THREE.Group(),camera,canvas:{getBoundingClientRect:()=>({left:0,top:0,width:400,height:400})},ray:new THREE.Raycaster(),plane:new THREE.Plane(new THREE.Vector3(0,1,0),0)});
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.025),new THREE.MeshBasicMaterial());cap.userData.pick={p:0,i:1};world.stage.add(cap);world.stage.updateMatrixWorld();
 assert.equal(world.pick(219,200).id,undefined);assert.deepEqual(world.pick(219,200,24).id,{p:0,i:1});assert.equal(world.pick(228,200,24).id,undefined);
 cap.visible=false;assert.equal(world.pick(200,200,24).id,undefined);
 cap.geometry.dispose();cap.material.dispose();
});

test('phone prompts use action labels without rewriting numbers or game rules',()=>{
 const actions=[{key:'Space',label:'Shoot'},{key:'E',label:'Pass'}];
 const text=mobileMessage('E passes. Hold Space. Shift sprints. C changes camera. First to 3.',actions,'football');
 assert.equal(text,'“Pass” passes. Hold “Shoot”. “MOVE edge” sprints. “View” changes camera. First to 3.');
});

test('close football action stays readable above mobile controls in portrait and landscape',()=>{
 for(const id of ['football','fourcorners','laski','sulia']){
  const h=harness(id),p=h.mode.teams?.[0]?.[h.mode.selected]||h.mode.you;
  p.position.set(0,0,0);h.mode.b.position.set(.8,.12,0);
  if(id==='football')h.world.follow(p,true);
  for(const [width,height]of [[360,740],[390,844],[667,375],[844,390],[1200,540],[1024,768]]){
   const top=width>height?100:130,bottom=width>height?68:182;
   h.world.mobileViewport={width,height,top,bottom};h.world.camera.aspect=width/height;h.world.camera.fov=width<height?65:52;h.world.updateViewOffset();h.world.render(1,0);h.world.camera.updateMatrixWorld();
   const feet=p.position.clone().project(h.world.camera),head=p.position.clone().add(new THREE.Vector3(0,2.3,0)).project(h.world.camera),ball=h.mode.b.position.clone().project(h.world.camera);
   assert.ok(Math.abs(head.y-feet.y)/2>=.1,`${id} ${width}×${height}: player smaller than 10% of view`);
   for(const q of [feet,head,ball]){const y=(1-q.y)*height/2;assert.ok(Math.abs(q.x)<.9&&y>top&&y<height-bottom,`${id}: action obscured`);}
  }h.close();
 }
});
