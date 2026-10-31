export class ClubAPI{
 constructor(){this.token='';this.base='';this.config=null;}
 async ready(){return this.config??=fetch('online-config.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Online play is unavailable');return r.json();}).then(c=>{const url=new URL(c.api);if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw Error('Invalid game server');this.base=url.origin;}).catch(e=>{this.config=null;throw e;});}
 async request(path,data){await this.ready();const response=await fetch(this.base+path,{method:data===undefined?'GET':'POST',headers:{...(this.token?{Authorization:'Bearer '+this.token}:{}),...(data===undefined?{}:{'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)}),signal:AbortSignal.timeout(12000)});const result=await response.json();if(!response.ok)throw Error(result.error||'Could not connect. Please retry.');return result;}
 async socket(code){const {ticket}=await this.request('/rooms/'+code+'/ticket',{});return new WebSocket(this.base.replace(/^http/,'ws')+'/rooms/'+code+'/socket?ticket='+encodeURIComponent(ticket));}
}
