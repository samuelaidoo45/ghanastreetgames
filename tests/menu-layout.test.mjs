import test from 'node:test';
import assert from 'node:assert/strict';
import {menuLayout,remapPage} from '../dist/menu-layout.js';
test('desktop catalogue fills two rows with increasing page capacity',()=>{
 for(const [w,h,size]of [[1024,600,6],[1280,720,6],[1728,960,8],[2560,1440,10]]){const layout=menuLayout(w,h);assert.equal(layout.viewport,true);assert.equal(layout.pageSize,size);assert.equal(layout.pageSize,layout.columns*2);}
});
test('all 33 games remain reachable at each desktop capacity, including last page',()=>{
 for(const size of [6,8,10]){const games=Array.from({length:33},(_,i)=>i),visited=[];for(let page=0;page<Math.ceil(games.length/size);page++)visited.push(...games.slice(page*size,page*size+size));assert.deepEqual(visited,games);}
});
test('resizing preserves the current first game within the new page and clamps after filtering',()=>{
 for(const oldSize of [6,8,10])for(const newSize of [6,8,10])for(let page=0;page<Math.ceil(33/oldSize);page++){const first=page*oldSize,p=remapPage(page,oldSize,newSize,33);assert.ok(p*newSize<=first&&first<(p+1)*newSize);}
 assert.equal(remapPage(5,6,8,3),0);assert.equal(remapPage(2,8,6,0),0);
});
test('mobile and short viewports keep scrollable six-game pages',()=>{for(const [w,h]of [[390,844],[820,1180],[1280,420]])assert.equal(menuLayout(w,h).viewport,false);});
