import test from 'node:test';
import assert from 'node:assert/strict';
import {bindChargeControl} from '../dist/touch-controls.js';
function control(){
 const button=new EventTarget(),events=[];button.disabled=false;button.setPointerCapture=id=>events.push(['capture',id]);
 bindChargeControl(button,Object.fromEntries(['start','release','cancel','activate'].map(name=>[name,()=>events.push(name)])));
 return {button,events,send(type,id=1,extra={}){const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:id,button:0,...extra});button.dispatchEvent(event);}};
}
test('a second finger cannot release or replace a charged action',()=>{
 const c=control();c.send('pointerdown');c.send('pointerdown',2);c.send('pointerup',2);assert.equal(c.events.filter(e=>e==='release').length,0);
 c.send('pointerup');c.send('lostpointercapture');assert.deepEqual(c.events,[['capture',1],'start','release']);
});
test('cancelled and lost touch capture clear charge without firing; next gesture works',()=>{
 for(const type of ['pointercancel','lostpointercapture']){const c=control();c.send('pointerdown');c.send(type);c.send('pointerup');assert.deepEqual(c.events,[['capture',1],'start','cancel']);c.send('pointerdown',3);c.send('pointerup',3);assert.equal(c.events.at(-1),'release');}
});
test('touch clicks do not fire twice and keyboard activation remains available',()=>{
 const c=control();c.send('pointerdown');c.send('pointerup');c.send('click',1,{detail:1});assert.equal(c.events.filter(e=>e==='release'||e==='activate').length,1);
 c.send('click',1,{detail:0});assert.equal(c.events.at(-1),'activate');
});
test('disabled and secondary-button presses cannot start a charge',()=>{
 const c=control();c.button.disabled=true;c.send('pointerdown');c.send('click',1,{detail:0});c.button.disabled=false;c.send('pointerdown',1,{button:2});assert.deepEqual(c.events,[]);
});

test('focused keyboard charging suppresses global shortcuts and native button clicks',()=>{
 const c=control();
 function key(type,value,repeat=false){const e=new Event(type,{cancelable:true});Object.assign(e,{key:value,repeat});let stopped=false;e.stopPropagation=()=>{stopped=true;};c.button.dispatchEvent(e);assert.ok(e.defaultPrevented);assert.ok(stopped);}
 key('keydown',' ');key('keydown',' ',true);key('keyup','Enter');assert.deepEqual(c.events,['start']);key('keyup',' ');assert.deepEqual(c.events,['start','release']);
});
test('losing keyboard focus cancels the shot instead of firing it later',()=>{
 const c=control();c.send('keydown',1,{key:' '});c.send('blur');c.send('keyup',1,{key:' '});assert.deepEqual(c.events,['start','cancel']);
});
test('pause cancels pointer ownership so resuming cannot fire an old shot',()=>{
 const button=new EventTarget(),events=[];button.setPointerCapture=()=>{};
 const control=bindChargeControl(button,{start:()=>events.push('start'),cancel:()=>events.push('cancel'),release:()=>events.push('release'),activate(){}});
 const send=type=>{const e=new Event(type);Object.assign(e,{pointerId:1,button:0});button.dispatchEvent(e);};
 send('pointerdown');control.cancel();send('pointerup');assert.deepEqual(events,['start','cancel']);send('pointerdown');send('pointerup');assert.equal(events.at(-1),'release');
});
test('disabling a held charge cancels rather than releases it',()=>{
 const c=control();c.send('pointerdown');c.button.disabled=true;c.send('pointerup');assert.equal(c.events.at(-1),'cancel');
});

const {bindTapControl,bindJoystick}=await import('../dist/touch-controls.js');
function pointer(target,type,id=1,extra={}){const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:id,button:0,...extra});target.dispatchEvent(e);return e;}
test('timing buttons fire immediately once and ignore another finger and native click',()=>{
 const b=new EventTarget();b.setPointerCapture=()=>{};let calls=0;bindTapControl(b,()=>calls++);
 pointer(b,'pointerdown');assert.equal(calls,1);pointer(b,'pointerdown',2);pointer(b,'pointerup',2);pointer(b,'click',1,{detail:1});assert.equal(calls,1);
 pointer(b,'pointerup');pointer(b,'click',1,{detail:0});assert.equal(calls,2);b.disabled=true;pointer(b,'pointerdown');assert.equal(calls,2);
});
test('joystick ownership survives a second finger and resets after pause or lost capture',()=>{
 const pad=new EventTarget();pad.setPointerCapture=()=>{};let moves=0,resets=0;
 const stick=bindJoystick(pad,{move(){moves++;},reset(){resets++;}});
 pointer(pad,'pointerdown');pointer(pad,'pointerdown',2);pointer(pad,'pointermove',2);pointer(pad,'pointerup',2);assert.equal(moves,1);assert.equal(resets,0);
 pointer(pad,'pointermove');assert.equal(moves,2);stick.cancel();pointer(pad,'pointermove');assert.equal(moves,2);
 pointer(pad,'pointerdown',3);pointer(pad,'lostpointercapture',3);assert.equal(moves,3);assert.equal(resets,2);
 pointer(pad,'pointerdown',4);pointer(pad,'pointercancel',4);assert.equal(moves,4);assert.equal(resets,3);
});
