import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});await mkdir('dist/fonts',{recursive:true});
for(const name of ['three.module.js','three.core.js']) await copyFile('node_modules/three/build/'+name,'dist/vendor/'+name);
await copyFile('node_modules/three/LICENSE','dist/vendor/THREE-LICENSE.txt');
for(const [font,file]of [['bungee','bungee-latin-400-normal.woff2'],['shantell-sans','shantell-sans-latin-500-normal.woff2'],['shantell-sans','shantell-sans-latin-700-normal.woff2']])await copyFile('node_modules/@fontsource/'+font+'/files/'+file,'dist/fonts/'+file);
for(const font of ['bungee','shantell-sans'])await copyFile('node_modules/@fontsource/'+font+'/LICENSE','dist/fonts/'+font+'-LICENSE.txt');
// Keep the small subset of Three.js addons used by the game available offline.
const {readFile,writeFile}=await import('node:fs/promises');
const path=await import('node:path');
const copied=new Set();
async function addon(file){if(copied.has(file))return;copied.add(file);const source='node_modules/three/examples/jsm/'+file,dest='dist/vendor/addons/'+file;let text=await readFile(source,'utf8');for(const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)){const ref=match[1];if(ref.startsWith('.'))await addon(path.posix.normalize(path.posix.join(path.posix.dirname(file),ref)));}let core=path.posix.relative(path.posix.dirname(dest),'dist/vendor/three.module.js');if(!core.startsWith('.'))core='./'+core;text=text.replace(/from\s+['"]three['"]/g,`from '${core}'`);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,text);}
for(const file of ['loaders/HDRLoader.js','loaders/GLTFLoader.js','utils/SkeletonUtils.js','postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/OutputPass.js','postprocessing/GTAOPass.js'])await addon(file);
