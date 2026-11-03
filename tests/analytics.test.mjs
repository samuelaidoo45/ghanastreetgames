import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createAnalyticsController,analyticsAllowed,ANALYTICS_KEY,MEASUREMENT_ID} from '../dist/analytics.js';
function harness(value=null){
 const store=new Map(value?[[ANALYTICS_KEY,value]]:[]),calls=[];
 const env={location:{protocol:'https:',hostname:'ghanastreetgames.vercel.app'},navigator:{},document:{cookie:''},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}};
 const sdk={isSupported:async()=>true,enable:()=>calls.push('enable'),disable:()=>calls.push('disable')};
 let loads=0;const controller=createAnalyticsController(env,async()=>{loads++;return sdk;});
 return {env,controller,calls,sdk,loads:()=>loads};
}
test('analytics does not load SDK or send data by default',async()=>{const h=harness();assert.equal(await h.controller.sync(),false);assert.equal(h.loads(),0);assert.equal(h.env['ga-disable-'+MEASUREMENT_ID],true);});
test('explicit consent enables once per sync; revocation disables collection',async()=>{const h=harness();assert.equal(await h.controller.setConsent(true),true);assert.equal(h.loads(),1);await h.controller.setConsent(false);assert.deepEqual(h.calls,['enable','disable']);assert.equal(h.env['ga-disable-'+MEASUREMENT_ID],true);assert.equal(h.env.localStorage.getItem(ANALYTICS_KEY),'denied');});
test('honors privacy signals and prevents localhost/preview analytics',async()=>{for(const patch of [{navigator:{globalPrivacyControl:true}},{navigator:{doNotTrack:'1'}},{location:{hostname:'localhost',protocol:'https:'}},{location:{hostname:'preview.vercel.app',protocol:'https:'}},{location:{hostname:'ghanastreetgames.vercel.app',protocol:'http:'}}]){const h=harness('granted');Object.assign(h.env,patch);assert.equal(await h.controller.sync(),false);assert.equal(h.loads(),0);}});
test('revocation while SDK loads cannot start tracking later',async()=>{const h=harness();let resolve;const pending=new Promise(r=>resolve=r);const c=createAnalyticsController(h.env,()=>pending);const start=c.setConsent(true);await c.setConsent(false);resolve(h.sdk);assert.equal(await start,false);assert.ok(!h.calls.includes('enable'));});
test('unsupported browsers and blocked imports do not break the game',async()=>{const h=harness('granted');h.sdk.isSupported=async()=>false;assert.equal(await h.controller.sync(),false);const c=createAnalyticsController(h.env,async()=>{throw Error('blocked');});assert.equal(await c.sync(),false);});
test('blocked preference storage defaults off and remains safe',async()=>{const h=harness();h.env.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};const c=createAnalyticsController(h.env,async()=>h.sdk);assert.equal(await c.sync(),false);assert.equal(analyticsAllowed(h.env,false),false);});
test('integration uses only one tag, fixed page data, and no ad features',()=>{const source=readFileSync('src/firebase-sdk.js','utf8'),html=readFileSync('dist/index.html','utf8');assert.ok(source.includes('send_page_view:false'));assert.ok(source.includes('allow_google_signals:false'));assert.ok(source.includes("ad_user_data:'denied'"));assert.ok(source.includes("page_referrer:''"));assert.ok(!source.includes('window.location'));assert.ok(!html.includes('<script async src="https://www.googletagmanager.com'));assert.ok(!html.includes("script-src 'self' 'unsafe-inline'"));});
