"""Original, noise-free reward cues. No sampled recordings or external assets."""
import math, pathlib, struct, subprocess, tempfile, wave
RATE=44100
OUT=pathlib.Path(__file__).resolve().parents[1]/'dist/assets/audio/rewards'
OUT.mkdir(parents=True,exist_ok=True)
def render(name,duration,notes,drums=()):
    data=[0.0]*int(RATE*duration)
    for start,hz,length,gain,kind in notes:
        for j in range(int(length*RATE)):
            t=j/RATE; index=int(start*RATE)+j
            if index>=len(data):break
            attack=min(1,t/.012); release=min(1,(length-t)/.06)
            if kind=='brass':
                envelope=attack*release*math.exp(-t*2.8)
                tone=sum(a*math.sin(2*math.pi*hz*k*t) for k,a in [(1,1),(2,.25),(3,.1),(4,.035)])
            else:
                envelope=attack*release*math.exp(-t*9)
                tone=math.sin(2*math.pi*hz*t)+.25*math.sin(2*math.pi*hz*2.76*t)*math.exp(-t*14)
            data[index]+=gain*envelope*tone
    for start,hz,gain in drums:
        for j in range(int(.24*RATE)):
            t=j/RATE;index=int(start*RATE)+j
            if index>=len(data):break
            phase=2*math.pi*(hz*t+hz*.022*(1-math.exp(-t/ .022)))
            data[index]+=gain*min(1,t/.003)*math.exp(-t*21)*math.sin(phase)
    peak=max(abs(v) for v in data) or 1
    # Consistent headroom, with silence at both ends and no broadband noise bed.
    pcm=b''.join(struct.pack('<h',int(max(-1,min(1,v/peak*.68))*32767)) for v in data)
    with tempfile.TemporaryDirectory() as tmp:
        wav=pathlib.Path(tmp)/'cue.wav'
        with wave.open(str(wav),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE);w.writeframes(pcm)
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','80k','-map_metadata','-1',str(OUT/(name+'.mp3'))],check=True)
    print(name, (OUT/(name+'.mp3')).stat().st_size)
render('goal-fanfare',1.08,[(.02,261.63,.3,.4,'brass'),(.19,329.63,.3,.4,'brass'),(.36,392,.55,.42,'brass'),(.36,261.63,.5,.2,'brass')],[(.01,95,.4),(.18,145,.22),(.36,95,.35)])
render('wood-point',.48,[(.01,523.25,.35,.5,'wood'),(.095,783.99,.3,.28,'wood')])
render('rhythm-point',.49,[(.03,392,.36,.3,'wood')],[(.01,160,.5),(.14,225,.32)])
render('discovery-point',.64,[(.01,392,.35,.4,'wood'),(.14,587.33,.38,.4,'wood')])
render('victory',1.45,[(.02,261.63,.38,.35,'wood'),(.16,329.63,.4,.35,'wood'),(.30,392,.42,.35,'wood'),(.47,523.25,.7,.4,'wood'),(.47,329.63,.6,.18,'wood')],[(.02,110,.3),(.29,180,.2),(.47,110,.3)])
render('ready',.24,[(.01,440,.2,.3,'wood')])
