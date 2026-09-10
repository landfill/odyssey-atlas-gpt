import { chapters } from '../content/chapters';
import { getChapters } from '../content/chapters.en';
import { chapterLabel, type Language } from '../content/language';
import { V, add, sub, dot, normal, shade, normalize, project, viewDirection, clamp, mix, cubic, curveTangent, smooth, lerp, type Camera, type Vec3 } from './math';
import { face, line, transform, type Model, type Face } from './geometry';
import { island, ship, eventModel } from './models';
const NS='http://www.w3.org/2000/svg';
export interface RendererState { language:Language; index:number; started:boolean; follow:boolean; paused:boolean; reduced:boolean; progress:number; quality:'auto'|'high'|'low'; hotspot:number|null }
export interface RendererCallbacks { onChapter:(index:number)=>void; onHotspot:(index:number)=>void; onExplore:()=>void; onTransition:(active:boolean)=>void }
interface PathData { d:string; fill:string; stroke:string; width:number; opacity:number; depth:number }
interface Flight { start:number; duration:number; from:Camera; to:Camera; shipFrom:Vec3; shipTo:Vec3; fromIndex:number; movingShip:boolean }
const initialState:RendererState={language:'ko',index:0,started:false,follow:true,paused:false,reduced:false,progress:.15,quality:'auto',hotspot:null};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const light=normalize(V(-.55,1,-.48));
export class AtlasRenderer {
 private svg:SVGSVGElement; private cb:RendererCallbacks; private state={...initialState};
 private camera:Camera={target:V(0,0,95),yaw:-.17,elevation:.81,zoom:.6};
 private width=1000;private height=620;private overview=true;private visible=true;private dirty=true;
 private terrainModels:Model[]=[];private staticPaths:{depth:number;node:Element}[]=[];
 private sea:SVGGElement;private world:SVGGElement;private labels:SVGGElement;private event:SVGGElement;private threat:SVGGElement;private fleet:SVGGElement[]=[];
 private landLabels:SVGGElement;private hotspotLabels:SVGGElement;
 private raf=0;private last=0;private lastDraw=0;private time=0;private flight:Flight|null=null;private shipPosition=chapters[0].port;
 private shipModels=new Map<string,Model>();private observer:ResizeObserver;private pointers=new Map<number,{x:number;y:number}>();private press:{x:number;y:number;px:number;py:number;shift:boolean;target:Element|null}|null=null;
 private pinchDistance=0;private dragged=false;private slowFrames=0;private adaptiveLow=false;private destroyed=false;
 constructor(svg:SVGSVGElement,callbacks:RendererCallbacks){
  this.svg=svg;this.cb=callbacks;
  this.svg.innerHTML=`<defs><radialGradient id='seaGlow'><stop stop-color='#123c49'/><stop offset='.68' stop-color='#0b2935'/><stop offset='1' stop-color='#071923'/></radialGradient><radialGradient id='portGlow'><stop stop-color='#b6925a' stop-opacity='.20'/><stop offset='1' stop-color='#b6925a' stop-opacity='0'/></radialGradient></defs><rect width='100%' height='100%' fill='url(#seaGlow)'/><g data-layer='sea'></g><g data-layer='world'></g><g data-layer='labels'><g data-layer='places'></g><g data-layer='hotspots'></g></g>`;
  this.sea=svg.querySelector('[data-layer=sea]')!;this.world=svg.querySelector('[data-layer=world]')!;this.labels=svg.querySelector('[data-layer=labels]')!;
  this.landLabels=this.labels.querySelector('[data-layer=places]')!;this.hotspotLabels=this.labels.querySelector('[data-layer=hotspots]')!;
  this.event=document.createElementNS(NS,'g');this.event.dataset.dynamic='event';this.threat=document.createElementNS(NS,'g');this.threat.dataset.dynamic='threat';
  for(let i=0;i<4;i++){const g=document.createElementNS(NS,'g');g.dataset.dynamic=i?'fleet':'ship';this.fleet.push(g);}
  for(let i=0;i<14;i++)this.terrainModels.push(island(i));
  for(const kind of ['ship','raft','wreck'] as const)for(const tied of [false,true])this.shipModels.set(kind+String(tied),ship(kind,tied));
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(svg);
  svg.addEventListener('pointerdown',this.pointerDown);svg.addEventListener('pointermove',this.pointerMove);svg.addEventListener('pointerup',this.pointerUp);svg.addEventListener('pointercancel',this.pointerCancel);
  svg.addEventListener('wheel',this.wheel,{passive:false});svg.addEventListener('keydown',this.keydown);document.addEventListener('visibilitychange',this.visibility);
  this.resize();this.raf=requestAnimationFrame(this.tick);
 }
 private fitZoom(){return Math.min(this.width/1460,this.height/1000)*.91;}
 private overviewCamera():Camera{return {target:V(0,0,106),yaw:-.17,elevation:.81,zoom:this.fitZoom()};}
 private sceneCamera(index:number):Camera {
  const p=chapters[index].position;const isPalace=index===14;
  const size=Math.min(this.width/(isPalace?225:365),this.height/(isPalace?210:300));
  return {target:add(p,V(0,isPalace?53:28,isPalace?-12:25)),yaw:isPalace?-.32:-.24,elevation:isPalace?.84:index===3?.47:.73,zoom:Math.min(size,isPalace?3.6:2.9)};
 }
 private resize(){
  if(this.destroyed)return;const rect=this.svg.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
  this.width=rect.width;this.height=rect.height;this.svg.setAttribute('viewBox',`0 0 ${this.width} ${this.height}`);
  if(this.overview)this.camera=this.overviewCamera();else this.camera.zoom=Math.min(this.camera.zoom,this.sceneCamera(this.state.index).zoom*1.5);
  this.dirty=true;
 }
 setState(state:RendererState){
  const old=this.state;this.state={...state};
  const changed=old.index!==state.index;
  if(changed){this.overview=false;this.beginFlight(this.sceneCamera(state.index),true,old.index);this.dirty=true;}
  else if(!old.started&&state.started||!old.follow&&state.follow){this.focus();}
  if(old.progress!==state.progress){if(this.flight&&this.flight.movingShip)this.finishFlight();this.shipPosition=this.eventShipPosition();this.dirty=true;}
  if(old.hotspot!==state.hotspot){this.dirty=true;if(state.hotspot!==null){const h=chapters[state.index].hotspots[state.hotspot];this.overview=false;this.beginFlight({target:add(chapters[state.index].position,h.offset),yaw:this.camera.yaw,elevation:state.index===3?.36:.7,zoom:Math.min(4.2,Math.min(this.width/160,this.height/150))},false,state.index);}}
  if(old.reduced!==state.reduced||old.paused!==state.paused){if((state.reduced||state.paused)&&this.flight)this.finishFlight();this.dirty=true;}
  if(old.quality!==state.quality||old.language!==state.language)this.dirty=true;
  this.svg.dataset.chapter=String(state.index+1);this.svg.dataset.motion=state.reduced?'reduced':state.paused?'paused':'running';
 }
 private eventShipPosition():Vec3 {
  const {index,progress}=this.state;if(index===9)return add(chapters[9].position,V(16+Math.sin(progress*Math.PI)*7,2,lerp(-85,105,progress)));
  return chapters[index].port;
 }
 private beginFlight(to:Camera,movingShip:boolean,fromIndex:number){
  const end=this.eventShipPosition();
  if(this.state.reduced||this.state.paused){this.flight=null;this.camera=to;if(movingShip)this.shipPosition=end;this.dirty=true;this.cb.onTransition(false);return;}
  this.flight={start:performance.now(),duration:1450,from:{...this.camera,target:{...this.camera.target}},to,shipFrom:{...this.shipPosition},shipTo:end,fromIndex,movingShip};this.cb.onTransition(true);this.dirty=true;
 }
 private finishFlight(){if(!this.flight)return;this.camera=this.flight.to;if(this.flight.movingShip)this.shipPosition=this.flight.shipTo;this.flight=null;this.dirty=true;this.cb.onTransition(false);}
 focus(){this.overview=false;this.beginFlight(this.sceneCamera(this.state.index),false,this.state.index);}
 command(cmd:'overview'|'focus'|'zoomIn'|'zoomOut'|'rotateLeft'|'rotateRight'|'skip'){
  if(cmd==='skip'){this.finishFlight();return;}
  if(cmd==='overview'){this.overview=true;this.beginFlight(this.overviewCamera(),false,this.state.index);return;}
  if(cmd==='focus'){this.focus();return;}
  this.cancelFlight();this.overview=false;
  if(cmd==='zoomIn'||cmd==='zoomOut')this.camera.zoom=clamp(this.camera.zoom*(cmd==='zoomIn'?1.3:1/1.3),this.fitZoom()*.6,5.5);
  if(cmd==='rotateLeft'||cmd==='rotateRight')this.camera.yaw=clamp(this.camera.yaw+(cmd==='rotateLeft'?-.12:.12),-.68,.37);
  this.cb.onExplore();this.dirty=true;
 }
 private cancelFlight(){if(this.flight){this.flight=null;this.cb.onTransition(false);}}
 private controls(a:Vec3,b:Vec3):[Vec3,Vec3] {
  const dx=b.x-a.x,dz=b.z-a.z;const side=Math.abs(dx)>Math.abs(dz);
  return side?[add(a,V(dx*.32,0,66)),add(b,V(-dx*.32,0,66))]:[add(a,V(a.x>0?135:-115,0,dz*.3)),add(b,V(b.x>0?135:-115,0,-dz*.3))];
 }
 private projectFace(f:Face):PathData|null {
  if(f.detail&&this.camera.zoom<.9)return null;if(f.detail&&(this.state.quality==='low'||this.state.quality==='auto'&&this.adaptiveLow)&&this.camera.zoom<1.5)return null;
  const pts=f.vertices.map(v=>project(v,this.camera,this.width,this.height));
  if(pts.every(p=>p.x<-80)||pts.every(p=>p.x>this.width+80)||pts.every(p=>p.y<-130)||pts.every(p=>p.y>this.height+130))return null;
  if(f.opacity===0)return null;
  let n=f.vertices.length>2&&!f.line?normal(f.vertices):V(0,1,0);
  if(!f.twoSided&&!f.line&&dot(n,viewDirection(this.camera))<-.02)return null;
  if(f.twoSided&&dot(n,viewDirection(this.camera))<0)n=V(-n.x,-n.y,-n.z);
  const color=f.unlit||f.line?f.color:shade(f.color,.68+.4*Math.max(0,dot(n,light)));
  const d=pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('')+(f.line?'':'Z');
  return {d,fill:f.line?'none':color,stroke:f.line?color:color,width:f.line?(f.width||1)*Math.min(1.7,Math.max(.6,this.camera.zoom)):(f.width??.65),opacity:f.opacity??1,depth:pts.reduce((s,p)=>s+p.depth,0)/pts.length+(f.bias||0)};
 }
 private pathMarkup(p:PathData):string{return `<path d='${p.d}' fill='${p.fill}' stroke='${p.stroke}' stroke-width='${p.width.toFixed(2)}' stroke-linecap='round' stroke-linejoin='round' opacity='${p.opacity}'/>`;}
 private modelData(model:Model):PathData[]{return model.map(f=>this.projectFace(f)).filter((x):x is PathData=>!!x).sort((a,b)=>a.depth-b.depth);}
 private drawSea(){
  const m:Model=[];const corners=[V(-800,-7,-635),V(810,-7,-635),V(810,-7,880),V(-800,-7,880)];
  m.push(face(corners,'#0b303d',{twoSided:true,unlit:true,opacity:.6}));
  for(let x=-760;x<=780;x+=100)m.push(line([V(x,0,-580),V(x,0,830)],'#74908a',.6,.08));
  for(let z=-580;z<=850;z+=100)m.push(line([V(-760,0,z),V(780,0,z)],'#74908a',.6,.08));
  for(let j=0;j<46;j++){
   const x=-680+(j*173)%1300,z=-500+(j*211)%1260;
   const ps=Array.from({length:14},(_,i)=>V(x+i*4,0,z+Math.sin(i*.32+j)*2));m.push(line(ps,'#8bb1a7',.65,.16));
  }
  // Engraved compass and navigation meridians are part of the same world plane.
  const cc=V(-650,.1,490);for(const r of [39,57,68])m.push(line(Array.from({length:65},(_,i)=>add(cc,V(Math.cos(i/64*Math.PI*2)*r,0,Math.sin(i/64*Math.PI*2)*r))),bronze,.7,.26));
  for(let i=0;i<8;i++){const a=i*Math.PI/4,l=i%2?39:66;const q=(r:number,t:number)=>add(cc,V(Math.sin(t)*r,0,Math.cos(t)*r));m.push(face([cc,q(9,a-.75),q(l,a)],bronze,{twoSided:true,unlit:true,opacity:i%2?.13:.3}),face([cc,q(l,a),q(9,a+.75)],'#799188',{twoSided:true,unlit:true,opacity:.16}));}
  let html=m.map(f=>this.projectFace(f)).filter((x):x is PathData=>!!x).map(p=>this.pathMarkup(p)).join('');
  for(let i=0;i<13;i++){
   const a=chapters[i].port,b=chapters[i+1].port,[c,d]=this.controls(a,b);const ps=Array.from({length:49},(_,j)=>project(cubic(a,c,d,b,j/48),this.camera,this.width,this.height));
   const path=ps.map((p,j)=>`${j?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
   html+=`<path data-route='${i}' d='${path}' stroke='${i<this.state.index?'#b6925a':'#82928a'}' stroke-width='${i<this.state.index?1.25:.8}' stroke-dasharray='${i<this.state.index?'4 5':'2 8'}' opacity='${i<this.state.index?.72:.36}' fill='none'/>`;
  }
  const loops=[{i:4,dx:105,dz:28},{i:6,dx:-100,dz:37}];
  for(const loop of loops){const p=chapters[loop.i].port;const pts=Array.from({length:44},(_,j)=>{const a=j/43*Math.PI*2;return add(p,V(Math.sin(a)*loop.dx,0,(1-Math.cos(a))*loop.dz));});const lineData=this.projectFace(line(pts,'#86aca3',.85,.38));if(lineData)html+=`<path d='${lineData.d}' fill='none' stroke='#86aca3' stroke-width='.7' stroke-dasharray='2 4' opacity='.5'/>`;}
  const sp=project(this.shipPosition,this.camera,this.width,this.height);
  html+=`<ellipse cx='${sp.x}' cy='${sp.y+3}' rx='${55*this.camera.zoom}' ry='${30*this.camera.zoom}' fill='url(#portGlow)'/>`;
  this.sea.innerHTML=html;
 }
 private drawStatic(){
  this.drawSea();let model=this.terrainModels.flat();
  for(const i of [0,3,6,7,9,14])if(i!==this.state.index)model=model.concat(eventModel(i,.22,0));
  const data=this.modelData(model);this.world.innerHTML=data.map(p=>this.pathMarkup(p)).join('');this.staticPaths=Array.from(this.world.children).map((node,i)=>({node,depth:data[i].depth}));
  this.svg.dataset.faces=String(data.length);this.svg.dataset.zoom=this.camera.zoom.toFixed(2);this.svg.dataset.yaw=this.camera.yaw.toFixed(2);
  this.drawLabels();this.dirty=false;
 }
 private placeDynamic(group:SVGGElement,model:Model,p:Vec3){
  const data=this.modelData(model);group.innerHTML=data.map(q=>this.pathMarkup(q)).join('');
  const d=project(p,this.camera,this.width,this.height).depth;let lo=0,hi=this.staticPaths.length;
  while(lo<hi){const mid=(lo+hi)>>1;if(this.staticPaths[mid].depth<d)lo=mid+1;else hi=mid;}
  this.world.insertBefore(group,this.staticPaths[lo]?.node||null);
 }
 private drawDynamic(){
  const index=this.state.index,p=this.state.progress,t=this.time;
  const event=eventModel(index,p,t);
  if(index===9){const level=chapters[index].position.y;this.placeDynamic(this.event,event.filter(f=>f.vertices.every(v=>v.y<level+30)),add(chapters[index].position,V(-49,-12,23)));this.placeDynamic(this.threat,event.filter(f=>f.vertices.some(v=>v.y>=level+30)),add(chapters[index].position,V(28,76,0)));}
  else {this.threat.remove();this.placeDynamic(this.event,event,add(chapters[index].position,V(0,index===3?68:40,index===3?14:12)));}
  let heading=-.1;
  if(this.flight?.movingShip){const fl=this.flight,s=clamp((performance.now()-fl.start)/fl.duration,0,1),[c,d]=this.controls(fl.shipFrom,fl.shipTo),tan=curveTangent(fl.shipFrom,c,d,fl.shipTo,smooth(s));heading=Math.atan2(tan.z,tan.x);}
  else if(index===9)heading=Math.PI/2;
  else if(index<13){const a=chapters[index].port,b=chapters[index+1].port,[c,d]=this.controls(a,b);const tangent=curveTangent(a,c,d,b,.05);heading=Math.atan2(tangent.z,tangent.x);}
  const kind=index===11?'raft':index===10&&p>.65?'wreck':'ship';
  const number=index<5?4:1;
  for(let i=0;i<4;i++){
   const g=this.fleet[i];if(i>=number){g.remove();continue;}
   const root=add(this.shipPosition,V(i?(i%2?27:-24):0,Math.sin(t*1.25+i)*.6,i?24+i*17:0));
   const model=transform(this.shipModels.get(kind+String(index===8))!,root,i?.52:.82,heading);
   const wake:Model=[];
   for(const side of [-1,1]){const path=Array.from({length:18},(_,j)=>V(-30-j*3,.2,side*(7+j*.7+Math.sin(t+j*.45)*.5)));wake.push(line(path,'#83b6af',.75,.32));}
   wake.push(face([V(-26,.1,-10),V(27,.1,-7),V(32,.1,0),V(19,.1,10),V(-22,.1,9)],'#06141f',{twoSided:true,unlit:true,opacity:.32}));
   this.placeDynamic(g,transform(wake,root,i?.52:.82,heading).concat(model),add(root,V(0,12,0)));
   if(!i){g.dataset.worldX=root.x.toFixed(2);g.dataset.worldZ=root.z.toFixed(2);g.dataset.kind=kind;}
  }
 }
 private drawLabels(){
  const chapters=getChapters(this.state.language);
  const occupied:{x:number;y:number;w:number}[]=[];let html='';
  const indices=[this.state.index,...chapters.map((_,i)=>i).filter(i=>i!==this.state.index&&i!==14&&!(this.state.index===14&&i===13))];
  for(const i of indices){const ch=chapters[i],selected=i===this.state.index;
   if(selected&&!this.overview&&this.camera.zoom>.85)continue;
   const anchor=add(ch.position,V(0,0,i===13||i===14?146:98));const p=project(anchor,this.camera,this.width,this.height);const w=ch.place.length*(this.state.language==='en'?7:10)+28;
   if(p.x<35||p.x>this.width-35||p.y<18||p.y>this.height-35)continue;
   if(!selected&&occupied.some(q=>Math.abs(q.x-p.x)<(q.w+w)/2+8&&Math.abs(q.y-p.y)<35))continue;
   occupied.push({x:p.x,y:p.y,w});
   html+=`<g data-place='${i}' role='button' tabindex='0' aria-label='${chapterLabel(this.state.language,ch.order)} ${escape(ch.title)}' class='map-label ${selected?'selected':''}' transform='translate(${p.x.toFixed(1)},${p.y.toFixed(1)})'><rect x='${-w/2}' y='-4' width='${w}' height='42' rx='6' fill='${selected?'#0a1c25':'#0a2531'}' opacity='${selected?.94:.75}'/><circle cy='-10' r='${selected?4.2:2}' fill='${selected?'#dfbc7d':'#9ab0a5'}'/><text text-anchor='middle' y='13' fill='${selected?'#ecddbd':'#c2cabc'}' font-size='${selected?13:11.5}'>${escape(ch.place)}</text>${selected?`<text text-anchor='middle' y='30' font-size='8.2' letter-spacing='2' fill='#b49e77'>${ch.english}</text>`:`<text text-anchor='middle' y='28' font-size='8.5' fill='#8c9d95'>${String(ch.order).padStart(2,'0')}</text>`}</g>`;
  }
  this.landLabels.innerHTML=html;html='';
  if(!this.overview&&this.camera.zoom>.8){chapters[this.state.index].hotspots.forEach((hotspot,i)=>{
   const p=project(add(chapters[this.state.index].position,hotspot.offset),this.camera,this.width,this.height);
   if(p.x<17||p.x>this.width-17||p.y<25||p.y>this.height-30)return;
   const dx=i===1?30:-30,dy=i===2?22:-26;
   html+=`<g data-hotspot='${i}' role='button' tabindex='0' aria-label='${escape(this.state.language==='en'?`Explore ${hotspot.title}`:`${hotspot.title} 탐색`)}' class='hotspot ${this.state.hotspot===i?'selected':''}' transform='translate(${(p.x+dx).toFixed(1)},${(p.y+dy).toFixed(1)})'><path d='M${-dx},${-dy}L0,0' fill='none' stroke='#b89b69' stroke-width='.65' opacity='.65' pointer-events='none'/><circle cx='${-dx}' cy='${-dy}' r='2' fill='#cdb487' pointer-events='none'/><circle r='19' fill='transparent'/><circle r='12' fill='#09232c' stroke='#bc9c69' stroke-width='.8'/><circle r='3' fill='#dbc39b'/><text y='-21' text-anchor='middle' font-size='10' fill='#ecdfc2' paint-order='stroke' stroke='#09232c' stroke-width='3'>${escape(hotspot.title)}</text></g>`;
  });}
  this.hotspotLabels.innerHTML=html;
 }
 private tick=(now:number)=>{
  if(this.destroyed)return;this.raf=requestAnimationFrame(this.tick);const elapsed=this.last?Math.min(now-this.last,100):16;this.last=now;
  if(!this.visible)return;
  const running=!this.state.paused&&!this.state.reduced;
  if(running)this.time+=elapsed/1000;
  if(this.flight){const f=this.flight,p=clamp((now-f.start)/f.duration,0,1),s=smooth(p);
   this.camera={target:mix(f.from.target,f.to.target,s),yaw:lerp(f.from.yaw,f.to.yaw,s),elevation:lerp(f.from.elevation,f.to.elevation,s),zoom:lerp(f.from.zoom,f.to.zoom,s)};
   if(f.movingShip){const [a,b]=this.controls(f.shipFrom,f.shipTo);this.shipPosition=cubic(f.shipFrom,a,b,f.shipTo,s);}
   this.dirty=true;if(p===1)this.finishFlight();
  }
  const interval=this.state.quality==='low'||this.state.quality==='auto'&&this.adaptiveLow?1000/28:1000/60;
  if(!this.dirty&&!running)return;if(now-this.lastDraw<interval&&!this.dirty)return;
  const begin=performance.now();if(this.dirty)this.drawStatic();this.drawDynamic();this.svg.dataset.renderedChapter=String(this.state.index+1);this.lastDraw=now;
  if(this.state.quality==='auto'){if(performance.now()-begin>30)this.slowFrames++;else this.slowFrames=Math.max(0,this.slowFrames-1);if(this.slowFrames>15&&!this.adaptiveLow){this.adaptiveLow=true;this.dirty=true;this.svg.dataset.quality='adaptive-low';}}
 };
 private pointerDown=(e:PointerEvent)=>{
  if(e.button!==0&&e.pointerType==='mouse')return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  this.svg.setPointerCapture(e.pointerId);
  if(this.pointers.size===1){this.press={x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY,shift:e.shiftKey,target:e.target as Element};this.dragged=false;}
  if(this.pointers.size===2){const [a,b]=Array.from(this.pointers.values());this.pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);this.dragged=true;}
 };
 private pointerMove=(e:PointerEvent)=>{
  if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(this.pointers.size===2){const [a,b]=Array.from(this.pointers.values()),dist=Math.hypot(a.x-b.x,a.y-b.y);if(this.pinchDistance>0)this.camera.zoom=clamp(this.camera.zoom*dist/this.pinchDistance,this.fitZoom()*.6,5.5);this.pinchDistance=dist;this.cancelFlight();this.overview=false;this.cb.onExplore();this.dirty=true;return;}
  if(!this.press)return;const p=this.press,dx=e.clientX-p.px,dy=e.clientY-p.py;
  if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>5)this.dragged=true;
  if(!this.dragged)return;this.cancelFlight();this.overview=false;this.cb.onExplore();
  if(p.shift)this.camera.yaw=clamp(this.camera.yaw+dx*.003,-.68,.37);
  else {const rx=dx/this.camera.zoom,rz=dy/(this.camera.zoom*Math.sin(this.camera.elevation)),co=Math.cos(this.camera.yaw),si=Math.sin(this.camera.yaw);this.camera.target=sub(this.camera.target,V(rx*co+rz*si,0,-rx*si+rz*co));this.camera.target.x=clamp(this.camera.target.x,-1050,1050);this.camera.target.z=clamp(this.camera.target.z,-850,1000);}
  p.px=e.clientX;p.py=e.clientY;this.dirty=true;
 };
 private pointerUp=(e:PointerEvent)=>{
  this.pointers.delete(e.pointerId);if(this.svg.hasPointerCapture(e.pointerId))this.svg.releasePointerCapture(e.pointerId);
  if(!this.dragged&&this.press){const target=this.press.target?.closest('[data-place],[data-hotspot]');if(target?.hasAttribute('data-place'))this.cb.onChapter(Number(target.getAttribute('data-place')));if(target?.hasAttribute('data-hotspot'))this.cb.onHotspot(Number(target.getAttribute('data-hotspot')));}
  if(!this.pointers.size)this.press=null;
 };
 private pointerCancel=(e:PointerEvent)=>{this.pointers.delete(e.pointerId);if(!this.pointers.size)this.press=null;};
 private wheel=(e:WheelEvent)=>{e.preventDefault();this.cancelFlight();this.overview=false;this.camera.zoom=clamp(this.camera.zoom*Math.exp(-e.deltaY*.0012),this.fitZoom()*.6,5.5);this.cb.onExplore();this.dirty=true;};
 private keydown=(e:KeyboardEvent)=>{if(e.key==='Enter'){const target=(e.target as Element).closest('[data-place],[data-hotspot]');if(target?.hasAttribute('data-place')){e.preventDefault();this.cb.onChapter(Number(target.getAttribute('data-place')));}else if(target?.hasAttribute('data-hotspot')){e.preventDefault();this.cb.onHotspot(Number(target.getAttribute('data-hotspot')));}}};
 private visibility=()=>{this.visible=!document.hidden;this.last=0;if(!this.visible&&this.flight)this.finishFlight();};
 destroy(){this.destroyed=true;cancelAnimationFrame(this.raf);this.observer.disconnect();this.svg.removeEventListener('pointerdown',this.pointerDown);this.svg.removeEventListener('pointermove',this.pointerMove);this.svg.removeEventListener('pointerup',this.pointerUp);this.svg.removeEventListener('pointercancel',this.pointerCancel);this.svg.removeEventListener('wheel',this.wheel);this.svg.removeEventListener('keydown',this.keydown);document.removeEventListener('visibilitychange',this.visibility);this.svg.innerHTML='';}
}
const bronze='#b6925a';
