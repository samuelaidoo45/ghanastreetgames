// Analytics is optional. No Firebase or Google script is loaded before consent.
export const ANALYTICS_KEY='gsg.analytics-consent.v1';
export const MEASUREMENT_ID='G-TFT87BW5F7';
export function analyticsAllowed(env,consent){
  return consent===true&&env.location?.protocol==='https:'&&env.location?.hostname==='ghanastreetgames.vercel.app'&&env.navigator?.globalPrivacyControl!==true&&env.navigator?.doNotTrack!=='1'&&env.doNotTrack!=='1';
}
export function createAnalyticsController(env,loadSDK){
  let consent=false,sdk=null,pending=null;
  try{consent=env.localStorage.getItem(ANALYTICS_KEY)==='granted';}catch{}
  const allowed=()=>analyticsAllowed(env,consent);
  function clearCookies(){
    try{for(const item of env.document.cookie.split(';')){
      const name=item.trim().split('=')[0];if(!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name))continue;
      for(const domain of ['',`; Domain=${env.location.hostname}`])env.document.cookie=`${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain}`;
    }}catch{}
  }
  async function sync(){
    env['ga-disable-'+MEASUREMENT_ID]=!allowed();
    if(!allowed()){sdk?.disable();clearCookies();return false;}
    if(pending)return pending;
    pending=(async()=>{try{
      sdk??=await loadSDK();
      if(!allowed()||!await sdk.isSupported()||!allowed())return false;
      sdk.enable();return true;
    }catch{return false;}finally{pending=null;}})();
    return pending;
  }
  function setConsent(value){
    consent=value===true;
    try{env.localStorage.setItem(ANALYTICS_KEY,consent?'granted':'denied');}catch{}
    return sync();
  }
  return {sync,setConsent,isAllowed:allowed,hasConsent:()=>consent};
}
if(typeof window!=='undefined'){
  const controller=createAnalyticsController(window,()=>import('./vendor/firebase-analytics.js'));
  const checkbox=document.querySelector('#analytics-setting'),status=document.querySelector('#analytics-status');
  function refresh(){if(checkbox)checkbox.checked=controller.hasConsent();}
  refresh();
  checkbox?.addEventListener('change',async()=>{
    const enabled=await controller.setConsent(checkbox.checked);
    status.textContent=enabled?'Usage analytics enabled.':checkbox.checked?'Analytics is unavailable or blocked by your browser privacy settings.':'Usage analytics off.';
  });
  window.addEventListener('storage',event=>{if(event.key===ANALYTICS_KEY||event.key===null){controller.setConsent(event.newValue==='granted');refresh();}});
  controller.sync();
}
