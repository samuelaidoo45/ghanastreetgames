import test from 'node:test';
import assert from 'node:assert/strict';
import {keyLabel,actionKeyHint,keyboardControlsAvailable} from '../dist/keyboard-controls.js';
test('key badges use readable names matching the game bindings',()=>{assert.equal(keyLabel('Space'),'SPACE');assert.equal(keyLabel(' '),'SPACE');assert.equal(keyLabel('q'),'Q');assert.equal(keyLabel('ArrowLeft'),'←');assert.equal(keyLabel('1'),'1');assert.equal(keyLabel(''),'');});
test('hold instructions distinguish charged and sustained actions',()=>{assert.equal(actionKeyHint({key:'Space',charge:true}),'Hold SPACE');assert.equal(actionKeyHint({key:'Shift',hold:true}),'Hold SHIFT');assert.equal(actionKeyHint({key:'E'}),'E');});
test('desktop and touchscreen laptops show keyboard controls but touch-only phones do not',()=>{assert.equal(keyboardControlsAvailable(false,false,false),true);assert.equal(keyboardControlsAvailable(true,true,true),true);assert.equal(keyboardControlsAvailable(true,false,false),false);assert.equal(keyboardControlsAvailable(true,false,true),false);});
