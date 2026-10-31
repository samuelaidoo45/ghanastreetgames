export class ReplayRecorder {
 constructor(canvas,sound){this.canvas=canvas;this.sound=sound;this.recorder=null;this.url=null;this.blob=null;this.mime=null;this.recordedMs=0;}
 supported(){return !!(window.MediaRecorder&&this.canvas.captureStream);}
 start(){
  if(!this.supported()||this.recorder&&this.recorder.state!=='inactive')return;
  const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime)return;
  try{
   const stream=this.canvas.captureStream(24);
   for(const track of this.sound.recordDestination?.stream.getAudioTracks()||[])stream.addTrack(track.clone());
   const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000}),chunks=[];
   if(this.url)URL.revokeObjectURL(this.url);
   this.url=null;this.blob=null;this.mime=mime;this.recorder=recorder;this.started=performance.now();this.recordedMs=0;
   this.done=new Promise(resolve=>{
    recorder.ondataavailable=e=>{
     if(e.data.size)chunks.push(e.data);
     const duration=this.recordedMs+(recorder.state==='recording'?performance.now()-this.started:0);
     // Bound memory use in open-ended games; pauses do not consume clip time.
     if(duration>=300000&&recorder.state==='recording')recorder.stop();
    };
    recorder.onstop=()=>{
     this.blob=new Blob(chunks,{type:mime});this.url=URL.createObjectURL(this.blob);
     for(const track of stream.getTracks())track.stop();resolve(this.url);
    };
   });
   recorder.start(1000);
  }catch(error){console.warn('Replay recording unavailable',error.message);}
 }
 pause(){if(this.recorder?.state==='recording'){this.recordedMs+=performance.now()-this.started;this.recorder.pause();}}
 resume(){if(this.recorder?.state==='paused'){this.started=performance.now();this.recorder.resume();}else this.start();}
 async finish(){if(this.recorder&&this.recorder.state!=='inactive')this.recorder.stop();return this.done?await this.done:this.url;}
 extension(){return this.mime?.includes('webm')?'webm':'mp4';}
}
