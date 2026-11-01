// Shared by local players, CPUs and friend rooms. Distance affects the strike,
// never the goal-line decision: a ball that crosses the goal still counts.
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function finishingRange(width){return width>=4?7:4.8;}
export function defensivePressure(player,opponents){
 return opponents.reduce((pressure,p)=>Math.max(pressure,clamp((2-Math.hypot(player.position.x-p.position.x,player.position.z-p.position.z))/1.4,0,1)),0);
}
export function finishAttempt({origin,target,goal,speed,closeRange=finishingRange(goal.width),pressure=0,pace=0,random=Math.random}){
 const range=Math.hypot(origin.x-goal.center.x,origin.z-goal.center.z);
 const excess=Math.max(0,(range-closeRange)/closeRange),rush=clamp((pace-5.5)/3,0,1);
 // Close, unpressured placement stays precise. Long strikes need space and a
 // settled touch; neither auto-aim nor full power guarantees a corner finish.
 const spread=Math.min(goal.width*2.6*Math.pow(excess,1.35)*(1+pressure*.35+rush*.3)+pressure*.3,range*(.6+pressure*.08+rush*.05));
 const error=spread?(random()*2-1)*spread:0;
 return {target:{x:target.x-goal.normal.z*error,z:target.z+goal.normal.x*error},speed:speed*clamp(1/(1+excess*.38+pressure*.06),.55,1),range};
}
