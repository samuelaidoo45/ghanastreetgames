import {catalogue} from './catalogue.js';
const gameIds=new Set(catalogue.map(g=>g.id));
export const scoreCaps={football:40,fourcorners:30,penalties:50,onepole:6,laski:4,pampanaa:5,shooting:5,rubberband:6,ampe:5,oware:48,pilolo:3,chaskele:10,stay:30,alikoto:5,tumatu:13,counters:3,antoakyire:5,sulia:30,sansankroma:8,ludo:4,tyre:8,kpitinge:5,zanzama:5,pretend:3,numbers:8,police:3,skipping:10,dame:20,alasa:5,chempe:6,kyekyekule:6,pempenaa:2,mbobagor:16};
export function practicePoints(game,score,won){if(!gameIds.has(game)||!Number.isInteger(score)||score<0||score>100000||typeof won!=='boolean')throw Error('Invalid result');return 10+(won?25:0)+Math.round(Math.min(1,score/scoreCaps[game])*15);}
