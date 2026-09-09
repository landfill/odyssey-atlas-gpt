/** Orthographic world: x/east, y/up, z/south. Larger camera depth is nearer. */
export interface Vec3 { x: number; y: number; z: number }
export interface Camera { target: Vec3; yaw: number; elevation: number; zoom: number }
export interface Projected { x: number; y: number; depth: number }
export const V = (x=0,y=0,z=0): Vec3 => ({x,y,z});
export const add = (a:Vec3,b:Vec3):Vec3 => V(a.x+b.x,a.y+b.y,a.z+b.z);
export const sub = (a:Vec3,b:Vec3):Vec3 => V(a.x-b.x,a.y-b.y,a.z-b.z);
export const mul = (a:Vec3,s:number):Vec3 => V(a.x*s,a.y*s,a.z*s);
export const dot = (a:Vec3,b:Vec3):number => a.x*b.x+a.y*b.y+a.z*b.z;
export const cross = (a:Vec3,b:Vec3):Vec3 => V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
export const normalize = (a:Vec3):Vec3 => mul(a,1/(Math.hypot(a.x,a.y,a.z)||1));
export const lerp = (a:number,b:number,t:number):number => a+(b-a)*t;
export const mix = (a:Vec3,b:Vec3,t:number):Vec3 => V(lerp(a.x,b.x,t),lerp(a.y,b.y,t),lerp(a.z,b.z,t));
export const clamp = (n:number,a:number,b:number):number => Math.max(a,Math.min(b,n));
export const smooth = (t:number):number => t*t*(3-2*t);
export const rotateY = (p:Vec3,a:number):Vec3 => V(p.x*Math.cos(a)-p.z*Math.sin(a),p.y,p.x*Math.sin(a)+p.z*Math.cos(a));
export const mean = (p:Vec3[]):Vec3 => mul(p.reduce((a,b)=>add(a,b),V()),1/p.length);
export function project(p:Vec3,c:Camera,w:number,h:number):Projected {
 const q=sub(p,c.target),co=Math.cos(c.yaw),si=Math.sin(c.yaw),ce=Math.cos(c.elevation),se=Math.sin(c.elevation);
 const rx=q.x*co-q.z*si,rz=q.x*si+q.z*co;
 return {x:w*.5+rx*c.zoom,y:h*.5+(rz*se-q.y*ce)*c.zoom,depth:rz*ce+q.y*se};
}
export function viewDirection(c:Camera):Vec3 {return V(Math.sin(c.yaw)*Math.cos(c.elevation),Math.sin(c.elevation),Math.cos(c.yaw)*Math.cos(c.elevation));}
export const normal = (vs:Vec3[]):Vec3 => normalize(cross(sub(vs[1],vs[0]),sub(vs[2],vs[0])));
export function shade(hex:string,f:number):string {
 const s=hex.replace('#',''); const n=parseInt(s,16);const ch=(shift:number)=>Math.round(clamp(((n>>shift)&255)*f,0,255));
 return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
export function blend(a:string,b:string,t:number):string {
 const an=parseInt(a.replace('#',''),16),bn=parseInt(b.replace('#',''),16);
 return '#'+[16,8,0].map(s=>Math.round(lerp((an>>s)&255,(bn>>s)&255,t)).toString(16).padStart(2,'0')).join('');
}
export function seeded(seed:number):()=>number { let a=seed>>>0; return ()=>{a=(Math.imul(1664525,a)+1013904223)>>>0;return a/4294967296;}; }
export function cubic(a:Vec3,b:Vec3,c:Vec3,d:Vec3,t:number):Vec3 {const u=1-t;return add(add(mul(a,u*u*u),mul(b,3*u*u*t)),add(mul(c,3*u*t*t),mul(d,t*t*t)));}
export function curveTangent(a:Vec3,b:Vec3,c:Vec3,d:Vec3,t:number):Vec3 {return add(add(mul(sub(b,a),3*(1-t)*(1-t)),mul(sub(c,b),6*(1-t)*t)),mul(sub(d,c),3*t*t));}
