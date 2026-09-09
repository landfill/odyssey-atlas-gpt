import { V, add, sub, mul, dot, cross, mean, normalize, normal, rotateY, seeded, type Vec3 } from './math';
export interface Face { vertices:Vec3[]; color:string; line?:boolean; width?:number; opacity?:number; unlit?:boolean; twoSided?:boolean; bias?:number; detail?:number }
export type Model = Face[];
export function face(vertices:Vec3[],color:string,options:Partial<Face>={}):Face{return {vertices,color,...options};}
export function line(vertices:Vec3[],color:string,width=1,opacity=1,detail=0):Face{return face(vertices,color,{line:true,width,opacity,unlit:true,twoSided:true,detail,bias:.15});}
export function oriented(vertices:Vec3[],out:Vec3,color:string,options:Partial<Face>={}):Face {
 if(dot(normal(vertices),out)<0)vertices=[...vertices].reverse();return face(vertices,color,options);
}
export function box(p:Vec3,w:number,h:number,d:number,color:string):Model {
 const x=p.x,z=p.z,y=p.y,X=x+w,Y=y+h,Z=z+d;
 return [oriented([V(x,y,z),V(X,y,z),V(X,Y,z),V(x,Y,z)],V(0,0,-1),color),oriented([V(X,y,z),V(X,y,Z),V(X,Y,Z),V(X,Y,z)],V(1,0,0),color),oriented([V(X,y,Z),V(x,y,Z),V(x,Y,Z),V(X,Y,Z)],V(0,0,1),color),oriented([V(x,y,Z),V(x,y,z),V(x,Y,z),V(x,Y,Z)],V(-1,0,0),color),oriented([V(x,Y,z),V(X,Y,z),V(X,Y,Z),V(x,Y,Z)],V(0,1,0),color)];
}
export function transform(model:Model,p:Vec3,scale=1,yaw=0):Model { return model.map(f=>({...f,vertices:f.vertices.map(v=>add(rotateY(mul(v,scale),yaw),p))})); }
export function cylinder(a:Vec3,b:Vec3,r:number,color:string,n=8,r2=r):Model {
 const axis=normalize(sub(b,a));const u=normalize(cross(axis,Math.abs(axis.y)>.95?V(1,0,0):V(0,1,0))),v=cross(axis,u);
 const ring=(center:Vec3,radius:number)=>Array.from({length:n},(_,i)=>add(center,add(mul(u,Math.cos(i/n*Math.PI*2)*radius),mul(v,Math.sin(i/n*Math.PI*2)*radius))));
 const A=ring(a,r),B=ring(b,r2),out:Model=[];
 for(let i=0;i<n;i++){const j=(i+1)%n;out.push(oriented([A[i],A[j],B[j],B[i]],sub(mean([A[i],A[j]]),a),color));}
 out.push(oriented(B,axis,color));return out;
}
export function ellipsoid(p:Vec3,rx:number,ry:number,rz:number,color:string,n=10,rings=5):Model {
 const out:Model=[];const pos=(i:number,j:number)=>V(p.x+rx*Math.sin(Math.PI*j/rings)*Math.cos(2*Math.PI*i/n),p.y+ry*Math.cos(Math.PI*j/rings),p.z+rz*Math.sin(Math.PI*j/rings)*Math.sin(2*Math.PI*i/n));
 for(let j=0;j<rings;j++)for(let i=0;i<n;i++){
  const vs=j===0?[pos(i,0),pos(i+1,1),pos(i,1)]:j===rings-1?[pos(i,j),pos(i+1,j),pos(i,rings)]:[pos(i,j),pos(i+1,j),pos(i+1,j+1),pos(i,j+1)];
  out.push(oriented(vs,sub(mean(vs),p),color));
 }return out;
}
export function terrain(center:Vec3,rx:number,rz:number,height:number,color:string,seed:number,n=24,shape?:[number,number][]):Model {
 const rnd=seeded(seed),out:Model=[];
 const edge=shape?shape.map(([x,z])=>V(center.x+x,0,center.z+z)):Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;const noise=.9+Math.sin(a*2+seed)*.085+Math.cos(a*3-seed*.4)*.095+rnd()*.065;return V(center.x+Math.cos(a)*rx*noise,0,center.z+Math.sin(a)*rz*noise);});
 const count=edge.length;
 const rings=[{scale:1.1,y:-2},{scale:1.02,y:3},{scale:.99,y:height*.32},{scale:.94,y:height*.67},{scale:.83,y:height}].map(({scale,y})=>edge.map((e,i)=>V(center.x+(e.x-center.x)*scale,center.y+y+(y>4&&y<height?Math.sin(i*2.2+seed)*height*.08:0),center.z+(e.z-center.z)*scale)));
 for(const [scale,opacity] of [[1.22,.065],[1.15,.11]])out.push(face(edge.map(e=>V(center.x+(e.x-center.x)*scale,center.y-2.4,center.z+(e.z-center.z)*scale)),'#020d13',{unlit:true,twoSided:true,opacity}));
 const tones=['#566963',color,color,color];
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<count;i++){
  const k=(i+1)%count;out.push(oriented([rings[j][i],rings[j][k],rings[j+1][k],rings[j+1][i]],sub(mean([rings[j][i],rings[j][k]]),center),tones[j]));
  if(j===2)out.push(line([rings[j][i],rings[j][k]],'#483f35',.55,.5,1));
 }
 const top=rings[rings.length-1]; const crown=V(center.x,center.y+height,center.z);
 // A fan works for star-shaped shores; the concave harbour is built from separate rock masses.
 for(let i=0;i<count;i++)out.push(oriented([top[i],top[(i+1)%count],crown],V(0,1,0),color,{width:1.05}));
 for(let i=0;i<28;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.72;const x=center.x+Math.cos(a)*rx*r,z=center.z+Math.sin(a)*rz*r,y=center.y+height+.08;out.push(face([V(x-1.6,y,z-.7),V(x+1.3,y,z-.9),V(x+2,y,z+.6),V(x-.4,y,z+1.2)],i%3?'#c1b99c':'#514e40',{twoSided:true,opacity:.1,detail:1,unlit:true}));}
 for(const scale of [1.14,1.22]){const ring=edge.map(e=>V(center.x+(e.x-center.x)*scale,1,center.z+(e.z-center.z)*scale));out.push(line([...ring,ring[0]],'#78a7a1',scale===1.14?.9:.5,.3));}
 for(let i=0;i<count;i+=3){const p=top[i],q=rings[1][i];out.push(line([p,V(q.x*.33+p.x*.67,p.y*.57+p.y*.04,q.z*.33+p.z*.67),q],'#574d40',.55,.65,1));}
 return out;
}
export function tree(p:Vec3,size=1,type:'cypress'|'olive'|'palm'|'dead'='cypress'):Model {
 const out:Model=[];out.push(...cylinder(p,add(p,V(0,24*size,0)),2*size,'#76634a',5,1.3*size));
 if(type==='dead'){
  [-1,1].forEach((sg,i)=>out.push(line([add(p,V(0,12*size,0)),add(p,V(sg*8*size,(21+i*3)*size,2*size)),add(p,V(sg*10*size,(31+i*3)*size,-3*size))],'#7e827b',2*size)));
 }else if(type==='palm'){
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const end=add(p,V(Math.cos(a)*23*size,21*size,Math.sin(a)*23*size)),c=add(p,V(0,30*size,0));out.push(face([c,add(p,V(Math.cos(a-.2)*10*size,30*size,Math.sin(a-.2)*10*size)),end,add(p,V(Math.cos(a+.2)*10*size,29*size,Math.sin(a+.2)*10*size))],'#527e69',{twoSided:true}));}
 }else if(type==='olive'){
  out.push(...ellipsoid(add(p,V(-6*size,25*size,0)),14*size,12*size,13*size,'#697b57',8,4),...ellipsoid(add(p,V(7*size,27*size,2*size)),12*size,13*size,12*size,'#768763',8,4));
 }else{
  out.push(...cylinder(add(p,V(0,7*size,0)),add(p,V(0,47*size,0)),11*size,'#466b57',7,0));
  out.push(...cylinder(add(p,V(0,23*size,0)),add(p,V(0,52*size,0)),7*size,'#5a7e61',7,0));
 }return out;
}
export function person(p:Vec3,s=1,color='#b6a28a'):Model {
 return [...cylinder(add(p,V(-1.3*s,0,0)),add(p,V(-1.1*s,7*s,0)),.8*s,'#665143',5),...cylinder(add(p,V(1.3*s,0,0)),add(p,V(1.1*s,7*s,0)),.8*s,'#665143',5),...cylinder(add(p,V(0,5*s,0)),add(p,V(0,12*s,0)),2.8*s,color,6,2*s),...ellipsoid(add(p,V(0,14*s,0)),2.2*s,2.5*s,2.2*s,'#b8a182',7,4)];
}
export function animal(p:Vec3,s=1,type:'sheep'|'cow'|'pig'='sheep'):Model {
 const c=type==='cow'?'#c9c0a6':type==='pig'?'#ac8c7b':'#d3cdb7';const out:Model=[];
 out.push(...ellipsoid(add(p,V(0,4*s,0)),5.5*s,3.3*s,3*s,c,8,4),...box(add(p,V(3.5*s,4*s,-1.5*s)),3*s,3*s,3*s,type==='cow'?'#806854':c));
 for(const x of [-3,3])for(const z of [-1.8,1.8])out.push(...cylinder(add(p,V(x*s,0,z*s)),add(p,V(x*s,4*s,z*s)),.55*s,'#715e4c',4));
 if(type==='cow')for(const z of [-1,1])out.push(line([add(p,V(5*s,6.8*s,z*1.5*s)),add(p,V(5*s,8*s,z*2.6*s))],'#e3d4af',.8));
 return out;
}
export function steps(p:Vec3,w:number,n:number,rise=2.4,run=4,color='#a89779'):Model {
 const out:Model=[];for(let i=0;i<n;i++)out.push(...box(add(p,V(0,i*rise,-i*run)),w,rise,(n-i)*run,color));return out;
}
export function temple(p:Vec3,w=60,d=45,h=32,color='#b8aa8e',open=false):Model {
 const out:Model=[];out.push(...box(add(p,V(-w/2,0,-d/2)),w,5,d,color));
 for(const x of [-w/2+5,w/2-5])for(let z=-d/2+6;z<=d/2-4;z+=12){out.push(...cylinder(add(p,V(x,5,z)),add(p,V(x,h,z)),2.5,color,8,2.1),...box(add(p,V(x-3.3,h,z-3.3)),6.6,3,6.6,color));}
 out.push(...box(add(p,V(-w/2,h,-d/2)),w,4,7,color),...box(add(p,V(-w/2,h,d/2-7)),w,4,7,color));
 if(!open){out.push(oriented([add(p,V(-w/2-3,h+4,-d/2-3)),add(p,V(0,h+17,-d/2-3)),add(p,V(w/2+3,h+4,-d/2-3))],V(0,0,-1),'#b0a18a'));
 out.push(oriented([add(p,V(-w/2-3,h+4,d/2+3)),add(p,V(w/2+3,h+4,d/2+3)),add(p,V(0,h+17,d/2+3))],V(0,0,1),'#b9a58b'));
 out.push(oriented([add(p,V(-w/2-3,h+4,-d/2-3)),add(p,V(-w/2-3,h+4,d/2+3)),add(p,V(0,h+17,d/2+3)),add(p,V(0,h+17,-d/2-3))],V(-1,1,0),'#7d8270'),oriented([add(p,V(0,h+17,-d/2-3)),add(p,V(0,h+17,d/2+3)),add(p,V(w/2+3,h+4,d/2+3)),add(p,V(w/2+3,h+4,-d/2-3))],V(1,1,0),'#8e8c76'));
 }return out;
}
