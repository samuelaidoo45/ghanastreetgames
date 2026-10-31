import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {separatePlayers,dribbleBall} from '../dist/street-ball-control.js';
test('exactly overlapping players separate instead of remaining locked together',()=>{
 const players=Array.from({length:5},()=>new THREE.Group());for(let frame=0;frame<20;frame++)separatePlayers(players);
 for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)assert.ok(players[i].position.distanceTo(players[j].position)>.85);
});
test('dribble control stays bounded through a sharp turn at mobile and desktop frame rates',()=>{
 for(const dt of [1/30,1/60,1/120]){const p=new THREE.Group(),b=new THREE.Group();p.userData.run=1;p.rotation.y=0;b.position.set(0,.12,.5);
  for(let time=0;time<2;time+=dt){p.rotation.y=time>1?Math.PI:0;p.position.z+=(time>1?-1:1)*5*dt;dribbleBall(b,p,dt,time);assert.ok(b.position.distanceTo(p.position)<1.05);assert.ok(Number.isFinite(b.rotation.x));}
 }
});
