// Installation is optional and never blocks entering the street.
export function installPlatform(nav) {
 if (/iPhone|iPad|iPod/i.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)) return 'ios';
 return /Android/i.test(nav.userAgent) ? 'android' : 'desktop';
}
export function initInstall(win, doc, nav) {
 const buttons = ['launch-install','lobby-install'].map(id => doc.getElementById(id));
 const dialog = doc.getElementById('install-dialog'), native = doc.getElementById('install-native');
 const status = doc.getElementById('install-status'), steps = doc.getElementById('install-steps');
 const standalone = win.matchMedia('(display-mode: standalone)');
 let pending = null, installed = !!nav.standalone || standalone.matches, busy = false;
 const sync = () => {buttons.forEach(b => b.hidden = installed);native.hidden = !pending || installed;native.disabled = busy;};
 function help() {
  const platform = installPlatform(nav);
  doc.getElementById('install-intro').textContent = pending ? 'Add Ghana Street Games to your home screen for quick access.' : platform === 'ios' ? 'Add the game to your iPhone or iPad from Safari.' : 'Add the game from your browser’s menu.';
  const instructions = pending ? [] : platform === 'ios' ? ['Open this game in Safari.','Tap Share (the square with an upward arrow).','Choose Add to Home Screen. Keep Open as Web App on if shown, then tap Add.'] : platform === 'android' ? ['Open this game in Chrome on your phone.','Open the ⋮ menu and choose Install app or Add to Home screen.','Confirm Install or Add. If it is not listed, keep browsing and try again.'] : ['Open your browser’s menu or the install icon in the address bar.','Choose Install Ghana Street Games or Install this site as an app, if available.'];
  steps.replaceChildren(...instructions.map(text => {const li = doc.createElement('li');li.textContent=text;return li;}));
  steps.hidden = !instructions.length;
  sync();
 }
 function open(){status.textContent='';help();dialog.showModal();}
 async function promptInstall(){
  if(!pending || busy)return;
  const prompt = pending;pending=null;busy=true;sync();
  try {
   await prompt.prompt();const choice=await prompt.userChoice;
   status.textContent=choice.outcome==='accepted'?'Installation requested. Follow your browser’s confirmation.':'Installation cancelled. You can keep playing and install later.';
  } catch {status.textContent='The install prompt could not open. Try your browser’s menu instead.';}
  finally {busy=false;help();}
 }
 buttons.forEach(b=>b.addEventListener('click',open));
 native.addEventListener('click',promptInstall);
 for(const id of ['install-close','install-done'])doc.getElementById(id).addEventListener('click',()=>dialog.close());
 win.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;if(dialog.open)help();else sync();});
 win.addEventListener('appinstalled',()=>{installed=true;pending=null;status.textContent='Game installed. Look for Street Games on your home screen.';sync();});
 standalone.addEventListener('change',event=>{installed=event.matches || !!nav.standalone;sync();});
 sync();
 if('serviceWorker' in nav && win.isSecureContext)nav.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{});
}
if(typeof window!=='undefined')initInstall(window,document,navigator);
