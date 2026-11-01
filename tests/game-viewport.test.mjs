import test from 'node:test';
import assert from 'node:assert/strict';
import {gameViewport,syncGameViewport,enterGameFullscreen} from '../dist/display-mode.js';

test('controls use the visible phone area when browser chrome reduces the layout viewport',()=>{
 const win={innerWidth:390,innerHeight:844,visualViewport:{width:390,height:720,offsetLeft:0,offsetTop:24}};
 assert.deepEqual(gameViewport(win),{left:0,top:24,width:390,height:720});
 win.innerWidth=844;win.innerHeight=390;Object.assign(win.visualViewport,{width:844,height:350,offsetTop:0});
 assert.deepEqual(gameViewport(win),{left:0,top:0,width:844,height:350});
});
test('stale visual viewport dimensions cannot push controls past a rotated screen',()=>{
 const bounds=gameViewport({innerWidth:390,innerHeight:844,visualViewport:{width:844,height:390,offsetLeft:0,offsetTop:0}});
 assert.equal(bounds.width,390);assert.equal(bounds.height,390);
 assert.deepEqual(gameViewport({innerWidth:1366,innerHeight:768}),{left:0,top:0,width:1366,height:768});
});
test('fullscreen keeps the whole game root and synchronises controls on entry and exit',async()=>{
 const styles=new Map(),win={innerWidth:390,innerHeight:720};
 const doc={body:{classList:{add(){}}},documentElement:{style:{setProperty:(k,v)=>styles.set(k,v)},requestFullscreen(){assert.equal(this,doc.documentElement);doc.fullscreenElement=this;win.innerHeight=844;return Promise.resolve();}}};
 syncGameViewport(doc,win);assert.equal(styles.get('--game-view-height'),'720px');
 assert.equal(await enterGameFullscreen(doc,{native:true}),true);syncGameViewport(doc,win);assert.equal(styles.get('--game-view-height'),'844px');
 doc.fullscreenElement=null;win.innerHeight=720;syncGameViewport(doc,win);assert.equal(styles.get('--game-view-height'),'720px');
});

test('orientation switches request fullscreen first and keep touch geometry untransformed',async()=>{
 const {requestGameOrientation}=await import('../dist/display-mode.js');
 for(const choice of ['portrait','landscape']){const calls=[],doc={body:{classList:{add(){}}},documentElement:{requestFullscreen(){calls.push('fullscreen');return Promise.resolve();}}},screen={orientation:{lock(mode){calls.push(mode);return Promise.resolve();}}};
  assert.equal(await requestGameOrientation(choice,doc,screen),true);assert.deepEqual(calls,['fullscreen',choice]);
 }
});
test('Auto unlocks without entering fullscreen and blocked browsers fail gracefully',async()=>{
 const {requestGameOrientation}=await import('../dist/display-mode.js');let unlocked=false;
 const doc={body:{classList:{add(){}}},documentElement:{requestFullscreen(){throw Error('Denied');}}};
 assert.equal(await requestGameOrientation('auto',doc,{orientation:{unlock(){unlocked=true;}}}),true);assert.equal(unlocked,true);
 assert.equal(await requestGameOrientation('landscape',doc,{}),false);
 assert.equal(await requestGameOrientation('portrait',doc,{orientation:{lock(){return Promise.reject(Error('Unsupported'));}}}),false);
 assert.equal(await requestGameOrientation('invalid',doc,{}),false);
});

test('automatic game starts and restarts fill the window without requesting native fullscreen',async()=>{
 let requests=0,filled=0;const doc={body:{classList:{add(name){assert.equal(name,'full-window');filled++;}}},documentElement:{requestFullscreen(){requests++;return Promise.resolve();}}};
 for(let i=0;i<3;i++)assert.equal(await enterGameFullscreen(doc),false);
 assert.equal(requests,0);assert.equal(filled,3);doc.fullscreenElement=doc.documentElement;assert.equal(await enterGameFullscreen(doc),true);assert.equal(requests,0);
});
