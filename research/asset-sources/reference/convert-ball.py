"""Independent public-domain original football ASE conversion; Z-up to Y-up."""
from pathlib import Path
import re,json,math
root=Path(__file__).parent
s=(root/'gfootball/ball.ase').read_text()
number=r'([-+\d.eE]+)'
chosen={'ball':'ball'}
meshes=[]
for chunk in s.split('*GEOMOBJECT {')[1:]:
 name=re.search(r'\*NODE_NAME\s+"([^"]+)"',chunk).group(1)
 if name not in chosen:continue
 raw=re.findall(r'\*MESH_VERTEX\s+(\d+)\s+'+number+r'\s+'+number+r'\s+'+number,chunk)
 vertices={int(i):(float(y)/.11,float(z)/.11,float(x)/.11) for i,x,y,z in raw}
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
   p=tuple(round(v,5) for v in vertices[j]);length=math.sqrt(sum(v*v for v in p));normal=[round(v/length,5) for v in p];t=tuple(round(v,5) for v in tv[tf[i][corner]]) if i in tf else(0,0);key=p+t+tuple(normal)
   if key not in lookup:lookup[key]=len(positions)//3;positions.extend(p);uv.extend(t);normals.extend(normal)
   indices.append(lookup[key])
 bbox={'min':[min(positions[k::3]) for k in range(3)],'max':[max(positions[k::3]) for k in range(3)]}
 meshes.append({'name':chosen[name],'sourceObject':name,'material':'ball','positions':positions,'normals':normals,'uv':uv,'indices':indices,'boundingBox':bbox})
result={'format':'three-buffer-geometry-arrays-v1','source':'google-research/football/third_party/gfootball_engine/data/media/objects/balls/generic.ase','license':'Unlicense','author':'Bastiaan Konings Schuiling / Gameplay Football; Google Research Football distribution','axes':{'up':'+Y'},'radius':1,'originalRadiusMeters':0.11,'meshes':meshes}
p=root/'converted/ball.json';p.write_text(json.dumps(result,separators=(',',':'))+'\n');print(p,p.stat().st_size,'bytes',[(m['name'],len(m['positions'])//3,len(m['indices'])//3) for m in meshes])
