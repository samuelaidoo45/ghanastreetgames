import {JumpGames,landingGrade} from './jump-games.js';
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const backflipStyles=['Tuck','Pike','Layout','Split'];
const poses=['backTuck','backPike','backLayout','backSplit'];
export function backflipPoints(clean,newStyle,timing){return clean?(newStyle?100:0)+Math.round(8+12*clamp(timing,0,1)):0;}
// Standing backflips: load, arm drive, upward set, backward rotation, then
// absorb the landing. The reference informs motion, not the competition rules.
export class Agawowa extends JumpGames{
 prepare(){
  super.prepare();this.styleSets??=Array.from({length:this.count},()=>new Set());
  this.withBar=false;this.posts.visible=false;this.ramp.visible=false;this.opened=false;this.charge=null;this.landingOK=false;
  this.you.position.set(0,0,-3.8);this.takeoff.position.z=-3.8;this.mark.position.z=-3.3;
  this.cpuOpenAt=5.76+(Math.random()-.5)*.28*this.difficultyTuning.error;
  if(this.isCPU()){const unused=backflipStyles.map((_,i)=>i).filter(i=>!this.styleSets[this.turn].has(i));this.style=unused.length&&Math.random()<.85?unused[Math.floor(Math.random()*unused.length)]:Math.floor(Math.random()*4);}
  this.note(`${this.name()} · turn ${this.round+1}/4. ${backflipStyles[this.style]} backflip. Land different styles to win; repeats earn execution points only.`);this.controls();
 }
 frameView(){this.world.setCamera(this.cameraView?[0,12,0,0,1,-3.4]:[6,3.2,-2.5,0,1.15,-3.4]);}
 controls(){
  const cpu=this.isCPU();let actions=this.phase==='ready'?[{id:'flip',label:'Backflip',key:'Space',charge:true},{id:'style',label:'Style: '+backflipStyles[this.style],key:'E'}]:this.phase==='load'?[{id:'flip',label:'Take-off',key:'Space',disabled:true}]:this.phase==='air'?[{id:'tuck',label:backflipStyles[this.style],key:'Space'},{id:'open',label:'Open',key:'E'},{id:'land',label:'Land',key:'Q'}]:[{id:'next',label:'Next turn',key:'Space'}];
  this.setActions(actions.map(a=>({...a,disabled:cpu||a.disabled})));
 }
 hold(id){if(this.phase==='ready'&&id==='flip'&&!this.isCPU())this.charge=this.age;}
 perform(id){
  if(this.done)return;
  if(id==='style'&&this.phase==='ready'){this.style=(this.style+1)%4;this.controls();this.note(backflipStyles[this.style]+(this.styleSets[this.turn].has(this.style)?' · already landed. Try a new style for the variety bonus.':' · new style available.'));return;}
  if(id==='flip'&&this.phase==='ready'){const power=this.charge===null?.7:clamp((this.age-this.charge)/.9,.35,1);this.charge=null;this.launch(power);return;}
  if(this.phase==='air'){
   if(id==='open'){this.opened=true;this.you.userData.pose='backOpen';}
   if(id==='tuck'){this.opened=false;this.you.userData.pose=poses[this.style];}
   if(id==='land'&&this.braceTime===null)this.braceTime=this.flightTime;
  }
  if(id==='next'&&this.phase==='result')this.next();
 }
 launch(power=.7){
  if(this.phase!=='ready')return;this.launchPower=clamp(power,.35,1);this.phase='load';this.time=0;this.you.userData.pose='backLoad';this.you.userData.lean=0;this.controls();
 }
 takeOff(){
  const power=this.launchPower;this.phase='air';this.time=0;this.flightTime=0;this.angle=0;this.omega=0;this.opened=false;this.braceTime=null;
  this.vy=5.9+power*.9;this.vz=.38;this.peak=0;this.you.userData.pose='backSet';this.you.userData.run=0;
  this.mark.visible=true;this.mark.position.set(0,.055,-3.05);this.ui.sound('jump');this.controls();
 }
 next(){
  this.turn++;if(this.turn>=this.count){this.turn=0;this.round++;}
  if(this.round>=4){const best=Math.max(...this.scores),winners=this.scores.flatMap((s,i)=>s===best?[i]:[]);this.score=this.scores[0];this.finish(best===0?'TRY ANOTHER BACKFLIP':winners.map(i=>this.name(i)).join(' & ')+' WIN',this.scores.map((s,i)=>`${this.name(i)}: ${this.styleSets[i].size} styles · ${s} points`).join(' · '),best>0&&winners.includes(0),best>0&&winners.includes(0)&&winners.length>1?'draw':undefined);return;}
  this.prepare();
 }
 update(dt){
  const p=this.you;this.marker.position.set(p.position.x,.03,p.position.z);
  this.status('AGAWOWA · '+backflipStyles[this.style].toUpperCase(),`${this.name()} · ${this.round+1}/4 · ${this.styleSets[this.turn].size} STYLES · ${this.scores[this.turn]} PTS`);
  if(this.phase==='ready'){this.ui.power?.(this.charge===null?0:clamp((this.age-this.charge)/.9,0,1));p.userData.pose=this.charge===null?'idle':'backLoad';p.userData.lean=this.charge===null?0:clamp((this.age-this.charge)/.28,0,1);if(this.isCPU()&&this.time>.9)this.launch(.65+Math.random()*.25);return;}
  if(this.phase==='load'){const drive=this.time>=.2;p.userData.pose=drive?'backDrive':'backLoad';p.userData.lean=drive?clamp((this.time-.2)/.16,0,1):clamp(this.time/.2,0,1);if(this.time>=.36)this.takeOff();return;}
  if(this.phase==='result'){p.userData.pose=this.time<.75?'backLand':this.landingOK?'idle':'knees';p.userData.lean=this.time<.75?clamp(this.time/.75,0,1):0;if(this.time>(this.isCPU()?2:12))this.next();return;}
  if(this.phase!=='air')return;
  this.flightTime+=dt;this.vy-=9.8*dt;p.position.y+=this.vy*dt;p.position.z+=this.vz*dt;this.peak=Math.max(this.peak,p.position.y);
  // Extend upward first; build angular speed only after leaving the ground.
  const setting=this.flightTime<.14;const target=setting?0:this.opened?0:[9.4,9,8.6,8.8][this.style];this.omega+=(target-this.omega)*(1-Math.exp(-dt*(this.opened?18:16)));this.angle+=this.omega*dt;p.userData.lean=-this.angle;p.userData.pose=setting?'backSet':this.opened?'backOpen':poses[this.style];
  if(this.isCPU()&&!this.opened&&this.angle>this.cpuOpenAt)this.perform('open');
  if(this.isCPU()&&this.braceTime===null&&this.vy<0&&p.position.y<this.cpuBraceHeight)this.perform('land');
  const upright=Math.abs(Math.atan2(Math.sin(this.angle),Math.cos(this.angle)));
  this.mark.material.color.set(this.opened&&upright<.48*this.difficultyTuning.window?0x68b767:0xf4bd45);
  if(!this.opened&&this.angle>5.4&&this.angle<6.1)this.note('OPEN — slow the backflip with your feet pointing down.');
  if(this.opened&&this.vy<0&&p.position.y<.75)this.note('LAND — settle onto your feet.');
  this.ui.power?.(clamp(this.angle/TAU,0,1));
  if(p.position.y<=0&&this.flightTime>.2){
   const grade=landingGrade(-this.angle,this.opened,this.braceTime,this.flightTime,p.position.z,this.difficultyTuning.window);
   const clean=grade.feet&&this.angle>=TAU-.48*this.difficultyTuning.window,newStyle=clean&&!this.styleSets[this.turn].has(this.style);
   if(newStyle)this.styleSets[this.turn].add(this.style);
   const points=backflipPoints(clean,newStyle,grade.timing),reason=!clean?'Complete the backflip and open before landing':`${backflipStyles[this.style]} landed · ${newStyle?'new style +100':'repeat style'} · execution +${points-(newStyle?100:0)}`;
   this.landingOK=clean;super.resolve(clean,reason,points);p.userData.pose='backLand';p.userData.lean=0;Object.assign(this.results[this.turn].at(-1),{style:this.style,newStyle});
  }
 }
}
