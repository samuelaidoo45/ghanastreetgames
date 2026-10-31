"""Independent ASE -> compact Three.js geometry conversion; original data is Unlicense.
Usage: python3 research/asset-sources/reference/convert-goal.py
The source has two goals. Extract one, discard duplicate reverse net faces,
centre its mouth and change Z-up to Three.js Y-up. No Four Corners code used.
"""
from pathlib import Path
import re,json,math
root=Path(__file__).parent
s=(root/'gfootball/goals.ase').read_text()
number=r'([-+\d.eE]+)'
chosen={'goal01':'frame','goal01_sidenetting01':'net-left','goal01_sidenetting03':'net-right','goal01_topnetting01':'net-top','goal01_rearnetting01':'net-back'}
meshes=[]
for chunk in s.split('*GEOMOBJECT {')[1:]:
 name=re.search(r'\*NODE_NAME\s+"([^"]+)"',chunk).group(1)
 if name not in chosen:continue
 raw=re.findall(r'\*MESH_VERTEX\s+(\d+)\s+'+number+r'\s+'+number+r'\s+'+number,chunk)
 vertices={int(i):(float(y),float(z),float(x)+55.0036) for i,x,y,z in raw}
 faces={int(i):(int(a),int(b),int(c)) for i,a,b,c in re.findall(r'\*MESH_FACE\s+(\d+):\s+A:\s*(\d+)\s+B:\s*(\d+)\s+C:\s*(\d+)',chunk)}
 tv={int(i):(float(u),float(v)) for i,u,v,w in re.findall(r'\*MESH_TVERT\s+(\d+)\s+'+number+r'\s+'+number+r'\s+'+number,chunk)}
 tf={int(i):(int(a),int(b),int(c)) for i,a,b,c in re.findall(r'\*MESH_TFACE\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)',chunk)}
 positions=[];uv=[];normals=[];indices=[];lookup={}
 for i,face in faces.items():
  a,b,c=(vertices[j] for j in face);ab=[b[k]-a[k] for k in range(3)];ac=[c[k]-a[k] for k in range(3)]
  normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];mag=math.sqrt(sum(v*v for v in normal))
  if mag<1e-10:continue
  normal=[round(v/mag,5) for v in normal]
  for corner,j in enumerate(face):
   p=tuple(round(v,5) for v in vertices[j]);t=tuple(round(v,5) for v in tv[tf[i][corner]]) if i in tf else(0,0);key=p+t+tuple(normal)
   if key not in lookup:lookup[key]=len(positions)//3;positions.extend(p);uv.extend(t);normals.extend(normal)
   indices.append(lookup[key])
 bbox={'min':[min(positions[k::3]) for k in range(3)],'max':[max(positions[k::3]) for k in range(3)]}
 meshes.append({'name':chosen[name],'sourceObject':name,'material':'net' if name!='goal01' else 'frame','positions':positions,'normals':normals,'uv':uv,'indices':indices,'boundingBox':bbox})
result={'format':'three-buffer-geometry-arrays-v1','source':'google-research/football/third_party/gfootball_engine/data/media/objects/stadiums/goals.ase','license':'Unlicense','author':'Bastiaan Konings Schuiling / Gameplay Football; Google Research Football distribution','axes':{'up':'+Y','width':'X','mouthFaces':'+Z','netBehind':'-Z','mouthCenter':[0,0,0]},'opening':{'width':7.32,'height':2.44},'outerDimensions':{'width':7.52,'height':2.54,'depth':2.5503},'meshes':meshes}
p=root/'converted/goal.json';p.write_text(json.dumps(result,separators=(',',':'))+'\n');print(p,p.stat().st_size,'bytes',[(m['name'],len(m['positions'])//3,len(m['indices'])//3,m['boundingBox']) for m in meshes])
