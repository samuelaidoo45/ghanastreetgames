import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
test('mobile GLBs preserve mesh accessors and contain valid embedded image ranges',()=>{
 for(const name of readdirSync('dist/assets/mobile/characters')){
 const b=readFileSync('dist/assets/mobile/characters/'+name),old=readFileSync('dist/assets/characters/'+name);assert.equal(b.readUInt32LE(8),b.length);const n=b.readUInt32LE(12),data=JSON.parse(b.subarray(20,20+n)),prior=JSON.parse(old.subarray(20,20+old.readUInt32LE(12)));assert.deepEqual(data.accessors,prior.accessors);assert.deepEqual(data.meshes,prior.meshes);for(const v of data.bufferViews){assert.equal(v.byteOffset%4,0);assert.ok(v.byteOffset+v.byteLength<=data.buffers[0].byteLength);}assert.ok(b.length<=old.length*1.1);
 }
});
test('mobile asset set is less than half the original download size',()=>{const size=base=>['characters','textures'].reduce((sum,dir)=>sum+readdirSync(base+'/'+dir).reduce((n,f)=>n+statSync(base+'/'+dir+'/'+f).size,0),0);assert.ok(size('dist/assets/mobile')<size('dist/assets')*.5);});
