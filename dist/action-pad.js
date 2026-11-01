// Local, decorative SVGs. Labels and accessible names remain real text.
const paths={
 ball:'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM12 8l4 3-1.5 5h-5L8 11l4-3ZM12 8V4M16 11l4-1M14.5 16l2 3M9.5 16l-2 3M8 11l-4-1',
 arrow:'M4 12h15M13 5l7 7-7 7',
 target:'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 2v3M12 19v3M2 12h3M19 12h3',
 jump:'M5 18c0-8 14-8 14-14M14 4h5v5M5 22h14',
 swap:'M4 8h16l-4-4M20 16H4l4 4',
 hand:'M8 12V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9c0 4-3 6-7 6-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-2l2 2',
 search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM15 15l6 6',
 shield:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3ZM8 12l3 3 5-6',
 dice:'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM7 7h.01M17 7h.01M12 12h.01M7 17h.01M17 17h.01',
 foot:'M9 3c3-1 5 2 4 5l-1 5 7 3c3 2 2 5-1 5H7c-2 0-3-2-2-4l2-6V6c0-2 0-3 2-3Z',
 check:'M4 12l5 5L20 6',
 tune:'M4 7h16M4 17h16M9 4v6M15 14v6',
 run:'M14 4h.01M6 12l4-4 5 3 4-1M10 8l-1 7-5 5M9 15l6 2v4',
 turn:'M6 8a8 8 0 1 1-1 9M3 3v6h6'
};
const labels={
 'Call for ball':'Call',
 'Pass / tackle':'Pass','Keeper save':'Save','Shoot / tackle':'Shoot','One-touch kick':'Shoot','Next goal':'Target','Next player':'Target',
 'Hold / shoot':'Shoot','Hold / strike':'Strike','Palm strike':'Strike','Set strength':'Power',
 'Next cap':'Next','Drop / pick cloth':'Cloth','Pick up / chase':'Chase','Drop cloth':'Drop',
 'Search / collect':'Search','Pick / use':'Use','Pɛw! Shoot':'Pɛw!',
 'Dive / save':'Dive','Hold / throw':'Throw','Pull / release':'Release','Roll to teammate':'Roll',
 'Throw / clear':'Clear','Nutmeg / tackle':'Nutmeg','Kick loose ball':'Kick','Stay centre':'Centre',
 'Step left':'Left','Step right':'Right','Say Zanzama':'Call','Choose left':'Left','Choose right':'Right',
 'Look left':'Look left','Look right':'Look right','Centre aim':'Centre','Lock aim':'Lock aim',
 'Set power':'Power','Pick marker':'Pick up','Fold left leg':'Left leg','Fold right leg':'Right leg',
 'Select / move':'Move','Roll dice':'Roll','Flick seed':'Flick','Toss peg':'Toss','Sit down':'Sit'
};
export function actionLabel(label){return labels[label]||String(label).replace(/^Eliminate /,'Out: ');}
export function actionIcon(action){
 const text=(action.id+' '+action.label).toLowerCase();
 const name=/search|collect/.test(text)?'search':/target|aim|lock/.test(text)?'target':/shield|tackle|save/.test(text)?'shield':/switch|next|piece|prev/.test(text)?'swap':/power|strength/.test(text)?'tune':/chip|hop|jump|volley/.test(text)?'jump':/sprint|chase|run/.test(text)?'run':/roll/.test(text)?'dice':/left|right|foot|land/.test(text)?'foot':/pass|throw|flick|release/.test(text)?'arrow':/shoot|kick|nutmeg|strike/.test(text)?'ball':/dodge|feint|tuck|pike|layout/.test(text)?'turn':/select|sit|yes|claim/.test(text)?'check':'hand';
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
}
export function padLayout(game,actions){
 // Alternatives in a rhythm, board or choice game need equal prominence.
 const choices=new Set(['ampe','oware','ludo','dame','chempe','kyekyekule','pempenaa','numbers']);
 return choices.has(game)||actions.every(a=>/^out-|^(left|right|center|keeper|player|continue)$/.test(a.id))?'choices':'arcade';
}
export function releaseQuickCharge(mode,duration){
 if(duration>=180)return;
 // Quick taps use each game's normal strike; holding still gives full control.
 mode.charge=null;mode.shotCharge=null;mode.cancelCharge?.();
}
