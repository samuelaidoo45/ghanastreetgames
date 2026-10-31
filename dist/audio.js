const FILES={street:'street-ambience.ogg',crowd:'crowd-ambience.ogg',music:'menu-music.mp3',mouth:'pampanaa-mouth.mp3',band:'impactGeneric_light_000.ogg',kick:'football-kick.mp3',clap:'handclap.mp3',call:'whistle.mp3',goal:'applause.mp3',point:'handclap.mp3',miss:'impactSoft_medium_000.ogg',stone:'impactWood_light_000.ogg',swing:'impactGeneric_light_000.ogg',jump:'footstep-dirt-1.mp3',step1:'footstep-dirt-1.mp3',step2:'footstep-dirt-2.mp3',step3:'footstep-dirt-3.mp3',ambience:'outdoor-ambience.ogg'};
export const clampVolume=(value,fallback=.6)=>Number.isFinite(Number(value))?Math.max(0,Math.min(1,Number(value))):fallback;
export function sceneMix(scene,venue='pitch'){
 if(scene==='replay')return {music:0,ambience:0};
 const playing=scene==='game',quiet=['neighbourhood','lane','wall'].includes(venue);
 return {music:scene==='menu'?.58:playing?(quiet?.075:.19):scene==='paused'?.22:.38,ambience:playing?.65:scene==='menu'?.2:.12};
}
export class Soundscape{
 constructor(){this.enabled=true;this.active=false;this.scene='menu';this.venue='pitch';this.visible=true;this.volumes={music:.55,ambience:.7,effects:.85};this.buffers={};this.raw={};this.context=null;this.loops=new Map();this.initializing=null;}
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
 setScene(scene,venue=this.venue){this.scene=scene;this.venue=venue;this.active=scene==='game';this.sync();}
 setActive(active){this.setScene(active?'game':'menu');}
 ramp(param,value,time=.35){param.setTargetAtTime(value,this.context.currentTime,time);}
 loop(key,volume){if(!this.buffers[key])return;let loop=this.loops.get(key);if(!loop&&volume>0){const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=this.buffers[key];source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.master);source.start();loop={source,gain};this.loops.set(key,loop);}if(loop)this.ramp(loop.gain.gain,volume,.45);}
 sync(){if(!this.master)return;this.ramp(this.master.gain,this.enabled&&this.visible?.78:0,.08);this.ramp(this.effects.gain,this.volumes.effects,.08);const mix=sceneMix(this.scene,this.venue);this.loop('music',mix.music*this.volumes.music);const ambience=mix.ambience*this.volumes.ambience;const street=['neighbourhood','lane','wall'].includes(this.venue)&&!!this.buffers.street;const crowd=this.venue==='pitch'&&this.scene==='game'&&!!this.buffers.crowd;this.loop('ambience',ambience*(street?.25:crowd?.35:1));this.loop('street',ambience*(street?.8:this.scene==='menu'?.45:0));this.loop('crowd',ambience*(crowd?.7:0));}
 play(type){if(!this.enabled||!this.visible||!this.context||this.context.state!=='running')return;const key=type==='step'?'step'+(1+Math.floor(Math.random()*3)):type;const buffer=this.buffers[key]||this.buffers.stone;if(!buffer)return;const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.playbackRate.value=type==='call'?1:.96+Math.random()*.08;gain.gain.value={step:.34,goal:.65,call:.38,point:.25,clap:.48,kick:.7,stone:.45}[type]||.34;source.connect(gain);gain.connect(this.effects);source.start();source.onended=()=>{source.disconnect();gain.disconnect();};}
 dispose(){for(const {source,gain}of this.loops.values()){source.stop();source.disconnect();gain.disconnect();}this.loops.clear();this.context?.close();this.context=null;this.master=null;}
}
