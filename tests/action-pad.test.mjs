import test from 'node:test';
import assert from 'node:assert/strict';
import {actionLabel,actionIcon,padLayout,releaseQuickCharge} from '../dist/action-pad.js';
import {arrangeActions} from '../dist/mobile-play.js';
import {readFileSync} from 'node:fs';

test('all live movement games cap the visible pad at three actions plus More without losing controls',()=>{
 const actions=['shoot','target','shield','look','sprint'].map(id=>({id,label:id,key:id,hold:id==='sprint'}));
 for(const game of ['football','fourcorners','laski','pampanaa','sulia','stay','pilolo','tyre','penalties'])for(const auto of [true,false]){
  const {primary,secondary}=arrangeActions(game,actions,auto);assert.ok(primary.length<=3,game);const ids=[...primary,...secondary].map(a=>a.id);
  for(const a of actions)assert.ok(ids.includes(a.id)||a.id==='sprint'&&auto&&game!=='penalties',game+': '+a.id);
 }
});
test('rhythm and board choices keep equal prominence and every choice is reachable',()=>{
 for(const game of ['ampe','oware','ludo','dame','chempe','kyekyekule','pempenaa','numbers']){
  const actions=Array.from({length:6},(_,i)=>({id:String(i),label:'Choice '+i}));assert.equal(padLayout(game,actions),'choices');assert.equal(arrangeActions(game,actions).primary.length,6);
 }
 assert.equal(padLayout('penalties',[{id:'left'},{id:'center'},{id:'right'}]),'choices');
 assert.equal(padLayout('laski',[{id:'out-1'},{id:'out-2'}]),'choices');
});
test('quick taps use default power but a held action preserves its charge',()=>{
 const m={charge:10,shotCharge:10,cancelled:0,cancelCharge(){this.cancelled++;}};
 releaseQuickCharge(m,179);assert.equal(m.charge,null);assert.equal(m.shotCharge,null);assert.equal(m.cancelled,1);
 m.charge=20;m.shotCharge=20;releaseQuickCharge(m,180);assert.equal(m.charge,20);assert.equal(m.shotCharge,20);assert.equal(m.cancelled,1);
});
test('action labels stay concise and decorative icons cannot interpret room-player text as HTML',()=>{
 assert.equal(actionLabel('Shoot / tackle'),'Shoot');assert.equal(actionLabel('Fold left leg'),'Left leg');
 const icon=actionIcon({id:'out-1',label:'<img src=x onerror=alert(1)>'});assert.ok(icon.startsWith('<svg'));assert.ok(!icon.includes('onerror'));assert.ok(!icon.includes('<img'));
});
test('mobile styles preserve the existing joystick and maintain phone-sized action targets',()=>{
 const css=readFileSync('dist/mobile.css','utf8').split('/* Thumb action pad.')[1];assert.ok(css);assert.ok(!css.includes('#joystick'));assert.ok(css.includes('--action-size:82px'));assert.ok(css.includes('--support-size:60px'));assert.ok(css.includes('--support-size:52px'));assert.ok(css.includes('min-width:48px'));assert.ok(css.includes('[data-pad=choices]'));assert.ok(css.includes('focus-visible'));
});
