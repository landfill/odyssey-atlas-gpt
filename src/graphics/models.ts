import { V, add, blend, lerp, seeded, type Vec3 } from './math';
import { animal, box, cylinder, ellipsoid, face, line, oriented, person, steps, temple, terrain, transform, tree, type Model } from './geometry';
import { chapters } from '../content/chapters';
const stone='#a69479',wood='#896543',bronze='#b6925a';

export function ship(kind:'ship'|'raft'|'wreck'='ship',tied=false,detail=true):Model {
 const out:Model=[];
 if(kind==='wreck'){
  for(let i=0;i<8;i++){out.push(...transform(box(V(-13,0,-1),26,1.4,2.3,i%2?'#79634a':'#a08059'),V(Math.sin(i*4)*17,1,Math.cos(i*3)*12),1,i*1.7));}
  return out;
 }
 if(kind==='raft'){
  for(let i=0;i<8;i++)out.push(...cylinder(V(-20,3,-13+i*3.5),V(20,3,-13+i*3.5),1.8,'#958063',7));
  for(const x of [-13,12])out.push(line([V(x,5,-15),V(x,5,15)],'#cfba8c',1.5));
 }else{
  const outline=[[-34,0],[-25,-8],[-12,-10],[8,-10],[26,-6],[35,0],[25,7],[7,10],[-14,10],[-27,7]];
  const levels=[{s:.52,y:1},{s:.84,y:4},{s:1,y:8},{s:1.04,y:11}];
  for(let l=0;l<levels.length-1;l++)for(let i=0;i<outline.length;i++){
   const j=(i+1)%outline.length,A=levels[l],B=levels[l+1];
   const p=(k:number,a:typeof A)=>V(outline[k][0]*a.s,a.y+Math.abs(outline[k][0])/34*2,outline[k][1]*a.s);
   out.push(oriented([p(i,A),p(j,A),p(j,B),p(i,B)],V(outline[i][0],0,outline[i][1]),l%2?'#976b40':'#775334'));
   out.push(line([p(i,B),p(j,B)],l===2?'#c7a16a':'#442f20',l===2?1.2:.65,.9,l===2?0:1));
  }
  out.push(oriented(outline.map(([x,z])=>V(x*.96,10.5,z*.93)),V(0,1,0),'#a9875a'));
  for(let x=-24;x<25;x+=5)out.push(line([V(x,10.7,-7),V(x,10.7,7)],'#634b33',.6,.8,1));
  out.push(line([V(29,11,0),V(35,18,0),V(38,22,0)],bronze,2));
  out.push(line([V(-29,11,0),V(-34,17,0),V(-32,22,0),V(-29,23,0)],bronze,1.8));
  for(let x=-22;x<23;x+=6)for(const s of [-1,1]){
   out.push(line([V(x,11,s*7),V(x-5,3,s*24)],'#ae9169',1,1,1));
   out.push(face([V(x-5,3,s*21),V(x-7,3,s*28),V(x-4.8,3,s*29),V(x-3,3,s*22)],'#aa885a',{twoSided:true,detail:1}));
  }
  if(detail)for(const x of [-16,-7,7,17])out.push(...person(V(x,11,2),.37,'#655245'));
 }
 out.push(...cylinder(V(-2,kind==='raft'?4:11,0),V(-2,51,0),.9,'#a78960',7,.55));
 out.push(line([V(-2,46,-21),V(-2,46,21)],'#b09872',1.8));
 // A square sail is subdivided into curved, wind-filled strips in world coordinates.
 for(let i=0;i<8;i++){
  const a=-20+i*5,b=a+5,bulge=(z:number,y:number)=>V(-2+Math.sin((z+20)/40*Math.PI)*Math.sin((y-19)/27*Math.PI)*7,y,z);
  for(let j=0;j<4;j++){const y=19+j*6.75;out.push(face([bulge(a,y),bulge(b,y),bulge(b,y+6.75),bulge(a,y+6.75)],i%2?'#d0bd94':'#ddceab',{twoSided:true}));}
  out.push(line([bulge(a,19),bulge(a,25.75),bulge(a,32.5),bulge(a,39.25),bulge(a,46)],'#8d8169',.4,.6,1));
 }
 for(const x of [-28,28])out.push(line([V(x,12,0),V(-2,51,0)],'#b8a782',.7,.8));
 for(const z of [-20,20])out.push(line([V(-2,46,z),V(18,12,z*.35)],'#b9aa88',.65,.9,1));
 if(tied){out.push(...person(V(-2,12,2),.65,'#b28c61'));for(const y of [18,22,26])out.push(line([V(-4,y,-1),V(-4,y,4),V(0,y,4),V(0,y,-1)],'#d5c2a0',.85));}
 return out;
}
function house(p:Vec3,w:number,h:number,d:number,c=stone):Model {
 const out=box(p,w,h,d,c);out.push(oriented([add(p,V(-1,h,-1)),add(p,V(w/2,h+7,-1)),add(p,V(w+1,h,-1))],V(0,0,-1),'#8f7661'));
 out.push(face([add(p,V(-1,h,-1)),add(p,V(-1,h,d+1)),add(p,V(w/2,h+7,d+1)),add(p,V(w/2,h+7,-1))],'#9c7960',{twoSided:true}),face([add(p,V(w/2,h+7,-1)),add(p,V(w/2,h+7,d+1)),add(p,V(w+1,h,d+1)),add(p,V(w+1,h,-1))],'#8b6b53',{twoSided:true}));
 out.push(face([add(p,V(w*.35,0,d+.1)),add(p,V(w*.65,0,d+.1)),add(p,V(w*.65,h*.65,d+.1)),add(p,V(w*.35,h*.65,d+.1))],'#423d32',{twoSided:true}));return out;
}
function wall(p:Vec3,length:number,height:number,axis:'x'|'z'='x'):Model {
 let out=box(V(0,0,0),length,height,6,stone);
 for(let x=0;x<length;x+=9)out.push(...box(V(x,height,0),5,5,6,'#b19d80'));
 for(let y=5;y<height;y+=5)out.push(line([V(0,y,6.1),V(length,y,6.1)],'#77654f',.6,.7,1));
 for(let x=4;x<length;x+=10)out.push(line([V(x,0,6.15),V(x,height,6.15)],'#736551',.5,.5,1));
 out=transform(out,p,1,axis==='x'?0:Math.PI/2);return out;
}
function horse(p:Vec3):Model {
 const out:Model=[...box(V(-12,14,-5),25,12,10,wood),...box(V(9,24,-4),7,14,8,wood),...box(V(10,35,-4),13,7,8,'#987349')];
 for(const x of [-8,9])for(const z of [-4,3])out.push(...box(V(x,1,z),3,15,3,'#6e5234'));
 for(const z of [-3,3])out.push(face([V(13,42,z),V(15,48,z),V(17,42,z)],'#b19567',{twoSided:true}));
 out.push(line([V(-11,24,0),V(-21,17,0),V(-20,9,0)],'#967754',2));
 for(let y=16;y<28;y+=4)out.push(line([V(-12,y,5.2),V(12,y,5.2)],'#503923',.65,.8,1));
 for(const x of [-10,12])out.push(...cylinder(V(x,2,-8),V(x,2,8),2,'#6c5136',8));return transform(out,p);
}
function cup(p:Vec3):Model {
 return [...cylinder(p,add(p,V(0,2,0)),5,bronze,10),...cylinder(add(p,V(0,2,0)),add(p,V(0,11,0)),1.4,bronze,8),...cylinder(add(p,V(0,11,0)),add(p,V(0,18,0)),2,bronze,12,7),...cylinder(add(p,V(0,18.1,0)),add(p,V(0,18.3,0)),5.6,'#6f9d83',12)];
}
function cave(p:Vec3,s=1):Model {
 const out:Model=[];
 out.push(face([V(-37,10,-10),V(37,10,-10),V(30,76,-10),V(0,93,-10),V(-30,76,-10)],'#111d22',{twoSided:true}));
 out.push(...terrain(V(-47,15,1),21,31,63,'#8d826e',201,12),...terrain(V(47,15,1),23,35,64,'#928571',207,12));
 for(let i=0;i<8;i++){
  const a=Math.PI*i/8,b=Math.PI*(i+1)/8;
  const pnt=(t:number,r:number,z:number)=>V(Math.cos(t)*r,35+Math.sin(t)*r,z);
  out.push(face([pnt(a,39,27),pnt(b,39,27),pnt(b,59,27),pnt(a,59,27)],'#9b8d75',{twoSided:true}),face([pnt(a,39,27),pnt(b,39,27),pnt(b,39,-8),pnt(a,39,-8)],'#5d6257',{twoSided:true}),face([pnt(a,59,-8),pnt(b,59,-8),pnt(b,59,27),pnt(a,59,27)],'#908770',{twoSided:true}));
 }
 return transform(out,p,s);
}
function palace():Model {
 const out:Model=[]; const p=V(0,43,-18),w=94,d=67;
 const shell=temple(p,w,d,35,'#c1ad88',true);shell.splice(4,1);out.push(...shell);
 out.push(...box(add(p,V(-w/2,5,-d/2)),w,25,4,'#b6a17e'));
 for(let row=0;row<9;row++)for(let col=0;col<12;col++){const x=-w/2+col*w/12,z=-d/2+row*d/9;const border=row===0||row===8||col===0||col===11;out.push(oriented([add(p,V(x,5,z)),add(p,V(x+w/12,5,z)),add(p,V(x+w/12,5,z+d/9)),add(p,V(x,5,z+d/9))],V(0,1,0),border?'#7b886f':(row+col)%2?'#a18f70':'#d3c09b',{width:.8}));}
 for(const x of [-45,38])out.push(...box(add(p,V(x,5,-30)),7,34,5,'#c6b392'));
 // Loom, warp threads and a partially woven textile.
 const loom=V(-32,49,-15);out.push(...box(loom,2,26,3,wood),...box(add(loom,V(21,0,0)),2,26,3,wood),...box(add(loom,V(0,24,0)),23,2,3,wood));
 for(let x=3;x<21;x+=2)out.push(line([add(loom,V(x,2,1.7)),add(loom,V(x,24,1.7))],'#dbceb1',.7,.9,1));
 out.push(face([add(loom,V(2,2,2)),add(loom,V(21,2,2)),add(loom,V(21,15,2)),add(loom,V(2,16,2))],'#9b6650',{twoSided:true}));
 for(let y=3;y<14;y+=3)out.push(line([add(loom,V(3,y,2.2)),add(loom,V(20,y,2.2))],'#c7a470',.8,1,1));
 out.push(...box(V(20,49,-44),21,7,16,'#8c7655'),...tree(V(35,49,-39),.63,'olive'));
 out.push(...person(V(-18,49,6),.75,'#b9a282'),...person(V(30,49,8),.75,'#a68666'));
 // Repeated open rings are a visual shorthand for the trial, not a factual item count.
 for(let i=0;i<7;i++){const x=-17+i*6;out.push(...box(V(x,49,12),2,7,2,'#957b52'));out.push(line([V(x-1,57,13),V(x,60,13),V(x+2,60,13),V(x+3,57,13),V(x-1,57,13)],bronze,.8,1,1));}
 return out;
}
export function island(index:number):Model {
 let m:Model=[];const rnd=seeded(712+index*31);
 const forest=(n:number,rangeX:number,rangeZ:number,y:number,type:'cypress'|'olive'|'palm'|'dead'='cypress')=>{for(let i=0;i<n;i++){const x=(rnd()-.5)*rangeX,z=(rnd()-.5)*rangeZ;if(Math.abs(x)<33&&Math.abs(z)<30)continue;m.push(...tree(V(x,y,z),.5+rnd()*.4,type));}};
 switch(index){
 case 0:
  m.push(...terrain(V(),105,75,22,'#8a8270',8),...wall(V(-68,23,-35),125,28),...wall(V(-70,23,-35),75,22,'z'),...wall(V(63,23,-35),43,26,'z'));
  for(const x of [-72,57])m.push(...box(V(x,23,-38),16,36,17,'#a39175'));
  m.push(...temple(V(22,23,-18),43,26,19,'#ae9a7d'),...horse(V(-14,23,15)),...steps(V(-32,3,66),52,7,2.8,4));
  for(let i=0;i<5;i++)m.push(...house(V(-45+i*18,23,-56+(i%2)*8),12,10,12));break;
 case 1:
  m.push(...terrain(V(),88,64,19,'#9b9179',27));
  for(let i=0;i<8;i++)m.push(...house(V(-57+(i%4)*27,20,-35+Math.floor(i/4)*29),19,12+(i%3)*4,17,'#b3a38a'));
  m.push(...wall(V(-54,20,35),32,12),...wall(V(15,20,35),43,10));
  for(let i=0;i<8;i++)m.push(...box(V(-20+i*7,20,40+(i%2)*7),5,4+(i%3)*2,5,'#ad987d'));break;
 case 2:
  m.push(...terrain(V(),99,59,10,'#b4ac84',70));forest(7,150,70,11,'palm');
  for(let i=0;i<19;i++){
   const p=V((rnd()-.5)*112,12,(rnd()-.5)*55);m.push(...cylinder(p,add(p,V(0,.8,0)),5,'#60846b',9));
   for(let j=0;j<5;j++){const a=j/5*Math.PI*2;m.push(face([add(p,V(0,1,0)),add(p,V(Math.cos(a-.3)*3,2,Math.sin(a-.3)*3)),add(p,V(Math.cos(a)*4.5,7,Math.sin(a)*4.5)),add(p,V(Math.cos(a+.3)*3,2,Math.sin(a+.3)*3))],'#cfad9b',{twoSided:true}));}
  }break;
 case 3:
  m.push(...terrain(V(),97,79,16,'#928771',203),...terrain(V(0,14,-43),73,37,75,'#84816d',209,18));
  // Interior giant and sheep are painted with the same global depth sorter as the foreground arch.
  m.push(...person(V(0,17,-2),3.25,'#8f856d'),...ellipsoid(V(0,66,0),14,17,13,'#958873',12,6));
  m.push(face([V(-6,68,12.2),V(0,71,13),V(6,68,12.2),V(0,65,13)],'#d6c192',{twoSided:true}));
  m.push(...cave(V(0,12,0),.92));
  for(let i=0;i<7;i++)m.push(...animal(V(-33+i*10,17,35+(i%3)*10),.95));break;
 case 4:
  m.push(...terrain(V(),88,77,30,'#9c9172',98,24));
  for(let i=0;i<14;i++){
   const a=i/14*Math.PI*2,b=(i+1)/14*Math.PI*2;const p=(q:number,y:number,r:number)=>V(Math.cos(q)*r,y,Math.sin(q)*r);
   m.push(face([p(a,31,58),p(b,31,58),p(b,56,58),p(a,56,58)],'#9b875e',{twoSided:true}));
   m.push(...box(V(Math.cos(a)*58-3,56,Math.sin(a)*58-3),6,5,6,bronze));
  }
  m.push(...temple(V(0,31,-12),48,31,20,'#b39f78'),...ellipsoid(V(0,40,28),9,12,8,'#a57c4e',10,5),...cylinder(V(0,49,28),V(0,53,28),3,'#5c5945',7));break;
 case 5:
  // A true open horseshoe inlet, not a recoloured generic island.
  m.push(...terrain(V(-66,0,-3),34,84,55,'#827f6d',503,18),...terrain(V(66,0,-3),33,78,65,'#939078',511,18),...terrain(V(0,0,-62),77,27,58,'#8e876d',541,18));
  m.push(...person(V(52,68,-27),3.1,'#8a846c'),...person(V(-55,57,-21),2.7,'#777862'));
  for(let i=0;i<3;i++)m.push(...transform(ship('wreck'),V(-20+i*23,2,45+i*17),.7,i));break;
 case 6:
  m.push(...terrain(V(),110,91,22,'#69795e',601,28),...terrain(V(0,21,-14),56,48,9,'#718064',619,20));forest(22,181,130,25);
  m.push(...temple(V(0,31,-17),56,40,29,'#a7ae8f'),...steps(V(-25,22,31),50,4,2.3,5));
  for(let i=0;i<6;i++){const p=V(-51+(i%2)*15,23,16+Math.floor(i/2)*12);m.push(...box(p,11,2,8,'#7c9271'));for(let j=0;j<3;j++)m.push(...cylinder(add(p,V(2+j*3,2,3)),add(p,V(2+j*3,8,3)),1.7,'#8ea286',5,0));}
  m.push(...cup(V(26,25,26)));break;
 case 7:
  m.push(...terrain(V(-17,0,-11),87,58,23,'#7f8580',701,23),...terrain(V(-59,15,-29),27,34,57,'#747c76',710,13),...terrain(V(45,12,-32),25,30,68,'#707972',712,13));forest(10,146,91,24,'dead');
  m.push(...box(V(-25,24,0),9,36,9,'#8a9085'),...box(V(19,24,0),9,42,9,'#96998b'),...box(V(-25,60,0),33,5,9,'#999d8e'));
  for(let i=0;i<6;i++)m.push(...box(V(-23+i*8,2,71),5,2,12,'#455859'));break;
 case 8:
  for(let i=0;i<3;i++){const x=-53+i*50,z=i%2?28:-13;m.push(...terrain(V(x,0,z),25,23,25+i*9,'#989482',803+i,14),...terrain(V(x,25+i*9,z-3),12,12,18,'#a19b86',811+i,10),...person(V(x,44+i*9,z),.8,'#b9af94'));for(const s of [-1,1])m.push(face([V(x,52+i*9,z),V(x+s*20,66+i*9,z-5),V(x+s*11,49+i*9,z+3)],'#b3ab91',{twoSided:true}));}break;
 case 9:
  m.push(...terrain(V(63,0,-8),33,76,64,'#898877',920,20),...terrain(V(66,61,-24),23,31,34,'#92917c',930,14));
  break;
 case 10:
  m.push(...terrain(V(),102,70,19,'#a4a077',1001,26));
  for(let i=0;i<8;i++)m.push(...animal(V(-47+(i%4)*23,20,10+Math.floor(i/4)*24),1.2,'cow'));
  m.push(...cylinder(V(24,20,-17),V(24,26,-17),21,'#baa77b',20),...cylinder(V(24,26,-17),V(24,28,-17),16,bronze,20));
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;m.push(line([V(24+Math.cos(a)*9,28.2,-17+Math.sin(a)*9),V(24+Math.cos(a)*15,28.2,-17+Math.sin(a)*15)],'#e2c586',1.2));}
  forest(5,147,90,20,'olive');break;
 case 11:
  m.push(...terrain(V(),101,78,18,'#7d8e6e',1101,28),...terrain(V(0,17,-27),48,35,33,'#899780',1104,19));forest(20,166,122,19,'olive');
  m.push(...transform(cave(V()),V(2,17,-10),.48));
  m.push(...cylinder(V(-43,19,24),V(-43,19.5,24),17,'#477e79',18),...tree(V(-63,18,15),.75,'palm'),...person(V(10,19,41),.9,'#c5b193'));break;
 case 12:
  m.push(...terrain(V(),114,72,20,'#a6a38a',1201,28),...temple(V(0,21,-20),72,41,32,'#d1c8ad'));
  m.push(...box(V(-70,7,64),137,6,16,'#b4b39b'),...box(V(-40,7,66),12,6,70,'#aaa894'),...box(V(34,7,64),12,6,66,'#a6a78f'));
  for(let i=0;i<5;i++)m.push(...house(V(-65+i*27,21,23),19,14,20,'#c5bea3'));
  m.push(...steps(V(-31,8,47),61,5,2.5,4));break;
 case 13:
  m.push(...terrain(V(),135,112,21,'#a29b79',1301,32),...terrain(V(0,20,-22),88,68,22,'#a09876',1312,26),...palace());
  m.push(...steps(V(-20,3,103),31,7,2.6,5),...steps(V(-16,21,65),26,8,2.65,4));
  for(let i=0;i<6;i++)m.push(...tree(V((i%2?-1:1)*(65+i*6),22,-40+i*19),.55+(i%2)*.1,'olive'));
  m.push(...house(V(-89,21,28),26,15,21,'#b1a481'),...house(V(64,21,19),28,19,24,'#b2a380'));break;
 }
 return transform(m,chapters[index].position);
}

