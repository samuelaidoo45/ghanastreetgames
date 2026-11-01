import {enterGameFullscreen,syncGameViewport} from '../dist/display-mode.js';
import {SoloChallenge} from '../dist/solo-challenge.js';
import {difficultyHint} from '../dist/difficulty.js';
import {initialGraphics} from '../dist/graphics-profile.js';
import {actionLabel,actionIcon,padLayout,releaseQuickCharge} from '../dist/action-pad.js';
// Runs the actual UI controller with pointer events and a small DOM substitute.
// It is an integration check, not a claim of browser CSS or device validation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {roomSettings,seeded} from '../dist/multiplayer-games.js';
import {catalogue,categories,sources} from '../dist/catalogue.js';
import {formationFor} from '../dist/football-formations.js';
import {menuLayout,remapPage,menuOrder} from '../dist/menu-layout.js';
import {mobileProfile,arrangeActions,joystickVector,RenderBudget,mobileMessage} from '../dist/mobile-play.js';
import {bindChargeControl,bindTapControl,bindJoystick} from '../dist/touch-controls.js';
class Element extends EventTarget{
 constructor(tag='div'){super();this.tagName=tag.toUpperCase();this.style={setProperty(){}};this.dataset={};this.children=[];this.options=[];this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.open=false;this.classList={add(){},remove(){},toggle(){}};}
 append(...children){this.children.push(...children);for(const c of children)c.parent=this;if(this.tagName==='SELECT')this.options=this.children;}
 replaceChildren(...children){this.children=[];this.append(...children);}
 setAttribute(k,v){this[k]=v;}
 querySelector(selector){if(selector==='strong'||selector==='summary')return this.children.find(c=>c.tagName===selector.toUpperCase());return this.children.find(c=>c.matches?.(selector))||new Element();}
 closest(selector){return selector==='button'&&this.tagName==='BUTTON'?this:null;}
 setPointerCapture(){} focus(){} getAnimations(){return [];} animate(){return {};} showModal(){this.open=true;} close(){this.open=false;}
 getBoundingClientRect(){return this.bounds||{left:0,top:0,width:100,height:100,bottom:100};}
}
function setup(){
 const nodes=new Map();for(const m of readFileSync('dist/index.html','utf8').matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g))nodes.set('#'+m[2],new Element(m[1]));
 const extra=new Map();const $=selector=>nodes.get(selector)||extra.get(selector)||(()=>{const e=new Element();extra.set(selector,e);return e;})();
 $('.play-bottom').bounds={left:12,top:680,width:366,height:152,bottom:832};$('.match-header').bounds={left:12,top:12,width:366,height:80,bottom:92};$('#world').clientHeight=844;$('#world').clientWidth=390;
 const doc=new EventTarget();Object.assign(doc,{body:new Element('body'),documentElement:new Element('html'),hidden:false,createElement:tag=>new Element(tag),querySelector:$,querySelectorAll:selector=>selector==='dialog'?[...nodes.values()].filter(e=>e.tagName==='DIALOG'):[]});
 const frames=[],window=new EventTarget();window.visualViewport=new EventTarget();
 class Sound{setScene(){}setEnabled(){}setVolume(){}setVisible(){}play(){}unlock(){return Promise.resolve();}}
 class Replay{supported(){return false;}finish(){return Promise.resolve();}pause(){}resume(){}}
 const ctx=vm.createContext({SoloChallenge,enterGameFullscreen:()=>enterGameFullscreen(doc),syncGameViewport:()=>syncGameViewport(doc,{innerWidth:390,innerHeight:844}),difficultyHint,initialGraphics,actionLabel,actionIcon,padLayout,releaseQuickCharge,roomSettings,seeded,initClub:()=>({launchContext:null,attach(){},finishRound(){},leave(){},open(){}}),console,document:doc,window,navigator:{maxTouchPoints:5,hardwareConcurrency:4},matchMedia:()=>({matches:true}),innerWidth:390,innerHeight:844,performance,location:{search:''},localStorage:{getItem(){return null;},setItem(){}},requestAnimationFrame:f=>(frames.push(f),frames.length),setTimeout,clearTimeout,URLSearchParams,Soundscape:Sound,ReplayRecorder:Replay,clampVolume:Number,catalogue,categories,sources,formationFor,menuLayout,remapPage,menuOrder,mobileProfile,arrangeActions,joystickVector,RenderBudget,mobileMessage,bindChargeControl,bindTapControl,bindJoystick});
 const source=readFileSync('dist/arcade.js','utf8').replace(/^import .*?;\n/gm,'');vm.runInContext(source,ctx);
 return {ctx,$,frames,run:code=>vm.runInContext(code,ctx)};
}
function send(element,type,id=1,extra={}){const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:id,button:0,clientX:95,clientY:50,...extra});element.dispatchEvent(event);}
test('mobile app boots without a rendering loop; real control wiring survives pause and multitouch',async()=>{
 const h=setup();assert.equal(h.frames.length,0,'menu must not run a WebGL frame loop');
 h.run(`world={quality:'balanced',canvas:{clientWidth:390,clientHeight:844},desired:{toArray:()=>[0,10,10]},targetLook:{toArray:()=>[0,0,0]},render(){},updateViewOffset(){}};
 clearVenue=()=>{};
 createMode=ctx=>{const m={...ctx,actions:[{id:'shoot',label:'Shoot',key:'Space',charge:true},{id:'low',label:'Low shot',key:'F'},{id:'chip',label:'Chip',key:'R'},{id:'pass',label:'Pass',key:'E'},{id:'switch',label:'Switch',key:'Q'},{id:'sprint',label:'Sprint',key:'Shift',hold:true}],calls:[],hold(id){this.calls.push('hold:'+id);},action(id){this.calls.push(id);},dispose(){}};ctx.ui.actions(m.actions);return m;};
 $('#setup-dialog').open=true;$('#team-size').value='3';$('#goal-size').value='big';$('#formation').value='balanced';`);
 await h.run('startGame()');
 const buttons=h.$('#action-buttons').children;assert.deepEqual(buttons.filter(b=>b.tagName==='BUTTON').map(b=>b.dataset.action),['shoot','pass','low','chip','switch','sprint']);assert.ok(buttons.every(b=>b.tagName==='BUTTON'));assert.equal(h.$('#action-buttons').dataset.count,'6');assert.ok(h.frames.length>0);
 const chip=buttons.find(b=>b.dataset.action==='chip');send(chip,'pointerdown',8);send(chip,'pointerup',8);assert.equal(h.run('active.calls.join()'),'chip');h.run('active.calls=[]');
 const shoot=buttons[0],stick=h.$('#joystick');send(stick,'pointerdown',1);assert.equal(h.run('input.sprint'),true);
 send(shoot,'pointerdown',2);send(shoot,'pointerup',1);assert.equal(h.run('active.calls.join()'),'hold:shoot');
 h.run('clearInput()');assert.equal(h.run('input.sprint'),false);send(shoot,'pointerup',2);assert.equal(h.run('active.calls.join()'),'hold:shoot');
 send(stick,'pointermove',1);assert.equal(h.run('input.stick.x'),0);send(shoot,'pointerdown',3);send(shoot,'pointerup',3);assert.equal(h.run('active.calls.join()'),'hold:shoot,hold:shoot,shoot');
 h.frames.length=0;h.run("state='paused';frame(performance.now()+40)");assert.equal(h.frames.length,0);
});

test('fullscreen and viewport events resize once and measure controls relative to the visible canvas',()=>{
 const h=setup();
 h.run("state='playing';world={resizes:0,resize(){this.resizes++;},updateViewOffset(){}};active={frameView(){}};");
 h.$('#world').bounds={left:0,top:24,width:390,height:720,bottom:744};
 h.$('#world').clientHeight=720;
 h.$('.play-bottom').bounds={left:12,top:600,width:366,height:124,bottom:724};
 h.$('.match-header').bounds={left:12,top:36,width:366,height:80,bottom:116};
 h.$('#corner-scores').hidden=h.$('#penalty-scores').hidden=true;
 h.ctx.document.dispatchEvent(new Event('fullscreenchange'));
 h.ctx.window.visualViewport.dispatchEvent(new Event('resize'));
 h.ctx.window.visualViewport.dispatchEvent(new Event('scroll'));
 assert.equal(h.frames.length,1,'transition events must share a single resize');
 h.frames.shift()();
 assert.equal(h.run('world.resizes'),1);
 assert.equal(h.run('world.mobileViewport.top'),100);
 assert.equal(h.run('world.mobileViewport.bottom'),156);
});
