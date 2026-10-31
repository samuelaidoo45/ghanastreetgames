// Keep the original African instrumental and field recordings. The continuous
// AMB Outside 1 noise bed is deliberately excluded from preload and playback.
const FILES={music:'v43/menu-loop.mp3',street:'street-ambience.ogg',crowd:'crowd-ambience.ogg',cap:'impactGeneric_light_000.ogg',throw:'impactGeneric_light_000.ogg',catch:'impactSoft_medium_000.ogg',ballHit:'impactSoft_medium_000.ogg',bounce:'impactSoft_medium_000.ogg',start:'v43/soft-clap.mp3',mouth:'pampanaa-mouth.mp3',band:'impactGeneric_light_000.ogg',kick:'football-kick.mp3',clap:'v43/soft-clap.mp3',call:'whistle.mp3',goal:'applause.mp3',point:'v43/soft-clap.mp3',miss:'impactSoft_medium_000.ogg',stone:'impactWood_light_000.ogg',swing:'impactGeneric_light_000.ogg',jump:'footstep-dirt-1.mp3',step1:'footstep-dirt-1.mp3',step2:'footstep-dirt-2.mp3',step3:'footstep-dirt-3.mp3',concrete:'footstep_concrete_000.ogg',grass:'footstep_grass_000.ogg',wood:'footstep_wood_000.ogg'};
export function audioProfile(game='',venue='pitch',surface='dirt'){
 const sport=['football','fourcorners','penalties','laski','onepole','sulia','chaskele'].includes(game);
 const rhythm=['ampe','skipping','kyekyekule','pempenaa','mbobagor','antoakyire','tumatu','zanzama'].includes(game);
 const chase=['stay','pilolo','pampanaa','shooting','police','sansankroma','tyre'].includes(game);
 return {bed:sport?'crowd':'street',ambienceScale:sport?.55:rhythm?.32:chase?.42:.2,footstep:surface==='grass'?'grass':surface==='concrete'||venue==='veranda'?'concrete':'step',small:['counters','alikoto','alasa','oware','ludo','dame','kpitinge'].includes(game)};
}
export const clampVolume=(value,fallback=.6)=>Number.isFinite(Number(value))?Math.max(0,Math.min(1,Number(value))):fallback;
export function sceneMix(scene,venue='pitch'){
 if(scene==='replay')return {music:0,ambience:0};
 const quiet=['neighbourhood','lane','wall','streetcourt'].includes(venue);
 return {music:scene==='menu'?.58:scene==='game'?(quiet?.075:.19):scene==='paused'?.22:.38,ambience:scene==='game'?.65:scene==='menu'?.2:.12};
}
export class Soundscape{
 constructor(){this.enabled=true;this.active=false;this.scene='menu';this.venue='pitch';this.game='';this.surface='dirt';this.visible=true;this.volumes={music:.55,ambience:.7,effects:.85};this.buffers={};this.raw={};this.context=null;this.loops=new Map();this.initializing=null;}
 preload(){return this.preloading??=Promise.all(Object.entries(FILES).map(async([key,name])=>{try{const r=await fetch('assets/audio/'+name);if(r.ok)this.raw[key]=await r.arrayBuffer();}catch{}}));}
 unlock(){
  if(this.context){const resumed=this.context.resume();return (this.initializing||Promise.resolve()).then(()=>resumed).then(()=>this.sync());}
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Context)return Promise.resolve(false);
  try{this.context=new Context();}catch{return Promise.resolve(false);}
  const c=this.context;this.master=c.createGain();this.master.gain.value=0;this.effects=c.createGain();this.effects.connect(this.master);this.limiter=c.createDynamicsCompressor();this.limiter.threshold.value=-5;this.limiter.knee.value=12;this.limiter.ratio.value=4;this.master.connect(this.limiter);this.limiter.connect(c.destination);this.recordDestination=c.createMediaStreamDestination();this.limiter.connect(this.recordDestination);
  // Resume synchronously inside the first trusted click, before decoding awaits.
  const resumed=c.resume();
  this.initializing=(async()=>{await this.preload();await Promise.all(Object.entries(this.raw).map(async([key,data])=>{try{this.buffers[key]=await c.decodeAudioData(data.slice(0));}catch{}}));await resumed;this.sync();return true;})().catch(()=>false).finally(()=>this.initializing=null);
  return this.initializing;
 }
 setEnabled(enabled){this.enabled=!!enabled;this.sync();}
 setVolume(channel,value){if(channel in this.volumes)this.volumes[channel]=clampVolume(value,this.volumes[channel]);this.sync();}
 setVisible(visible){this.visible=!!visible;this.sync();}
 setScene(scene,venue=this.venue,game=this.game,surface=this.surface){this.scene=scene;this.venue=venue;this.game=game;this.surface=surface;this.active=scene==='game';this.sync();}
 setActive(active){this.setScene(active?'game':'menu');}
 ramp(param,value,time=.35){param.setTargetAtTime(value,this.context.currentTime,time);}
 loop(key,volume){if(!this.buffers[key])return;let loop=this.loops.get(key);if(!loop&&volume>0){const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=this.buffers[key];source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.master);source.start();loop={source,gain};this.loops.set(key,loop);}if(loop)this.ramp(loop.gain.gain,volume,.45);}
 sync(){if(!this.master)return;this.ramp(this.master.gain,this.enabled&&this.visible?.78:0,.08);this.ramp(this.effects.gain,this.volumes.effects,.08);const mix=sceneMix(this.scene,this.venue),profile=audioProfile(this.game,this.venue,this.surface);this.loop('music',mix.music*this.volumes.music);const level=mix.ambience*this.volumes.ambience;this.loop('street',level*(this.scene==='menu'?.3:profile.bed==='street'?profile.ambienceScale:0));this.loop('crowd',this.scene==='game'&&profile.bed==='crowd'?level*profile.ambienceScale:0);}
 play(type){if(!this.enabled||!this.visible||!this.context||this.context.state!=='running')return;const profile=audioProfile(this.game,this.venue,this.surface);let key=type;
  if(type==='step'||type==='jump')key=profile.footstep==='step'?'step'+(1+Math.floor(Math.random()*3)):profile.footstep;
  if(this.game==='counters'&&['kick','stone','swing'].includes(type))key='cap';
  if(profile.small&&['call','goal'].includes(type))key=type==='call'?'start':'point';
  const buffer=this.buffers[key];if(!buffer)return;
  const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.playbackRate.value=['call','start'].includes(type)?1:.97+Math.random()*.06;gain.gain.value={step:.24,jump:.26,goal:.45,call:.24,point:.25,clap:.36,kick:.6,stone:.35,throw:.55,catch:.6,bounce:.42,ballHit:.55}[type]||.38;source.connect(gain);gain.connect(this.effects);source.start();source.onended=()=>{source.disconnect();gain.disconnect();};}
 dispose(){for(const {source,gain}of this.loops.values()){source.stop();source.disconnect();gain.disconnect();}this.loops.clear();this.context?.close();this.context=null;this.master=null;}
}
