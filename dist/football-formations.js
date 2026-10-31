const shapes={
 balanced:[[1],[1,1],[1,1,1],[1,2,1],[2,2,1],[2,2,2],[2,3,2]],
 defensive:[[1],[1,1],[2,1],[2,1,1],[3,1,1],[3,2,1],[3,3,1]],
 attacking:[[1],[1,1],[1,2],[1,1,2],[1,2,2],[2,1,3],[2,2,3]]
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function formationFor(count,style='balanced'){
 const n=clamp(Math.round(Number(count)||3),1,7),key=shapes[style]?style:'balanced',lines=shapes[key][n-1],slots=[];
 lines.forEach((number,row)=>{for(let i=0;i<number;i++)slots.push({role:lines.length===1?'All-rounder':row===0?'Defender':row===lines.length-1?'Forward':'Midfielder',x:lines.length===1?0:-.58+row/(lines.length-1)*1.05,z:number===1?0:(i/(number-1)*2-1)*.65,row});});
 return {style:key,label:n===1?'Solo':lines.join('–'),slots};
}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// One designated presser/receiver. Other players retain their own lane and line.
export function planTeam({players,opponents,ball,carrier,receiver,controlled,halfX,halfZ,previous=null,now=0}){
 const team=players[0].userData.team,direction=team===0?1:-1,own=carrier?.userData.team===team,targets=new Map();let presser=null,since=now;
 if(!own){
  const rank=players.slice().sort((a,b)=>dist(a.position,ball)-dist(b.position,ball));presser=rank[0];
  if(!carrier&&receiver&&players.includes(receiver))presser=receiver;
  else if(previous?.presser&&players.includes(previous.presser)&& (now-previous.since<.65||dist(previous.presser.position,ball)<dist(presser.position,ball)+2))presser=previous.presser;
  if(!(receiver&&players.includes(receiver))&&controlled&&players.includes(controlled)&&dist(controlled.position,ball)<dist(presser.position,ball)+1.2)presser=controlled;
  if(presser===previous?.presser)since=previous.since;
 }
 const threats=opponents.filter(p=>p!==carrier).sort((a,b)=>direction*(a.position.x-b.position.x));let cover=0;
 for(const p of players){
  if(p===presser){targets.set(p,{x:clamp(ball.x,-halfX+.7,halfX-.7),z:clamp(ball.z,-halfZ+.7,halfZ-.7),duty:carrier?'Press':'Collect'});continue;}
  const slot=p.userData.slot,bx=ball.x*direction;
  let x=slot.x*halfX+(own?halfX*.18:-halfX*.13)+clamp(bx*.2,-halfX*.16,halfX*.16);
  let z=slot.z*halfZ+clamp(ball.z*.16,-1.4,1.4);
  if(!own&&carrier){const mark=threats[cover++%Math.max(1,threats.length)];if(mark){x=x*.8+(mark.position.x*direction-1.4)*.2;z=z*.8+mark.position.z*.2;}if(slot.role==='Defender')x=Math.min(x,bx-2);}
  // Teammates provide a passing triangle instead of standing on the carrier.
  x=clamp(x,-halfX+1.5,halfX-2);
  const target={x:x*direction,z:clamp(z,-halfZ+1,halfZ-1),duty:own?'Support':'Cover'};
  if(dist(target,ball)<2.5){target.z=clamp(target.z+(slot.z>=0?2.8:-2.8),-halfZ+1,halfZ-1);}
  targets.set(p,target);
 }
 return {presser,since,targets};
}
