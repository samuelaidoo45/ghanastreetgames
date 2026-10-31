import {readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const files=readdirSync('dist').filter(f=>f.endsWith('.js'));
for(const file of files)execFileSync(process.execPath,['--check',`dist/${file}`],{stdio:'inherit'});
console.log(`${files.length} application modules passed syntax checks.`);
// A stylesheet must never be overwritten with a JavaScript module.
const {readFileSync,existsSync}=await import('node:fs');
const {resolve,dirname}=await import('node:path');
const originalCSS=readFileSync('dist/arcade.css','utf8');const css=originalCSS+'\n'+readFileSync('dist/street-style.css','utf8')+'\n'+readFileSync('dist/clean-menu.css','utf8')+'\n'+readFileSync('dist/mobile.css','utf8');
if(!css.startsWith('@font-face')||/^import\s+\{/m.test(css))throw new Error('arcade.css is not the game stylesheet');
for(const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){if(!/^(data:|https?:)/.test(match[1])&&!existsSync(resolve('dist',match[1])))throw new Error('Missing CSS asset: '+match[1]);}
for(const file of files){for(const match of readFileSync('dist/'+file,'utf8').matchAll(/(?:from\s+|import\(\s*)['"](\.\.?\/[^'"]+)['"]/g)){if(!existsSync(resolve('dist',match[1])))throw new Error(`Missing import in ${file}: ${match[1]}`);}}
const html=readFileSync('dist/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!/^(https?:|data:)/.test(match[1])&&!existsSync(resolve('dist',match[1])))throw new Error('Missing HTML asset: '+match[1]);}
console.log('Stylesheet, HTML assets and application imports verified.');
