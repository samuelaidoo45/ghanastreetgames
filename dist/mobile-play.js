// Phone controls are explicit for every game: an aiming stick must never sprint.
const movement=new Set(['abedemu','football','fourcorners','laski','pampanaa','shooting','pilolo','stay','sulia','sansankroma','tyre','zanzama','pretend','police']);
const aiming=new Set(['penalties','onepole','rubberband','chaskele','kpitinge','alasa']);
const sprinting=new Set([...movement].filter(id=>id!=='zanzama'));
export const touchHints={
 abedemu:'Pass around the middle player. Tap Pass or hold for power; Target chooses a teammate. In the middle, tap Tackle or Press. An interception swaps the last toucher into the middle.',
 football:'Keeper save is beside Shoot in big-poles matches. Without the ball, Pass becomes Press. Move with the stick; push to its edge to sprint. Hold Shoot, then release. More has Low shot, Chip and Switch when Save is visible.',
 fourcorners:'Move to collect the ball. Tap Shoot for a quick strike, or hold for power. Without the ball it tackles. Target changes goal; Dodge slips past a challenge. Chip is in More.',
 penalties:'Tap Lock aim, then Set power. In free-aim mode, tap the goal or use AIM, then hold and release Shoot. In goal, tap a dive button.',
 onepole:'Use AIM or tap the target to aim. Step left/right changes your position. Hold Strike for power, then release.',
 laski:'Chase the keeper’s throw with MOVE. Push to the edge to sprint. Hold Shoot, release to strike; Volley meets an airborne ball. In goal, move and use Dive.',
 pampanaa:'Move with one thumb and drag the scene with the other to look. Face a visible rival and tap Pɛw! Walls block shots.',
 shooting:'Move with one thumb and drag the scene with the other to look. Face a visible rival and tap Pɛw! Walls block shots.',
 rubberband:'Tap the wall or use AIM. Hold Pull to stretch the band, then release. Adjust for where the last band landed.',
 ampe:'Watch the jump and tap the foot you choose. Matching feet score for you.',
 oware:'Tap a house on your side, or its numbered button, to sow. Pass the phone on local two-player turns.',
 pilolo:'Use MOVE or tap the ground to walk through the alleys. Tap Search near hiding places. Find a stick, then sprint HOME with the stick at its edge.',
 chaskele:'Slide AIM sideways to line up with the can. Tap Swing just as it reaches your stick. Protect the tyre.',
 stay:'Move freely. Tap a player or Next target to aim; Throw launches the ball. Run under the rebound and tap Catch before it lands. Chase missed balls.',
 alikoto:'Hold Palm strike to build force, then release. Set strength changes the preset. Land the spinner upright.',
 tumatu:'Tap the next square to aim. Hold Hop until the landing ring is green, then release. On the return, tap Pick marker at square 5.',
 counters:'Tap your bottle cap, then tap where to aim. Hold Flick for power and release. Next cap selects another cap; wait for the pieces to settle.',
 antoakyire:'Watch behind your seated player. Tap Pick up / chase when the cloth drops, then hold Sprint to catch the runner. If you carry the cloth, tap Drop cloth behind a player.',
 sulia:'Move into space and win the ball. Next player selects a target. Hold Nutmeg, then release; Shield protects the ball. Push MOVE to the edge to sprint.',
 sansankroma:'Use MOVE to run between the marked refuges. Push the stick to the edge to sprint away from the hawk.',
 ludo:'Tap Roll, then tap a highlighted token or its button. A six brings a token out. Pass the phone on local two-player turns.',
 tyre:'Guide the tyre through each gate with MOVE. Push gives a burst; moving the stick to the edge sprints.',
 kpitinge:'Slide AIM sideways, then hold and release Throw. Watch the flight and adjust the force to plant the peg upright.',
 zanzama:'Tap Say Zanzama, move to the highlighted stool, then tap Sit.',
 pretend:'Move to a basket, water or meal and tap Pick / use. Carry it to the matching station. Take your time.',
 numbers:'Watch the choices and tap a prime number before time runs out.',
 police:'Move to a friend and tap Pick / use. Lead them to the yellow refuge. Push MOVE to the edge to sprint past the guard.',
 skipping:'Tap Jump as the rope approaches your feet. Each press starts one jump.',
 dame:'Tap a piece, then a highlighted destination. You can also use Piece arrows and Select / move. Complete every required capture.',
 alasa:'Tap the ground or use AIM. Hold Flick to choose force, then release toward the hole. Set strength changes the preset.',
 chempe:'Watch who holds the food, then tap your call before your rival. The roles alternate.',
 kyekyekule:'Watch the leader. When it is your turn, tap Head, Hips or Knees to copy the pose.',
 pempenaa:'Watch the count reach your legs. Tap Left or Right when your leg is selected.',
 mbobagor:'Tap Pass on the clap as the stone reaches you. Keep the shared rhythm.'
};
export function mobileProfile(id){return {stick:movement.has(id)?'move':aiming.has(id)?'aim':'none',autoSprint:sprinting.has(id),hint:touchHints[id]||'Tap the labelled actions to play.'};}
export function arrangeActions(id,actions,autoSprint=true){
 const visible=actions.filter(a=>!(autoSprint&&mobileProfile(id).autoSprint&&a.hold&&a.id==='sprint'));
 if(id==='football'||id==='fourcorners'){const extra=id==='football'?['low','chip','sprint']:['chip','sprint'];const preferred=id==='football'&&visible.some(a=>a.id==='save')?['shoot','pass','save']:null;const primary=preferred?preferred.map(id=>visible.find(a=>a.id===id)).filter(Boolean):visible.filter(a=>!extra.includes(a.id)).slice(0,3);return {primary,secondary:visible.filter(a=>!primary.includes(a))};}
 // Movement games keep the three most useful actions in reach. Choices and
 // timed rhythm actions stay visible together, never buried in a menu.
 if(mobileProfile(id).stick!=='none'&&visible.length>3)return {primary:visible.slice(0,3),secondary:visible.slice(3)};
 return {primary:visible,secondary:[]};
}
export function joystickVector(dx,dy,radius,deadzone=.12){
 const distance=Math.hypot(dx,dy),raw=Math.min(1,distance/Math.max(1,radius));
 const strength=Math.max(0,(raw-deadzone)/(1-deadzone));
 return {x:distance?dx/distance*strength:0,z:distance?dy/distance*strength:0,sprint:raw>=.92};
}
// Limit fill-rate on high-density and very large displays. Resolution can drop
// a little on slow phones without changing gameplay speed or input sampling.
export function renderPixelRatio(width,height,dpr,quality,scale=1){return Math.min(dpr,quality==='high'?1.5:1,Math.sqrt((quality==='high'?4000000:900000)/Math.max(1,width*height)))*scale;}
export class RenderBudget{
 constructor(){this.reset();}
 reset(){this.samples=0;this.total=0;this.slow=0;}
 sample(workMs,intervalMs,scale){this.samples++;this.total+=workMs;if(intervalMs>55)this.slow++;if(this.samples<90)return scale;const lower=this.total/this.samples>26||this.slow>35;this.reset();return lower?Math.max(.7,Math.round((scale-.1)*10)/10):scale;}
}

export function mobileMessage(text,actions,id,autoSprint=true){
 const labels=new Map(actions.map(a=>[a.key,a.label]));
 labels.set('C','View');
 if(autoSprint&&mobileProfile(id).autoSprint)labels.set('Shift','MOVE edge');
 const stick=mobileProfile(id).stick==='aim'?'AIM':'MOVE';
 return text.replace(/WASD\s*\/\s*(?:arrows|joystick)|arrows\s*\/\s*WASD|WASD|arrow keys/g,stick)
  .replace(/\b(?:Space|Shift|Q|E|R|F|G|C)\b/g,key=>labels.has(key)?'“'+labels.get(key)+'”':key);
}
