const shapes={
 balanced:[[1],[1,1],[2,1],[1,2,1],[2,2,1],[2,2,2],[2,3,2]],
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
// Shape provides recovery positions; it does not restrict who can run or tackle.
export function planTeam({players,opponents,ball,carrier,receiver,controlled,halfX,halfZ,previous=null,now=0,ballVelocity={x:0,z:0}}){
 const team=players[0].userData.team,direction=team===0?1:-1,own=carrier?.userData.team===team,targets=new Map();let presser=null,since=now;
 if(!own){
  const rank=players.slice().sort((a,b)=>dist(a.position,ball)-dist(b.position,ball));presser=rank[0];
  if(!carrier&&receiver&&players.includes(receiver))presser=receiver;
  else if(previous?.presser&&players.includes(previous.presser)&&(now-previous.since<.4||dist(previous.presser.position,ball)<dist(presser.position,ball)+1))presser=previous.presser;
  if(!(receiver&&players.includes(receiver))&&controlled&&players.includes(controlled)&&dist(controlled.position,ball)<dist(presser.position,ball)+1.2)presser=controlled;
  if(presser===previous?.presser)since=previous.since;
 }
 let runner=previous?.runner,runUntil=previous?.runUntil||0;
 if(previous?.carrier&&players.includes(previous.carrier)&&previous.carrier!==carrier&&(!carrier||own)){runner=previous.carrier;runUntil=now+2.5;}
 if(now>runUntil||carrier&&!own)runner=null;
 const threats=opponents.filter(p=>p!==carrier).sort((a,b)=>direction*(a.position.x-b.position.x));let cover=0;
 const guard=players.filter(p=>p!==carrier&&p!==runner).sort((a,b)=>a.userData.slot.x-b.userData.slot.x)[0];
 const helper=!own&&carrier?players.filter(p=>p!==presser&&p!==controlled&&dist(p.position,ball)<2.2).sort((a,b)=>dist(a.position,ball)-dist(b.position,ball))[0]:null;
 for(const [index,p]of players.entries()){
  if(p===presser||p===helper){
   const velocity=carrier?.userData.velocity||ballVelocity;
   targets.set(p,{x:clamp(ball.x+(velocity.x||0)*.22,-halfX+.7,halfX-.7),z:clamp(ball.z+(velocity.z||0)*.22,-halfZ+.7,halfZ-.7),duty:p===helper?'Challenge':carrier?'Press':'Collect'});continue;
  }
  const slot=p.userData.slot,bx=ball.x*direction;
  let x=slot.x*halfX*.8+clamp(bx*.25,-halfX*.3,halfX*.3),z=slot.z*halfZ+clamp(ball.z*.2,-1.8,1.8),duty='Cover';
  if(own){
   // Attacking runs respond to ball progress, with one player screening a counter.
   if(p===guard)x=Math.min(bx-6,-halfX*.15);
   else if(slot.role==='Defender')x=bx-3.8;
   else if(slot.role==='Forward')x=Math.max(slot.x*halfX,bx+3.8);
   else x=bx+(index%2?2.4:-2.8);
   z=slot.z*halfZ*.8+ball.z*.25+Math.sin(now*.85+index*1.7)*1.1;
   if(slot.z===0)z+=(index%2?1:-1)*2.5;
   // Give-and-go: the player who just released a pass continues upfield.
   if(runner===p)x=Math.max(x,bx+2.8);
   duty='Support';
  }else if(carrier){
   const mark=threats[cover++%Math.max(1,threats.length)];
   if(mark){x=x*.35+(mark.position.x*direction-1.5)*.65;z=z*.3+mark.position.z*.7;}
   if(slot.role==='Defender')x=Math.min(x,bx-2.2);
  }
  const target={x:clamp(x,-halfX+1.5,halfX-2)*direction,z:clamp(z,-halfZ+1,halfZ-1),duty};
  if(dist(target,ball)<2.5)target.z=clamp(target.z+(slot.z>=0?2.8:-2.8),-halfZ+1,halfZ-1);
  targets.set(p,target);
 }
 return {presser,since,targets,carrier,runner,runUntil};
}
