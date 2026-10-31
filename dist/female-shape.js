let loading,data,manifest;const geometries=new WeakMap();
export function loadFemaleShape(){return loading??=Promise.all([fetch('assets/characters/female-shape.json').then(r=>{if(!r.ok)throw Error('Character shape unavailable');return r.json();}),fetch('assets/characters/female-shape.bin').then(r=>{if(!r.ok)throw Error('Character shape unavailable');return r.arrayBuffer();})]).then(([m,d])=>{manifest=m;data=d;}).catch(e=>{loading=null;throw e;});}
export function femaleGeometry(geometry,name){
 if(!data||!manifest[name])return geometry;
 if(geometries.has(geometry))return geometries.get(geometry);
 const result=geometry.clone();
 for(const [kind,attribute]of [['POSITION','position'],['NORMAL','normal']]){const spec=manifest[name][kind],a=result.getAttribute(attribute);if(!spec||!a||a.count!==spec.count)continue;const delta=new Float32Array(data,spec.offset,spec.count*3);for(let i=0;i<a.count;i++){let x=a.getX(i)+delta[i*3],y=a.getY(i)+delta[i*3+1],z=a.getZ(i)+delta[i*3+2];if(kind==='NORMAL'){const length=Math.hypot(x,y,z)||1;x/=length;y/=length;z/=length;}a.setXYZ(i,x,y,z);}a.needsUpdate=true;}
 if(!manifest[name].NORMAL)result.computeVertexNormals();result.computeBoundingBox();result.computeBoundingSphere();geometries.set(geometry,result);return result;
}
