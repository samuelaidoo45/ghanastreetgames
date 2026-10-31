import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Exercise the actual registered game handlers without booting WebGL or audio.
function shortcuts(){
 const source=readFileSync(new URL('../dist/arcade.js',import.meta.url),'utf8');
 const begin=source.indexOf("window.addEventListener('keydown',e=>"),end=source.indexOf("window.addEventListener('blur'",begin);
 const handlers={},calls=[],keys=new Set(),context={state:'playing',keys,input:{sprint:false,target:null},active:{actions:[{id:'shoot',key:'Space',charge:true}],hold:id=>calls.push(['hold',id])},act:id=>calls.push(['act',id]),document:{querySelector:()=>null},window:{addEventListener:(name,fn)=>handlers[name]=fn}};
 vm.runInNewContext(source.slice(begin,end),context);
 return {keys,calls,send(type,key=' ',interactive=false,repeat=false){handlers[type]({key,repeat,target:{tagName:interactive?'BUTTON':'CANVAS',closest:()=>interactive?{}:null},preventDefault(){}});}};
}
test('focused controls do not also invoke global shooting shortcuts',()=>{
 const s=shortcuts();s.send('keydown',' ',true);s.send('keyup',' ',true);assert.deepEqual(s.calls,[]);
});
test('unmatched key release and a release after pause cannot fire a shot',()=>{
 const s=shortcuts();s.send('keyup');assert.deepEqual(s.calls,[]);s.send('keydown');s.keys.clear();s.send('keyup');assert.deepEqual(s.calls,[['hold','shoot']]);
});
test('a held game shortcut charges once and fires once on release',()=>{
 const s=shortcuts();s.send('keydown');s.send('keydown',' ',false,true);s.send('keyup');s.send('keyup');assert.deepEqual(s.calls,[['hold','shoot'],['act','shoot']]);
});
