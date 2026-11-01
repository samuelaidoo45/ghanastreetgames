// Must be called synchronously from Play: requesting after assets load loses user activation.
export async function enterGameFullscreen(doc=document){
 doc.body.classList.add('full-window');
 if(doc.fullscreenElement||doc.webkitFullscreenElement)return true;
 const root=doc.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;
 if(!request)return false;
 try{await request.call(root);return true;}catch{return false;}
}
