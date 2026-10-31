// One gesture owns a charged action. Keyboard events on a focused button must
// not also reach the global game shortcuts or generate a second native click.
export function bindChargeControl(button,{start,release,cancel,activate}){
 let pointer=null,key=null;
 const activationKey=event=>event.key===' '||event.key==='Enter';
 const reset=()=>{const pending=pointer!==null||key!==null;pointer=null;key=null;if(pending)cancel();};
 button.addEventListener('pointerdown',event=>{
  if(button.disabled||pointer!==null||key!==null||event.button!==0)return;
  event.preventDefault();pointer=event.pointerId;
  button.setPointerCapture(pointer);start();
 });
 button.addEventListener('pointerup',event=>{
  if(event.pointerId!==pointer)return;
  pointer=null;if(button.disabled)cancel();else release();
 });
 for(const type of ['pointercancel','lostpointercapture'])button.addEventListener(type,event=>{
  if(event.pointerId===pointer)reset();
 });
 button.addEventListener('keydown',event=>{
  if(!activationKey(event))return;
  event.preventDefault();event.stopPropagation();
  if(button.disabled||event.repeat||pointer!==null||key!==null)return;
  key=event.key;start();
 });
 button.addEventListener('keyup',event=>{
  if(!activationKey(event))return;
  event.preventDefault();event.stopPropagation();
  if(key!==event.key)return;
  key=null;if(button.disabled)cancel();else release();
 });
 button.addEventListener('blur',()=>{if(key!==null)reset();});
 button.addEventListener('click',event=>{if(!button.disabled&&pointer===null&&key===null&&event.detail===0)activate();});
 return {cancel:reset};
}

// Timed actions fire on contact, not after the finger lifts. Native click is
// still supported for keyboard and assistive-technology activation.
export function bindTapControl(button,activate){
 let pointer=null;
 button.addEventListener('pointerdown',event=>{
  if(button.disabled||pointer!==null||event.button!==0)return;
  event.preventDefault();pointer=event.pointerId;button.setPointerCapture(pointer);activate();
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,event=>{if(pointer===event.pointerId)pointer=null;});
 button.addEventListener('click',event=>{if(!button.disabled&&event.detail===0&&pointer===null)activate();});
 return {cancel(){pointer=null;}};
}

export function bindJoystick(element,{move,reset}){
 let pointer=null;
 const cancel=()=>{pointer=null;reset();};
 element.addEventListener('pointerdown',event=>{
  if(event.button!==0||pointer!==null||event.target.closest?.('button'))return;
  event.preventDefault();pointer=event.pointerId;element.setPointerCapture(pointer);move(event);
 });
 element.addEventListener('pointermove',event=>{if(pointer===event.pointerId)move(event);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,event=>{if(pointer===event.pointerId)cancel();});
 return {cancel};
}
