export function initialGraphics(saved={},device={}){
 if(saved.performanceVersion===48&&['low','balanced','high'].includes(saved.quality))return saved.quality;
 if(device.saveData||device.memory<=2||device.cores<=2)return 'low';
 return device.mobile?'balanced':saved.quality==='high'?'high':'balanced';
}
