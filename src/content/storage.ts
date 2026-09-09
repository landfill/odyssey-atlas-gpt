export interface SavedState {index:number;started:boolean;paused:boolean;reduced:boolean;quality:'auto'|'high'|'low';visited:number[]}
const KEY='odyssey-atlas-v1';
const defaults:SavedState={index:0,started:false,paused:false,reduced:false,quality:'auto',visited:[0]};
export function loadState():SavedState{
 try{
  const raw=localStorage.getItem(KEY);if(!raw)return {...defaults};const parsed:unknown=JSON.parse(raw);
  if(!parsed||typeof parsed!=='object')return {...defaults};const value=parsed as Record<string,unknown>;
  const index=typeof value.index==='number'&&Number.isInteger(value.index)&&value.index>=0&&value.index<15?value.index:0;
  const visited=Array.isArray(value.visited)?value.visited.filter((v):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<15):[];
  return {index,started:value.started===true,paused:value.paused===true,reduced:value.reduced===true,quality:value.quality==='high'||value.quality==='low'?value.quality:'auto',visited:[...new Set([index,...visited])]};
 }catch{return {...defaults};}
}
export function saveState(state:SavedState):boolean {try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
