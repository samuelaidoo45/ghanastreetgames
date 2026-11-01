import {Mode} from './mode-base.js';
import {THREE,box,cylinder,ring} from './world.js';
import {weatherMesh,surface} from './surfaces.js';
const clamp=THREE.MathUtils.clamp,TAU=Math.PI*2;
export const jumpStyles=['Tuck','Pike','Layout'];
export function landingGrade(angle,opened,braceTime,flightTime,z,tolerance=1){
 const upright=Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)));
 const inSand=z<-.65&&z>-7;
 const feet=inSand&&upright<.48*tolerance&&opened;
 const timing=braceTime===null?0:clamp(1-Math.abs(flightTime-braceTime-.14)/(.24*tolerance),0,1);
 return {feet,upright,timing,landing:feet?Math.round(24+16*timing):0};
}
export class JumpGames extends Mode{
 constructor(ctx){
  super(ctx);this.agawowa=this.game.id==='agawowa';this.withBar=!this.agawowa||this.settings.jumpBar===true;
  this.count=clamp(Math.round(Number(this.settings.jumpPlayers)||3),1,4);this.local=this.settings.jumpOpponents==='local';this.turn=0;this.round=0;this.scores=Array(this.count).fill(0);this.results=Array.from({length:this.count},()=>[]);this.style=0;this.cameraView=0;
  this.frameView();
  const sand=new THREE.Mesh(new THREE.PlaneGeometry(5.4,7),surface('red_dirt_mud_01',0xf5d99a,3,4));sand.rotation.x=-Math.PI/2;sand.material.map?.dispose();const grain=new Uint8Array(128*128*4);for(let i=0;i<128*128;i++){const n=205+Math.floor((Math.sin(i*127.1+17.3)*43758.5453%1+1)%1*50);grain.set([n,n,n,255],i*4);}const texture=new THREE.DataTexture(grain,128,128);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,5);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;sand.material.map=texture;sand.material.color.set(0xc3ab86);sand.position.set(0,.045,-3.5);sand.receiveShadow=true;sand.name='sand-landing';this.root.add(sand);
  for(const x of [-2.85,2.85])weatherMesh(box(.12,.12,7.4,0x9b7953,x,.06,-3.5,this.root),'wood_planks',0x9b7953,1,5);
  this.posts=new THREE.Group();this.root.add(this.posts);
  for(const x of [-2.3,2.3]){weatherMesh(cylinder(.10,.14,2.7,0x927349,x,1.35,0,this.posts,10),'wood_planks',0x927349,1,3);for(let i=0;i<9;i++)cylinder(.108,.108,.025,0x574b33,x,.2+i*.28,0,this.posts,10);for(let i=0;i<6;i++)box(.16,.045,.22,0xe8d9b6,x,.6+i*.2,.02,this.posts);}
  this.bar=weatherMesh(cylinder(.035,.045,4.8,0xb1a063,0,.8,0,this.posts,10),'wood_planks',0xc5b577,1,5);this.bar.rotation.z=Math.PI/2;this.posts.visible=this.withBar;
  this.ramp=new THREE.Group();this.ramp.name='inclined-blocks';this.root.add(this.ramp);this.ramp.visible=this.agawowa;
  for(const x of [-.45,.45])weatherMesh(box(.42,.35,.55,0x928a75,x,.175,1.3,this.ramp),'plastered_wall_02',0xa49a80);
  const incline=weatherMesh(box(1.3,.18,1.55,0xb8ad92,0,.34,1.9,this.ramp),'plastered_wall_02',0xb8ad92);incline.rotation.x=.27;
  this.takeoff=ring(.75,0xf4be44,0,this.agawowa?1.65:1.5,this.root,.03);
  for(let z=3;z<7;z+=.65)box(.035,.012,.25,0xeadab3,0,.022,z,this.root);
  this.players=Array.from({length:this.count},(_,i)=>this.player(-4-i*.8,3,[this.settings.color||0xc05336,0x447e9b,0x397e62,0xd3ab45][i]));
  this.marker=this.circle(0,6,.42);this.mark=ring(.32,0xf6db8f,0,-3,this.root,.025);this.mark.visible=false;
  this.prepare();
 }
 name(i=this.turn){return this.networked?(this.roomPlayers?.[this.turnOwner||0]?.name||'JUMPER'):i===0?'YOU':this.local?'PLAYER '+(i+1):['','AKUA','KOJO','AMA'][i];}
 isCPU(){return !this.networked&&!this.local&&this.turn>0;}
 prepare(){
  this.phase='ready';this.time=0;this.flightTime=0;this.angle=0;this.omega=0;this.opened=!this.agawowa;this.braceTime=null;this.barHit=false;this.crossed=false;this.peak=0;this.takeoffQuality=0;this.mark.visible=false;
  this.barHeight=.7+this.round*.2+this.difficultyTuning.bar;this.bar.position.set(0,this.barHeight,0);this.bar.rotation.set(0,0,Math.PI/2);
  this.players.forEach((p,i)=>{p.position.set(-4-i*.8,0,3);p.rotation.set(0,Math.PI,0);Object.assign(p.userData,{run:0,pose:'idle',jump:0,lean:0});});
  this.you=this.players[this.turn];this.you.position.set(0,0,6.5);this.speed=0;
  // A CPU commits to its own timing before the run, instead of reading the
  // player's result or executing the same perfect sequence every attempt.
  const error=this.difficultyTuning.error;
  this.cpuJumpAt=(this.agawowa?1.65:1.5)+(Math.random()-.5)*.42*error;
  this.cpuOpenAt=5.72+(Math.random()-.5)*.24*error;
  this.cpuBraceHeight=.42+(Math.random()-.5)*.36*error;
  this.note(`${this.name()} · attempt ${this.round+1}/3. ${this.agawowa?jumpStyles[this.style]+': run onto the block, tuck, open and land on your feet.':'Run to the gold mark, jump over the palm bar, then land in the sand.'}`);this.controls();
 }
 controls(){
  const cpu=this.isCPU();let actions;
  if(this.phase==='ready')actions=[{id:'run',label:'Run up',key:'Space'},...(this.agawowa?[{id:'style',label:'Style: '+jumpStyles[this.style],key:'E'}]:[])];
  else if(this.phase==='run')actions=[{id:'jump',label:'Jump',key:'Space'}];
  else if(this.phase==='air')actions=[...(this.agawowa?[{id:'tuck',label:'Tuck',key:'Space'},{id:'open',label:'Open',key:'E'}]:[]),{id:'land',label:'Land',key:'Q'}];
  else actions=[{id:'next',label:'Next turn',key:'Space'}];
  this.setActions(actions.map(a=>({...a,disabled:cpu})));
 }
 frameView(){const portrait=(this.world.camera?.aspect||1.6)<1;this.world.setCamera(this.cameraView?[0,15,5,0,.7,0]:portrait?[0,12,10,0,1,.5]:[11,8,0,0,1,0]);}
 cycleCamera(){this.cameraView=(this.cameraView+1)%2;this.frameView();}
 action(id){if(this.done||this.isCPU())return;this.perform(id);}
 perform(id){
  if(id==='style'&&this.phase==='ready'){this.style=(this.style+1)%3;this.controls();return;}
  if(id==='run'&&this.phase==='ready'){this.phase='run';this.time=0;this.controls();return;}
  if(id==='jump'&&this.phase==='run'){this.launch();return;}
  if(this.phase==='air'){
   if(id==='tuck'&&this.agawowa){this.opened=false;this.you.userData.pose=['airTuck','airPike','airLayout'][this.style];}
   if(id==='open'){this.opened=true;this.you.userData.pose='airOpen';}
   if(id==='land')this.braceTime=this.flightTime;
  }
  if(id==='next'&&this.phase==='result')this.next();
 }
 launch(){
  const z=this.you.position.z,ideal=this.agawowa?1.65:1.5;this.takeoffQuality=clamp(1-Math.abs(z-ideal)/(1.05*this.difficultyTuning.window),0,1);
  if(this.takeoffQuality<.08){this.resolve(false,'Missed the take-off mark',0);return;}
  this.phase='air';this.flightTime=0;this.vy=5.4+this.takeoffQuality*.7;this.vz=-(3.8+this.takeoffQuality*.7);this.you.position.y=this.agawowa?.32:0;this.opened=!this.agawowa;
  this.mark.visible=true;this.mark.position.set(0,.055,-3.5);this.you.userData.run=0;this.you.userData.pose=this.agawowa?['airTuck','airPike','airLayout'][this.style]:'airHigh';this.ui.sound('jump');this.controls();
 }
 resolve(ok,reason,points){
  if(this.phase==='result'||this.done)return;this.phase='result';this.time=0;this.scores[this.turn]+=points;this.results[this.turn].push({points,ok,reason,height:this.barHeight});this.score=this.scores[0];this.you.userData.run=0;this.you.userData.lean=0;this.you.userData.pose=ok?'cheer':'knees';this.you.position.y=0;this.mark.position.set(this.you.position.x,.03,this.you.position.z);this.mark.visible=true;this.mark.material.color.set(ok?0x6aab65:0xb66443);
  this.note(`${this.name()}: ${reason} · ${points} points. ${this.scores.map((s,i)=>this.name(i)+' '+s).join(' · ')}`);this.ui.sound(ok?'point':'miss');this.controls();
 }
 next(){
  this.turn++;if(this.turn>=this.count){this.turn=0;this.round++;}
  if(this.round>=3){const best=Math.max(...this.scores),winners=this.scores.flatMap((s,i)=>s===best?[i]:[]);this.score=this.scores[0];this.finish(best===0?'TRY THE NEXT JUMP':winners.map(i=>this.name(i)).join(' & ')+' WIN',this.scores.map((s,i)=>this.name(i)+': '+s+' points').join(' · '),best>0&&winners.includes(0),best>0&&winners.includes(0)&&winners.length>1?'draw':undefined);return;}
  this.prepare();
 }
 update(dt){
  const p=this.you;this.marker.position.set(p.position.x,.03,p.position.z);
  this.status(this.agawowa?'AGAWOWA · '+jumpStyles[this.style].toUpperCase():'HIGH JUMP · '+this.barHeight.toFixed(1)+' M',`${this.name()} · ${this.round+1}/3 · ${this.scores[this.turn]} PTS`);
  if(this.phase==='ready'){if(this.isCPU()&&this.time>.85)this.perform('run');return;}
  if(this.phase==='result'){if(this.barHit){this.bar.position.y=Math.max(.06,this.bar.position.y-dt*1.8);this.bar.rotation.x+=dt*.7;}if(this.time>(this.isCPU()?2:12))this.next();return;}
  if(this.phase==='run'){
   this.speed=Math.min(5,this.speed+dt*5);p.position.z-=this.speed*dt;p.userData.run=this.speed/5;
   const good=Math.abs(p.position.z-(this.agawowa?1.65:1.5))<.45;this.takeoff.material.color.set(good?0x74b66d:0xf4be44);this.ui.power?.(good?1:clamp(this.speed/6,0,1));
   if(this.isCPU()&&p.position.z<this.cpuJumpAt)this.launch();
   else if(p.position.z<.5)this.resolve(false,'Ran past the take-off mark',0);
   return;
  }
  if(this.phase!=='air')return;
  const previous=p.position.clone();this.flightTime+=dt;this.vy-=9.8*dt;p.position.y+=this.vy*dt;p.position.z+=this.vz*dt;this.peak=Math.max(this.peak,p.position.y);
  if(this.agawowa){
   const target=this.opened?0:[8.8,8.4,7.9][this.style];this.omega+= (target-this.omega)*Math.min(1,dt*(this.opened?18:16));this.angle+=this.omega*dt;p.userData.lean=this.angle;
   if(this.isCPU()&&!this.opened&&this.angle>this.cpuOpenAt)this.perform('open');
  }
  if(this.isCPU()&&this.braceTime===null&&this.vy<0&&p.position.y<this.cpuBraceHeight)this.perform('land');
  const upright=Math.abs(Math.atan2(Math.sin(this.angle),Math.cos(this.angle)));this.mark.material.color.set(this.opened&&upright<.48?0x68b767:0xf4bd45);
  if(this.agawowa&&!this.opened&&this.angle>5.35&&this.angle<6.1)this.note('OPEN now to slow your rotation.');
  if(this.opened&&this.vy<0&&p.position.y<.75)this.note('LAND now — feet into the sand.');
  const remaining=this.vy<0?p.position.y/Math.max(.1,-this.vy):1;this.ui.power?.(clamp(1-remaining/.5,0,1));
  if(this.withBar&&!this.crossed&&previous.z>0&&p.position.z<=0){
   const t=previous.z/(previous.z-p.position.z),feet=previous.y+(p.position.y-previous.y)*t;
   // Conservative body envelope about the hips; an inverted body can still hit the bar.
   const low=this.agawowa?feet+1-Math.abs(Math.cos(this.angle))*.95-Math.abs(Math.sin(this.angle))*.32:feet+.12;
   this.crossed=true;this.barHit=low<this.barHeight+.04;if(this.barHit)this.ui.sound('stone');
  }
  if(p.position.y<=0&&this.flightTime>.2){
   const grade=landingGrade(this.agawowa?this.angle:0,this.opened,this.braceTime,this.flightTime,p.position.z,this.difficultyTuning.window),flips=Math.floor((this.angle+.2)/TAU),clear=!this.withBar||this.crossed&&!this.barHit;
   const ok=grade.feet&&clear&&(!this.agawowa||flips>=1);
   const air=Math.round(clamp(this.peak/2,0,1)*20),style=this.agawowa?Math.min(30,flips*15+this.style*4):Math.round(this.barHeight*30),flow=Math.round(this.takeoffQuality*10);
   const points=ok?Math.min(100,air+style+flow+grade.landing):0;
   const reason=this.barHit?'Bar knocked down':!grade.feet?'Landing not on feet':this.agawowa&&flips<1?'Complete the somersault':!clear?'Did not clear the bar':`${grade.timing>.7?'Clean landing':'Feet down'} · air ${air}, style ${style}, flow ${flow}, landing ${grade.landing}`;
   this.resolve(ok,reason,points);
  }
 }
}