/** Time-dependent geometry. Only this small model is rebuilt during a frame. */
export function eventModel(index:number,progress:number,time:number):Model {
 const p=progress,t=time,out:Model=[];const origin=chapters[index].position;
 const flame=(x:number,y:number,z:number,s:number)=>{for(let j=0;j<3;j++){const h=(15+Math.sin(t*2+j+x)*3)*s;out.push(face([V(x-4*s,y,z+j),V(x-2*s,y+h*.7,z+j),V(x+Math.sin(t+j)*3*s,y+h,z+j),V(x+4*s,y,z+j)],j?'#cb8954':'#b9603f',{twoSided:true,unlit:true,opacity:.65}));}};
 if(index===0){flame(-43,51,-34,.7+p*.5);flame(44,47,-31,.55+p*.4);flame(9,38,-55,.6);}
 if(index===1){flame(37,23,43,.25+p*.65);}
 if(index===2||index===11||index===13){
  for(let j=0;j<3;j++){const x=-65+(t*3+j*51+p*70)%140;const vs=Array.from({length:17},(_,i)=>V(x+i*5,9+j*4,45+Math.sin(i*.34+j)*9));out.push(line(vs,'#bfd0bc',2,.12));}
 }
 if(index===3){
  out.push(...ellipsoid(V(39+p*16,33,30+p*5),16,21,14,'#a49b83',10,6));
  out.push(...ellipsoid(V(Math.sin(t*.55)*2,68,13.3),2.3,2.8,1.2,'#433726',8,4));
  const trail=Array.from({length:15},(_,i)=>V(-25+i*5,18,24+i*4+p*6));out.push(line(trail,'#c9b988',1.2,.4));
 }
 if(index===4){
  for(let j=0;j<6;j++){const vs=Array.from({length:24},(_,i)=>{const a=i*.19+j*.9+t*.14;const r=10+i*(.8+p*3);return V(Math.cos(a)*r,45+Math.sin(i*.15)*18+p*i,28+Math.sin(a)*r);});out.push(line(vs,'#b7c7ad',.8,.15+p*.3));}
 }
 if(index===5){out.push(...ellipsoid(V(46-35*p,105-92*p,-25+116*p),8,7,9,'#96937c',9,4));}
 if(index===6){
  const q=p<.2?0:p>.8?1:(p-.2)/.6; const base=V(27,25,43);
  out.push(...ellipsoid(add(base,V(0,lerp(8,4,q),0)),lerp(2.8,5.8,q),lerp(6,3.5,q),lerp(2,3,q),blend('#b5b697','#a08e74',q),9,5));
  out.push(...ellipsoid(add(base,V(q*5,lerp(16,6,q),0)),lerp(2.4,3,q),lerp(2.5,2.6,q),2.2,'#b1a389',8,4));
  for(const sign of [-1,1])out.push(...cylinder(add(base,V(sign*1.3,0,sign*1.1)),add(base,V(sign*lerp(1.3,3,q),lerp(7,4,q),sign*1.1)),.8,'#8c8369',5));
  out.push(...cylinder(V(26,43.6,26),V(26,43.8,26),5.7,blend('#739b83','#bbbd91',p),12));
 }
 if(index===7){for(let i=0;i<3;i++){const model=person(V(-29+i*27,25+Math.sin(t+i)*4,20+i*7),1.2,'#bcc6b7');out.push(...model.map(f=>({...f,opacity:.18+p*.35,unlit:true})));}}
 if(index===8){for(let j=0;j<4;j++){const r=20+j*17+(t*4)%17+p*24;const arc=Array.from({length:23},(_,i)=>V(-31+Math.cos(-.2+i*.075)*r,5,7+Math.sin(-.2+i*.075)*r));out.push(line(arc,'#cad0b5',.8,.23));}}
 if(index===9){
  for(let i=0;i<6;i++){const reach=Math.sin(p*Math.PI),z=-39+i*13,x=48;const neck=[V(x,66,z),V(x-13-reach*4,86+i%3*5,z-3),V(x-25-reach*9,83+i%3*5-reach*5,z+3),V(x-26-reach*14,70+i%3*4-reach*13,z+9+reach*5)];for(let j=0;j<neck.length-1;j++)out.push(...cylinder(neck[j],neck[j+1],3.5-j*.6,'#677567',7));out.push(...ellipsoid(neck[3],5,4,6,'#7b8069',8,4));}
  const cx=-49,cz=23;const depth=25+p*29;
  for(let k=0;k<13;k++){
   const r=3+k*3.2,r2=r+3.2,y=-depth*(1-(r/46)**.7),y2=-depth*(1-(r2/46)**.7);
   for(let j=0;j<22;j++){const a=j/22*Math.PI*2,b=(j+1)/22*Math.PI*2;out.push(face([V(cx+Math.cos(a)*r,y,cz+Math.sin(a)*r),V(cx+Math.cos(b)*r,y,cz+Math.sin(b)*r),V(cx+Math.cos(b)*r2,y2,cz+Math.sin(b)*r2),V(cx+Math.cos(a)*r2,y2,cz+Math.sin(a)*r2)],blend('#06141f','#376869',k/15),{twoSided:true,unlit:true}));}
  }
  for(let j=0;j<5;j++){const spiral=Array.from({length:65},(_,i)=>{const a=i*.17+j*1.26-t*.2,r=3+i*.67;return V(cx+Math.cos(a)*r,-depth*(1-(r/46)**.7)+.5,cz+Math.sin(a)*r);});out.push(line(spiral,'#86b1a6',.8,.42));}
 }
 if(index===10&&p>.6){out.push(line([V(-24,151,-20),V(-9,116,-14),V(-23,115,-12),V(9,73,5)],'#d0bc88',1.3,.65));}
 if(index===12){for(let i=0;i<3;i++)out.push(line([V(-38+i*34,1,108),V(-34+i*34,1,120+p*35)],'#c7b385',1,.2+p*.2));}
 if(index===14){
  const x=12,y=58,z=14,bow=[V(x,y-13,z),V(x+6,y-6,z),V(x+7,y+4,z),V(x,y+15,z)];out.push(line(bow,bronze,1.5));
  const pull=p<.55?p/.55:1-(p-.55)/.45;
  out.push(line([bow[0],V(x-9*pull,y,z),bow[3]],'#e0ca9a',.7));
  const ax=p<.6?x-9*pull:x+(p-.6)*160;
  out.push(line([V(ax-16,y,z),V(ax+14,y,z)],'#d9c38e',1.1));out.push(face([V(ax+14,y,z),V(ax+9,y-2,z),V(ax+9,y+2,z)],'#d9c38e',{twoSided:true,unlit:true}));
 }
 return transform(out,origin);
}
