import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {initInstall,installPlatform} from '../dist/install.js';
function setup(nav={userAgent:'Android',platform:'Linux',maxTouchPoints:1}){
 const els=new Map();const get=id=>{if(!els.has(id))els.set(id,{hidden:false,open:false,events:{},textContent:'',addEventListener(k,f){this.events[k]=f;},replaceChildren(...children){this.children=children;},showModal(){this.open=true;},close(){this.open=false;}});return els.get(id);};
 const events={},display={matches:false,addEventListener(k,f){this.change=f;}};
 const win={isSecureContext:true,matchMedia:()=>display,addEventListener:(k,f)=>events[k]=f};
 const doc={getElementById:get,createElement:()=>({})};
 initInstall(win,doc,nav);return {get,events,display};
}
test('iPhone and desktop-mode iPad get Apple instructions',()=>{
 assert.equal(installPlatform({userAgent:'iPhone'}),'ios');assert.equal(installPlatform({userAgent:'Mac',platform:'MacIntel',maxTouchPoints:5}),'ios');
 const s=setup({userAgent:'iPhone'});s.get('launch-install').events.click();assert.match(s.get('install-steps').children.map(x=>x.textContent).join(' '),/Safari.*Share.*Add to Home Screen/);
});
test('native install is user-triggered, consumed once, and dismissal remains playable',async()=>{
 const s=setup();let calls=0,prevented=false;s.events.beforeinstallprompt({preventDefault(){prevented=true;},async prompt(){calls++;},userChoice:Promise.resolve({outcome:'dismissed'})});
 assert.ok(prevented);assert.equal(calls,0);s.get('launch-install').events.click();assert.equal(calls,0);assert.equal(s.get('install-native').hidden,false);
 await s.get('install-native').events.click();await s.get('install-native').events.click();assert.equal(calls,1);assert.match(s.get('install-status').textContent,/cancelled/);assert.equal(s.get('launch-install').hidden,false);assert.equal(s.get('install-native').hidden,true);
});
test('failed prompt offers browser instructions instead of claiming installation',async()=>{const s=setup();s.events.beforeinstallprompt({preventDefault(){},async prompt(){throw Error('unsupported');}});await s.get('install-native').events.click();assert.match(s.get('install-status').textContent,/could not open/);assert.equal(s.get('install-steps').hidden,false);});
test('installed and standalone sessions hide both installation entry points',()=>{
 const s=setup();s.events.appinstalled();assert.equal(s.get('launch-install').hidden,true);assert.equal(s.get('lobby-install').hidden,true);
 const ios=setup({standalone:true,userAgent:'iPhone'});assert.equal(ios.get('launch-install').hidden,true);
 const other=setup();other.display.change({matches:true});assert.equal(other.get('launch-install').hidden,true);
});
test('manifest has standalone identity, valid PNG dimensions and maskable icon',()=>{
 const m=JSON.parse(readFileSync('dist/manifest.webmanifest'));assert.equal(m.display,'standalone');assert.equal(m.id,'/');assert.ok(m.icons.some(i=>i.purpose==='maskable'));
 for(const i of m.icons){const b=readFileSync('dist/'+i.src);assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`,i.sizes);}
});
test('service worker bypasses API/assets/POST and falls back only for failed page navigation',async()=>{
 const handlers={};let response;const offline={offline:true};vm.runInNewContext(readFileSync('dist/sw.js','utf8'),{URL,Response,self:{location:{origin:'https://game.test'},addEventListener:(name,fn)=>handlers[name]=fn},fetch:async()=>{throw Error('offline');},caches:{match:async()=>offline}});
 for(const request of [{method:'POST',mode:'navigate',url:'https://game.test/'},{method:'GET',mode:'cors',url:'https://game.test/arcade.js'},{method:'GET',mode:'navigate',url:'https://api.test/players'}])handlers.fetch({request,respondWith(){assert.fail('must bypass');}});
 handlers.fetch({request:{method:'GET',mode:'navigate',url:'https://game.test/'},respondWith(p){response=p;}});assert.equal(await response,offline);
});
