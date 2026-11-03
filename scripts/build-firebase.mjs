import {build} from 'esbuild';
await build({entryPoints:['src/firebase-sdk.js'],outfile:'dist/vendor/firebase-analytics.js',bundle:true,format:'esm',platform:'browser',target:['es2020'],minify:true,legalComments:'linked',sourcemap:false});
console.log('Firebase App + Analytics bundle built.');
