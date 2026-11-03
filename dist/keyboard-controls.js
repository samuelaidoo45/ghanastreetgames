// Read hints from the very same action descriptors used by the key handlers.
export function keyLabel(key){
 const value=String(key||'');
 return ({' ':'SPACE',space:'SPACE',shift:'SHIFT',enter:'ENTER',escape:'ESC',arrowleft:'←',arrowright:'→',arrowup:'↑',arrowdown:'↓'})[value.toLowerCase()]||value.toUpperCase();
}
export function actionKeyHint(action){const key=keyLabel(action.key);return key?`${action.hold||action.charge?'Hold ':''}${key}`:'';}
export function keyboardControlsAvailable(touch,hover,fine){return !touch||(hover&&fine);}
