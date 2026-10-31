"""Extract the licensed MakeHuman female morph without duplicating textures/rigs."""
import json,struct
from pathlib import Path
source=Path('research/asset-sources/characters');out=Path('dist/assets/characters')
manifest={};data=bytearray()
for file in ['base_body_anim','clothing_tshirt','clothing_shorts','clothing_shoes','hair_short04','hair_afro01']:
 b=(source/(file+'.glb')).read_bytes();n=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+n]);start=28+n
 for mesh in g['meshes']:
  names=mesh.get('extras',{}).get('targetNames',[])
  if 'gender_female' not in names:continue
  prim=mesh['primitives'][0];target=prim['targets'][names.index('gender_female')];entry={}
  for kind in ['POSITION','NORMAL']:
   if kind not in target:continue
   a=g['accessors'][target[kind]];assert a['type']=='VEC3'
   fmt,size,divisor={5126:('f',4,1),5122:('h',2,32767),5120:('b',1,127)}[a['componentType']]
   values=[[0,0,0] for _ in range(a['count'])]
   if 'bufferView' in a:
    v=g['bufferViews'][a['bufferView']]
    for i in range(a['count']):
     pos=start+v.get('byteOffset',0)+a.get('byteOffset',0)+i*v.get('byteStride',size*3)
     values[i]=struct.unpack_from('<'+fmt*3,b,pos)
   if 'sparse' in a:
    sp=a['sparse'];iv=g['bufferViews'][sp['indices']['bufferView']];vv=g['bufferViews'][sp['values']['bufferView']]
    ifmt,isize={5121:('B',1),5123:('H',2),5125:('I',4)}[sp['indices']['componentType']]
    for i in range(sp['count']):
     index=struct.unpack_from('<'+ifmt,b,start+iv.get('byteOffset',0)+sp['indices'].get('byteOffset',0)+i*isize)[0]
     values[index]=struct.unpack_from('<'+fmt*3,b,start+vv.get('byteOffset',0)+sp['values'].get('byteOffset',0)+i*size*3)
   offset=len(data)
   for row in values:data.extend(struct.pack('<3f',*[max(-1,v/divisor) if a.get('normalized') else v for v in row]))
   entry[kind]={'offset':offset,'count':a['count']}
  manifest[mesh['name']]=entry
  for node in g['nodes']:
   if 'mesh' in node and g['meshes'][node['mesh']] is mesh and node.get('name'):manifest[node['name']]=entry
(out/'female-shape.bin').write_bytes(data);(out/'female-shape.json').write_text(json.dumps(manifest,separators=(',',':'))+'\n')
print('Female morph:',len(data),'bytes;',len(manifest),'meshes. Existing textures, skeleton and animations reused.')
