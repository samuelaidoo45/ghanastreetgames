import test from 'node:test';
import assert from 'node:assert/strict';
import {initialGraphics} from '../dist/graphics-profile.js';
import {renderPixelRatio} from '../dist/mobile-play.js';
test('modern phones default to balanced while constrained devices keep battery mode',()=>{
 assert.equal(initialGraphics({performanceVersion:47,quality:'low'},{mobile:true,memory:8,cores:8}),'balanced');
 for(const device of [{mobile:true,memory:2},{mobile:true,cores:2},{mobile:true,saveData:true}])assert.equal(initialGraphics({},device),'low');
 assert.equal(initialGraphics({performanceVersion:48,quality:'low'},{mobile:true,memory:8}),'low');
});
test('balanced phone resolution stays sharp within its 1.5 million pixel budget',()=>{
 assert.equal(renderPixelRatio(390,844,3,'balanced'),1.25);
 const ratio=renderPixelRatio(1920,1080,3,'balanced');assert.ok(1920*1080*ratio*ratio<=1500001);
 assert.ok(renderPixelRatio(390,844,3,'balanced')>renderPixelRatio(390,844,3,'low'));
});
