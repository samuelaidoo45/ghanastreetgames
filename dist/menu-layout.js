// Page capacity follows usable CSS pixels, including browser zoom and window resize.
export function menuLayout(width,height){
 const viewport=width>=1000&&height>=500;
 const columns=viewport?(width>=2100&&height>=950?5:width>=1450&&height>=760?4:3):(width>520?2:1);
 return {viewport,columns,pageSize:viewport?columns*2:6};
}
export function remapPage(page,oldSize,newSize,total){return Math.max(0,Math.min(Math.floor(page*oldSize/newSize),Math.max(0,Math.ceil(total/newSize)-1)));}
