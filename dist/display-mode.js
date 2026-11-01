// Must be called synchronously from Play: requesting after assets load loses user activation.
export async function enterGameFullscreen(doc=document){
 doc.body.classList.add('full-window');
 if(doc.fullscreenElement||doc.webkitFullscreenElement)return true;
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
