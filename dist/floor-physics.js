// Small floor pieces exchange momentum; none of the unselected caps are fixed walls.
export function stepFloorDiscs(discs,dt){
 let impact=0;
 for(const d of discs){d.position.x+=d.velocity.x*dt;d.position.z+=d.velocity.z*dt;}
 for(let i=0;i<discs.length;i++)for(let j=i+1;j<discs.length;j++){
  const a=discs[i],b=discs[j];let dx=b.position.x-a.position.x,dz=b.position.z-a.position.z,dist=Math.hypot(dx,dz),radius=a.radius+b.radius;if(dist>=radius)continue;
  if(dist<.00001){dx=Math.cos(i*2.399+j);dz=Math.sin(i*2.399+j);dist=0;}else{dx/=dist;dz/=dist;}
  const ia=1/a.mass,ib=1/b.mass,total=ia+ib,overlap=radius-dist+.0001;
  a.position.x-=dx*overlap*ia/total;a.position.z-=dz*overlap*ia/total;b.position.x+=dx*overlap*ib/total;b.position.z+=dz*overlap*ib/total;
  const speed=(b.velocity.x-a.velocity.x)*dx+(b.velocity.z-a.velocity.z)*dz;
  if(speed<0){const impulse=-1.55*speed/total;a.velocity.x-=impulse*ia*dx;a.velocity.z-=impulse*ia*dz;b.velocity.x+=impulse*ib*dx;b.velocity.z+=impulse*ib*dz;impact=Math.max(impact,-speed);}
 }
 for(const d of discs){const friction=Math.exp(-d.drag*dt);d.velocity.x*=friction;d.velocity.z*=friction;if(Math.hypot(d.velocity.x,d.velocity.z)<.035){d.velocity.x=0;d.velocity.z=0;}}
 return impact;
}
