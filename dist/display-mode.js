// Match starts fill the available window without triggering browser fullscreen UI.
// Native fullscreen is reserved for an explicit display/orientation action.
export async function enterGameFullscreen(doc=document,{native=false}={}){
 doc.body.classList.add('full-window');
 if(doc.fullscreenElement||doc.webkitFullscreenElement)return true;
 if(!native)return false;
 const root=doc.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;
 if(!request)return false;
 try{await request.call(root);return true;}catch{return false;}
}

// Browser chrome, rotation and the iOS fullscreen fallback can change the
// visible area without changing the layout viewport used by CSS vh units.
export function gameViewport(win){
 const view=win.visualViewport;
 const width=Math.max(1,win.innerWidth||view?.width||1),height=Math.max(1,win.innerHeight||view?.height||1);
 const left=Math.max(0,Math.min(view?.offsetLeft||0,width-1)),top=Math.max(0,Math.min(view?.offsetTop||0,height-1));
 return {left,top,width:Math.min(view?.width||width,width-left),height:Math.min(view?.height||height,height-top)};
}
export function syncGameViewport(doc=document,win=window){
 const bounds=gameViewport(win);
 for(const [key,value] of Object.entries(bounds))doc.documentElement.style.setProperty('--game-view-'+key,value+'px');
 return bounds;
}

// Orientation locks are a browser capability, not a CSS rotation of the controls.
export async function requestGameOrientation(mode,doc=document,screenObject=window.screen){
 if(!['auto','portrait','landscape'].includes(mode))return false;
 const orientation=screenObject?.orientation;
 try{
  if(mode==='auto'){orientation?.unlock?.();return true;}
  if(typeof orientation?.lock!=='function')return false;
  await enterGameFullscreen(doc,{native:true});
  await orientation.lock(mode);
  return true;
 }catch{return false;}
}
