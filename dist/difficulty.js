// Gameplay tuning only: no score bonuses, forced wins or altered dice.
export const levels = {
 easy: Object.freeze({speed:.82,window:1.35,error:1.8,bar:-.1}),
 normal: Object.freeze({speed:1,window:1,error:1,bar:0}),
 hard: Object.freeze({speed:1.15,window:.78,error:.5,bar:.1}),
};
export const difficultyEffects = {
 football:'Opponent pace and goalkeeper reactions', abedemu:'Pressing pace, support runs and passing accuracy', fourcorners:'Opponent movement and pressure', penalties:'Keeper reactions and anticipation',
 onepole:'Opponent shot accuracy', laski:'Opponent pace and keeper response', pampanaa:'Rival reaction time and patrol pace', shooting:'Rival reaction time and patrol pace',
 rubberband:'Opponent aim accuracy', ampe:'Opponent prediction of your previous foot choices', oware:'Computer move planning', dame:'Computer move planning', ludo:'Computer token strategy; dice stay fair',
 pilolo:'Rival search and running speed', chaskele:'Can speed and hitting window', stay:'Runner pace and catch timing', sulia:'Rival pace and nutmeg accuracy',
 alikoto:'Upright landing tolerance', tumatu:'Landing precision inside each square', counters:'Computer flick accuracy', antoakyire:'Chaser reaction and pace',
 sansankroma:'Hawk pursuit speed', tyre:'Gate precision', kpitinge:'Upright landing tolerance', zanzama:'Seating precision', pretend:'Delivery precision', numbers:'Time to answer', police:'Pursuit speed',
 skipping:'Rope pace', alasa:'Opponent flick accuracy', chempe:'Time before the rival calls', kyekyekule:'Time to copy the pose', pempenaa:'Counting pace and time to fold', mbobagor:'Passing rhythm and timing window',
 highjump:'Bar height and take-off tolerance', agawowa:'Take-off and feet-first landing tolerance',
};
export function difficultyProfile(value){return Object.hasOwn(levels,value)?levels[value]:levels.normal;}
export function difficultyHint(game,level){return `${level==='easy'?'Easy':level==='hard'?'Hard':'Normal'} · ${difficultyEffects[game]||'Standard challenge'}. Friend rooms use the same Normal rules for everyone.`;}
