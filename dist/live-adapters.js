import {THREE,distance} from './world.js';
import {slideMove} from './venues.js';
const clamp=THREE.MathUtils.clamp,neutral={x:0,z:0,sprint:false};
const button=(id,label,key='Space',charge=false)=>({id,label,key,charge});
export function liveAdapter(m,room){
 const id=room.game,n=room.players.length;let people=[],scores=Array(n).fill(0),customUpdate=null,customAction=null;
 const original={update:m.update.bind(m),action:m.action.bind(m),hit:m.hit.bind(m),finish:m.finish.bind(m)};
 m.networked=true;m.online=true;m.baseActions=[...m.actions];m.settings.opponent='local';m.liveInputs=Array.from({length:n},()=>({...neutral}));
 const inputFor=i=>{const v=m.liveInputs[i]||neutral;return{...v,target:null,vector:()=>({x:v.x,z:v.z})};};
 const truncate=(array,count)=>{array.slice(count).forEach(p=>p.visible=false);return array.slice(0,count);};
 const take=(array,count=n)=>{const p=truncate(array,count);while(p.length<count)p.push(m.player((p.length-count/2)*1.2,7,0x458477));return p;};
 if(id==='football'){m.selected=0;for(let i=0;i<m.teamSize;i++)people.push(m.teams[0][i],m.teams[1][i]);people.push(...m.keepers);}
 else if(['abedemu','fourcorners','onepole','laski','sulia','stay','pampanaa','shooting'].includes(id))people=id==='laski'?[...m.players.slice(0,n-1),m.keeper]:take(m.players);
 else if(id==='penalties')people=[m.shooter,m.keeper];
 else if(id==='chaskele')people=[m.you,m.thrower];
 else if(id==='pilolo')people=take([m.you,...m.seekers]);
 else if(id==='antoakyire')people=take([m.runner,...m.seated]);
 else if(['sansankroma','police'].includes(id))people=[m.you,m.hawk];
 else if(['pempenaa','mbobagor'].includes(id))people=take(m.people);
 else if(id==='kyekyekule')people=[m.you,m.leader];
 else if(id==='chempe')people=[m.you,m.other];
 else if(id==='rubberband')people=[m.you,m.rival];
 else if(id==='alasa')people=[m.you,m.other];
 else people=room.type==='turns'?[m.you||m.actors[0]]:take(m.actors);
 m.livePeople=people;
 const liveSet=new Set(people);for(const p of m.actors){p.userData.networkControlled=room.type!=='turns';if(!liveSet.has(p)&&!['police'].includes(id))p.visible=false;}
 if(id==='counters')people.forEach(p=>p.visible=false);
 if(id==='sulia'){m.players=people;m.points=Array(n).fill(0);m.target=1;}
 if(id==='stay'){m.players=people;m.labels.slice(n).forEach(o=>o.visible=false);m.labels=m.labels.slice(0,n);m.transfers=Array(n).fill(0);m.targetIndex=1;}
 if(id==='pampanaa'||id==='shooting'){m.players=people;m.alive=Array(n).fill(true);m.names=room.players.map(p=>p.name);m.sticks.slice(n).forEach(o=>o.visible=false);m.sticks=m.sticks.slice(0,n);m.eliminate=(victim,by)=>{if(!m.alive[victim])return false;m.alive[victim]=false;people[victim].visible=false;scores[by]++;m.note(room.players[by].name+' called '+room.players[victim].name+' out.');if(m.alive.filter(Boolean).length===1){const winner=m.alive.findIndex(Boolean);m.liveWinners=[winner];m.finish('LAST PLAYER STANDING',room.players[winner].name+' wins.');}return true;};}
 if(id==='laski'){m.active=m.players.map((_,i)=>i<n-1);m.players.forEach((p,i)=>p.visible=m.active[i]);}
 if(id==='pilolo'){m.seekers=people.slice(1);m.scores=Array(3).fill(0);}
 // No movement happens unless that seat sends input. Physical collisions are retained.
 function movement(dt){
  const moving=new Set(['abedemu','football','fourcorners','laski','sulia','stay','chaskele','pampanaa','shooting','pilolo','sansankroma','police']);if(!moving.has(id)||(id==='football'&&(m.pause>0||m.kickoff)))return;
  people.forEach((p,i)=>{if(!p.visible)return;const v=m.liveInputs[i]||neutral;let x=v.x,z=v.z;if(id==='football')({x,z}=m.pressingInput(p,{x,z}));if(id==='abedemu')({x,z}=m.pressInput(i,{x,z}));const len=Math.hypot(x,z)||1;if(len>1){x/=len;z/=len;}const speed=id==='abedemu'?(v.sprint?6.8:i===m.middleIndex&&m.age<p.userData.pressUntil?(m.age-p.userData.pressStarted<.55?6.2:5.5):5.1):v.sprint?6.5:4.5,old=p.position.clone();
   if(id==='abedemu'){m.moveRunner(p,{x:p.position.x+x*3,z:p.position.z+z*3},speed,dt);return;}
   if(id==='chaskele'&&i===0)z=0;
   if(id==='laski'&&i===n-1)z=0;
   const velocity=new THREE.Vector3(x*speed,0,z*speed);if(id==='fourcorners'&&m.age<(p.userData.burstUntil||0))velocity.copy(p.userData.velocity);
   if(m.solids)slideMove(p.position,velocity,dt,m.solids);else p.position.addScaledVector(velocity,dt);
   const bound=id==='football'?{x:m.halfX-.6,z:m.halfZ-.6}:id==='fourcorners'?{x:9.2,z:9.2}:id==='laski'?{x:11.5,z:14.5}:id==='chaskele'?{x:10,z:12}:m.solids?{x:17,z:16}:{x:10.5,z:9};
   p.position.x=clamp(p.position.x,-bound.x,bound.x);p.position.z=clamp(p.position.z,-bound.z,bound.z);
   if(id==='laski'&&i===n-1){p.position.z=-8.2;p.position.x=clamp(p.position.x,-2.6,2.6);}
   if(id==='chaskele'&&i===0)p.position.z=4;
   if((id==='pampanaa'||id==='shooting')&&Number.isFinite(v.heading))p.rotation.y=v.heading;else if(x||z)p.rotation.y=Math.atan2(x,z);p.userData.run=distance(old,p.position)/Math.max(dt*6,.001);p.userData.velocity?.copy(p.position).sub(old).divideScalar(dt||1);p.userData.stayVelocity?.copy(p.position).sub(old).divideScalar(dt||1);
  });
 }
 function target(i,exclude=i){const p=people[i],candidates=people.map((q,j)=>({j,q,d:distance(p,q)})).filter(o=>o.j!==exclude&&o.q.visible);return candidates.sort((a,b)=>a.d-b.d)[0]?.j;}
 function ballAction(i,a){const p=people[i],power=a.power??.4;
  if(id==='football'){
   if(m.pause>0)return;if(a.action==='dive'&&p.userData.keeper){m.keeperSave(p,a.z);return;}if(m.kickoff&&m.kickoff.taker!==p)return;if(m.possessor!==p){if(a.action==='shoot')m.tackle(p);else if(a.action==='pass')m.press(p);return;}if(!['shoot','pass','chip'].includes(a.action))return;
   const team=p.userData.team,direction=team? -1:1;
   if(a.action==='pass'){const mate=people.filter(q=>q!==p&&q.userData.team===team).sort((x,y)=>distance(p,x)-distance(p,y))[0];if(mate)m.kick(p,mate.position,12);}
   else{const aim={x:direction*(m.halfX+1),z:clamp((Math.abs(a.z)>.1?a.z:Math.sin(p.rotation.y+Math.PI/2))*(m.goalWidth*.45),-m.goalWidth*.45,m.goalWidth*.45)};m.kick(p,aim,14+power*16,true);m.velocity.y=a.action==='chip'?5:1+power*2.2;}
  }else if(id==='abedemu'){m.actionFor(i,a.action,power,a);
  }else if(id==='fourcorners'){
   if(m.phase!=='play')return;
   if(a.action==='target'){m.selectTarget(i);return;}
   if(a.action==='feint'){m.feint(i,{x:a.x||0,z:a.z||0});return;}
   if(!['kick','chip'].includes(a.action))return;
   if(m.carrier!==null&&m.carrier!==i){m.tackle(i);return;}
   const goal=m.active[p.userData.liveTarget]&&p.userData.liveTarget!==i?p.userData.liveTarget:m.pickGoal(i),g=m.goals[goal],steer=-g.normal.z*(a.x||0)+g.normal.x*(a.z||0);
   if(!m.kick(i,goal,power,a.action==='chip',steer))m.tackle(i);
  }
  else if(id==='laski'){
   if(i===n-1){if(m.phase==='serve'&&a.action==='throw')m.throwIn();else if(m.phase==='play'&&a.action==='dive'){m.dive=.6;m.keeper.userData.pose='keeperDive';}return;}
   if(m.phase==='choose'){if(i===m.lastScorer&&a.action.startsWith('out-'))m.eliminate(Number(a.action.slice(4)));return;}
   if(m.phase!=='play')return;if(m.possessor&&m.possessor!==p&&distance(p,m.possessor)<1.3){m.possessor=p;m.cool=.5;return;}if(distance(p,m.b)<1.2)m.strike(i,clamp(a.x*2.2,-2.2,2.2),power,a.action==='volley');
  }else if(id==='counters')people.forEach(p=>p.visible=false);
 if(id==='sulia'){
   if(m.phase!=='play')return;if(m.carrier===i){const j=target(i);if(j!==undefined)m.poke(i,j,power);}else if(m.carrier!==null&&distance(p,people[m.carrier])<1.3&&m.cool<=0){m.carrier=i;m.cool=.5;m.placeBall();}
  }else if(id==='stay'){
   if(i===m.throwerIndex){if(a.action==='ball'){if(m.phase==='held')m.launch();else if(m.phase==='rebound')m.catchWindow=.65;}else if(a.action==='play'){m.targetIndex=(m.targetIndex+1)%n;if(m.targetIndex===i)m.targetIndex=(i+1)%n;}}
   else if(a.action==='play')m.kickLoose(i);
  }
 }
 let turnScores=[...room.state.scores],beat=0,clock=0,passed=new Set(),runner=0,chaser=null,drop=null,seatAngles=people.map((_,i)=>i*Math.PI*2/n),round=0;
 if(id==='antoakyire'){
  m.actors.forEach(p=>p.userData.pose='knees');people.forEach((p,i)=>p.position.set(Math.sin(seatAngles[i])*4,0,Math.cos(seatAngles[i])*4));let angle=0,chaseAngle=0,dropAt=0;
  customAction=(i,a)=>{if(a.action!=='chase')return;if(i===runner&&drop===null){const possible=people.map((p,j)=>j).filter(j=>j!==runner),j=possible.sort((a,b)=>distance(people[a],people[runner])-distance(people[b],people[runner]))[0];if(distance(people[j],people[runner])>1.6)return;drop=j;dropAt=angle;chaseAngle=angle;clock=0;m.note('Cloth behind '+room.players[j].name+'. Pick it up and chase!');}else if(i===drop&&chaser===null){chaser=i;m.note('Race for the empty place!');}};
  customUpdate=dt=>{const running=m.liveInputs[runner]?.sprint||Math.hypot(m.liveInputs[runner]?.x||0,m.liveInputs[runner]?.z||0)>.1;if(running)angle+=dt*(m.liveInputs[runner].sprint?1.65:1.1);const p=people[runner];p.position.set(Math.sin(angle)*4.8,0,Math.cos(angle)*4.8);p.rotation.y=angle+Math.PI/2;p.userData.pose='idle';p.userData.run=running?1:0;
   if(chaser!==null){const go=m.liveInputs[chaser]?.sprint||Math.hypot(m.liveInputs[chaser]?.x||0,m.liveInputs[chaser]?.z||0)>.1;if(go)chaseAngle+=dt*(m.liveInputs[chaser].sprint?1.75:1.2);const q=people[chaser];q.position.set(Math.sin(chaseAngle)*4.8,0,Math.cos(chaseAngle)*4.8);q.rotation.y=chaseAngle+Math.PI/2;q.userData.run=go?1:0;q.userData.pose='idle';}
   if(drop!==null){clock+=dt;const caught=chaser!==null&&clock>.4&&chaseAngle>=angle-.14,home=angle-dropAt>=Math.PI*2;if(caught||home){scores[caught?chaser:runner]++;const old=runner;runner=caught?runner:drop;people[old].position.set(Math.sin(dropAt)*4,0,Math.cos(dropAt)*4);people[old].userData.pose='knees';angle=dropAt;drop=null;chaser=null;round++;if(round>=5)m.finish('CIRCLE COMPLETE','Five human chases complete.');}}
   const q=drop===null?people[runner]:chaser===null?people[drop]:people[chaser];m.cloth.position.set(q.position.x,drop!==null&&chaser===null?.04:1,q.position.z);m.status(room.players[runner].name+' CARRIES THE CLOTH',drop===null?'Move around the circle · drop behind a friend':'Pick up, then hold Run to chase');};
 }
 if(id==='chempe'){
  m.cpuAt=Infinity;customAction=(i,a)=>{if(m.phase!=='reveal')return;const holder=m.round%2,correct=i===holder?a.action==='no':a.action==='claim';if(!correct)return;scores[i]++;m.resolve(i===0,room.players[i].name+' called first.');};customUpdate=dt=>{m.cpuAt=Infinity;original.update(dt);};
 }
 if(id==='kyekyekule'){
  let leader=0,chosen=null,phase='lead',until=0;m.poses=['head','hips','knees'];customAction=(i,a)=>{if(!m.poses.includes(a.action))return;if(phase==='lead'&&i===leader){chosen=a.action;people[i].userData.pose=chosen;phase='watch';until=m.age+1.2;}else if(phase==='copy'&&i!==leader){people[i].userData.pose=a.action;if(a.action===chosen)scores[i]++;else scores[leader]++;round++;phase='rest';until=m.age+1.1;}};customUpdate=()=>{if(phase==='watch'&&m.age>=until){phase='copy';until=m.age+5;}if(phase==='copy'&&m.age>=until){scores[leader]++;phase='rest';until=m.age+1;round++;}if(phase==='rest'&&m.age>=until){if(round>=8)return m.finish('COPY ROUND COMPLETE','Eight human-led poses.');leader=1-leader;phase='lead';people.forEach(p=>p.userData.pose='idle');}m.status(room.players[leader].name+' LEADS',phase==='lead'?'Leader chooses a pose':phase==='watch'?'Watch your friend':phase==='copy'?'Copy the pose':'Next leader');};
 }
 if(id==='pempenaa'){
  m.people=people;m.legs=Array(n*2).fill(true);m.leader.visible=false;customAction=(i,a)=>{if(m.phase==='selected'&&Math.floor(m.selected/2)===i&&['left','right'].includes(a.action)&&(a.action==='right'?1:0)===m.selected%2){m.legs[m.selected]=false;const both=!m.legs[i*2]&&!m.legs[i*2+1];people[i].userData.pose=both?'knees':a.action==='left'?'fold-left':'fold-right';scores[i]++;if(both){m.liveWinners=[i];m.finish('BOTH LEGS WITHDRAWN',room.players[i].name+' finished first.');}m.phase='count';m.time=0;m.ticks=0;}};customUpdate=()=>{if(m.phase==='count'&&m.time>.36){m.time=0;const legs=m.activeLegs();m.index=(m.index+1)%legs.length;m.selected=legs[m.index];m.pointer.position.set(people[Math.floor(m.selected/2)].position.x+(m.selected%2?.16:-.16),.08,.8);m.ticks++;m.ui.sound('stone');if(m.ticks>=m.phrase){m.phase='selected';m.time=0;}}m.status('FOLLOW THE COUNT',m.phase==='selected'?room.players[Math.floor(m.selected/2)].name+': fold '+(m.selected%2?'right':'left'):'One phrase, one selected leg');};
 }
 if(id==='mbobagor'){
  m.people=people;m.stones.slice(n).flat().forEach(o=>o.visible=false);m.stones=m.stones.slice(0,n);m.piles=Array(n).fill(1);customAction=(i,a)=>{if(a.action==='pass'&&(clock<.32||clock>1.22)&&!passed.has(i)){passed.add(i);people[i].userData.pose='reach';}};customUpdate=dt=>{clock+=dt;if(clock>=1.5){clock-=1.5;beat++;if(beat>1)people.forEach((p,i)=>{if(passed.has(i)){scores[i]++;m.piles[i]=Math.max(1,m.piles[i]-1);}else m.piles[i]++;p.userData.pose='knees';});passed.clear();m.ui.sound('clap');if(beat>=17)return m.finish('PASSING CIRCLE COMPLETE','Human passes on the shared beat.');}m.stones.forEach((pile,i)=>pile.forEach((stone,j)=>stone.visible=j<Math.min(3,m.piles[i])));m.status('PASS ON THE CLAP',`${Math.min(16,beat)} / 16 BEATS`);};
 }
 function controls(slot){if(room.type==='turns')return m.baseActions;
  if(id==='football'&&people[slot]?.userData.keeper)return[button('shoot','Throw / clear','Space',true),button('pass','Roll to teammate','E'),button('dive','Save','G')];
  if(id==='football')return[button('shoot','Shoot / tackle','Space',true),button('pass','Pass / press','E'),button('chip','Chip','R',true)];
  if(id==='fourcorners')return[button('kick','Shoot / tackle','Space',true),button('target','Next goal','E'),...(!m.oneTouch?[button('feint','Dodge','Q')]:[]),button('chip','Chip','R')];
  if(id==='laski'){if(slot===n-1)return[button('throw','Throw in'),button('dive','Dive','E')];if(m.phase==='choose')return m.active.flatMap((yes,i)=>yes&&i!==slot?[{...button('out-'+i,'Out: '+room.players[i]?.name,String(i+1)),disabled:slot!==m.lastScorer}]:[]);return[button('shoot','Shoot / tackle','Space',true),button('volley','Volley','E')];}
  if(id==='abedemu')return slot===m.middleIndex?[button('pass','Tackle'),button('press','Press','Q')]:[button('pass','Pass','Space',true),button('target','Next player','E'),button('press','Call for ball','Q'),button('lob','Lob pass','R')];
  if(id==='sulia')return[button('nutmeg','Nutmeg / tackle','Space',true)];
  if(id==='stay')return[button('ball',slot===m.throwerIndex?(m.phase==='held'?'Throw':'Catch'):'Dodge'),button('play',slot===m.throwerIndex?'Next target':'Kick loose ball','E')];
  if(id==='penalties')return slot===m.turn?[button('shoot','Shoot','Space',true)]:[button('left','Dive left','Q'),button('center','Centre'),button('right','Dive right','E')];
  if(id==='onepole')return[{...button('shoot','Strike pole','Space',true),disabled:slot!==m.turn}];
  if(id==='chaskele')return slot===0?[button('swing','Swing')]:[button('throw','Throw can','Space',true)];
  if(id==='rubberband')return[{...button('release','Pull / release','Space',true),disabled:slot!==m.turn}];
  if(id==='alasa')return[{...button('flick','Flick seed','Space',true),disabled:slot!==m.turn}];
  if(id==='counters')return m.baseActions.map(a=>({...a,disabled:slot!==m.turn}));
  if(id==='pampanaa'||id==='shooting')return[button('shoot','Pɛw! Shoot')];
  if(id==='pilolo')return[button('search','Search / collect')];
  if(id==='antoakyire')return[button('chase','Drop / pick cloth'),{id:'sprint',label:'Run',key:'Shift',hold:true}];
  if(['sansankroma','police'].includes(id))return[button('interact',slot===0?'Pick / use':'Tag runner')];
  return m.baseActions;
 }
 const neutralInput={target:null,sprint:false,vector:()=>({x:0,z:0})};
 return {people,controls,
 scores(){if(id==='football')return people.map(p=>m.scores[p.userData.team]);if(['penalties','onepole','counters','alasa','rubberband','pilolo'].includes(id))return m.scores.slice(0,n);if(id==='fourcorners')return m.active.map((alive,i)=>alive?10+m.lives[i]:0);if(id==='laski')return people.map((_,i)=>i===n-1?0:m.active[i]?3:0);if(id==='sulia'||id==='abedemu')return m.points;if(id==='stay')return m.transfers.slice(0,n);if(id==='chaskele')return[m.score,m.conceded];if(room.type==='turns'){turnScores[room.state.seat]=Math.max(0,m.score||0);return turnScores;}return scores;},
 action(i,a){if(!people[i]&&room.type!=='turns')return;const p=people[i];if(p&&!p.visible&&['fourcorners','laski','sulia','stay','pampanaa','shooting'].includes(id))return;if(room.type==='turns'){if(i!==room.state.seat)return;m.input=inputFor(i);m.charge=m.age-(a.power??.4);if(a.point)original.hit({point:new THREE.Vector3(a.point.x,a.point.y,a.point.z),id:a.pick});if(a.action)original.action(a.action);return;}
  if(customAction){customAction(i,a);return;}if(['abedemu','football','fourcorners','laski','sulia','stay'].includes(id)){if(a.action)ballAction(i,a);return;}
  if(id==='pampanaa'||id==='shooting'){if(a.action!=='shoot'||m.phase!=='play'||!m.alive[i]||m.age<(p.userData.liveCool||0))return;p.userData.liveCool=m.age+.8;const j=people.findIndex((_,j)=>m.canSee(i,j,13,.85));m.call(i);if(j>=0)m.eliminate(j,i);return;}
  if(id==='pilolo'){if(a.action!=='search')return;if(m.phase!=='search')return;if(p.userData.liveCarry){if(distance(p,m.home)<1.5){p.userData.liveCarry=null;m.endRound(i);}return;}const q=m.places.find(q=>!q.opened&&distance(p,q)<1.5);if(q){m.open(q);if(q.has){q.has=false;p.userData.liveCarry=q.stick;q.stick.visible=true;}}return;}
  if(id==='penalties'){if(i===m.turn&&a.point&&m.phase==='aim'){m.aimX=clamp(a.point.x,-3.3,3.3);m.aimY=clamp(a.point.y,.15,3.1);}if(i===m.turn&&a.action==='shoot'&&m.phase==='aim')m.launch(m.aimX,m.aimY,a.power??.5);else if(i!==m.turn&&['left','center','right'].includes(a.action)){m.dive=a.action==='left'?-1:a.action==='right'?1:2;m.diveActive=true;m.diveAge=0;}return;}
  if(id==='onepole'){if(i===m.turn&&a.point&&m.phase==='aim')m.aim=clamp(Math.atan2(a.point.x-m.stance,Math.abs((m.turn?-8:8)-a.point.z)),-.3,.3);if(i===m.turn&&a.action==='shoot'&&m.phase==='aim')m.launch(m.aimed??m.aim,a.power??.5);return;}
  if(id==='chaskele'){if(i===0&&a.action==='swing')original.action();else if(m.phase==='ready'&&a.action==='throw'){m.serve();const duration=clamp(distance(m.thrower,{x:0,z:6})/(9+(a.power??.5)*5),.65,1.55);m.v.set((a.x*.8-m.b.position.x)/duration,(.13-m.b.position.y+4*duration*duration)/duration,(6-m.b.position.z)/duration);}return;}
  if(['rubberband','alasa','counters'].includes(id)){if(i!==m.turn)return;m.charge=m.age-(a.power??.4);if(a.point){if(id==='counters')original.hit({id:a.pick===undefined?null:{p:i,i:a.pick},point:new THREE.Vector3(a.point.x,a.point.y,a.point.z)});else if(id==='alasa')m.aim=clamp(Math.atan2(a.point.x,2.2-a.point.z),-.5,.5);else if(id==='rubberband'){m.aimX=clamp(a.point.x,-1.2,1.2);m.aimY=clamp(a.point.y,.4,2);}}
   if(a.action){if(id==='rubberband')m.release(m.aimX,m.aimY,a.power??.6);else if(id==='alasa')m.flick(a.power??.55,m.aim);else original.action(a.action);}return;}
  if(i===0&&a.action){m.input=inputFor(i);original.action(a.action);}
 },
 update(dt,t){if(room.type==='turns'){m.input=inputFor(room.state.seat);original.update(dt,t);if(m.age>=90&&!m.done)m.finish('TURN COMPLETE','Time for the next human player.');return;}movement(dt);const runs=people.map(p=>p.userData.run);m.input=['penalties','onepole','rubberband','alasa','counters'].includes(id)?inputFor(m.turn):neutralInput;
  if(id==='laski')m.dive=Math.max(0,(m.dive||0)-dt);if(customUpdate)customUpdate(dt,t);else original.update(dt,t);if(id==='laski'&&m.dive>0){m.keeper.userData.pose='keeperDive';m.keeper.userData.lean=-.8;}
  people.forEach((p,i)=>{if(!customUpdate)p.userData.run=runs[i];if(id==='pilolo'&&p.userData.liveCarry){const c=p.userData.liveCarry;c.position.set(p.position.x-c.parent.position.x,.95,p.position.z-c.parent.position.z);if(m.phase==='search'&&distance(p,m.home)<1.3){p.userData.liveCarry=null;m.endRound(i);}}});

  if(['sansankroma','police'].includes(id)){scores[0]=m.score;scores[1]=3-m.lives;}
  if(m.age>180&&!m.done)m.finish('ROOM ROUND COMPLETE','Three-minute human round complete.');
 },original};
}
