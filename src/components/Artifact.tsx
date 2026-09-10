import { translate, type Language, type MessageKey } from '../content/language';
import { ship } from '../graphics/models';
import { V, project, mean, shade, dot, normalize, normal } from '../graphics/math';
import { box, line, type Model } from '../graphics/geometry';
export function Artifact({kind,language}:{kind:'penelope'|'telemachus';language:Language}){
 const t=(key:MessageKey)=>translate(language,key);
 let model:Model;
 if(kind==='telemachus')model=ship();
 else{
  model=[...box(V(-22,0,0),4,48,5,'#93754f'),...box(V(20,0,0),4,48,5,'#93754f'),...box(V(-22,44,0),46,4,5,'#aa8759'),...box(V(-25,-3,-5),54,3,20,'#847559')];
  for(let i=0;i<17;i++)model.push(line([V(-17+i*2.1,1,3),V(-17+i*2.1,44,3)],'#d9c8a5',.7));
  for(let y=2;y<27;y+=1.6)model.push(line([V(-18,y,3.3),V(19,y,3.3)],Math.round(y/4)%2?'#b98e63':'#995f49',1.5));
 }
 const camera={target:V(0,22,0),yaw:kind==='telemachus'?-.55:-.4,elevation:.6,zoom:kind==='telemachus'?2.8:2.9};
 const faces=model.map(f=>({f,d:project(mean(f.vertices),camera,420,185).depth})).sort((a,b)=>a.d-b.d);
 return <svg viewBox='0 0 420 185' className='artifact-illustration' aria-label={kind==='penelope'?t("입체 직조기"):t("텔레마코스의 탐색을 상징하는 입체 선박")} role='img'>{faces.map(({f},i)=>{const d=f.vertices.map((v,j)=>{const p=project(v,camera,420,185);return `${j?'L':'M'}${p.x},${p.y}`;}).join('')+(f.line?'':'Z');const color=f.line?f.color:shade(f.color,.73+.3*Math.abs(dot(normal(f.vertices),normalize(V(-1,1,1)))));return <path key={i} d={d} fill={f.line?'none':color} stroke={color} strokeWidth={f.line?f.width:.3}/>;})}</svg>;
}
