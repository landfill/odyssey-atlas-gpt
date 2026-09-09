import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { AtlasRenderer, type RendererState, type RendererCallbacks } from '../graphics/renderer';
export type WorldCommand='overview'|'focus'|'zoomIn'|'zoomOut'|'rotateLeft'|'rotateRight'|'skip';
export interface WorldHandle {command:(command:WorldCommand)=>void}
export const World=forwardRef<WorldHandle,{state:RendererState;callbacks:RendererCallbacks}>(function World({state,callbacks},ref){
 const svg=useRef<SVGSVGElement|null>(null),renderer=useRef<AtlasRenderer|null>(null),latest=useRef(callbacks);
 latest.current=callbacks;
 useImperativeHandle(ref,()=>({command:(command)=>renderer.current?.command(command)}),[]);
 useEffect(()=>{
  if(!svg.current)return;const engine=new AtlasRenderer(svg.current,{onChapter:i=>latest.current.onChapter(i),onHotspot:i=>latest.current.onHotspot(i),onExplore:()=>latest.current.onExplore(),onTransition:active=>latest.current.onTransition(active)});
  renderer.current=engine;engine.setState(state);return ()=>{engine.destroy();renderer.current=null;};
 },[]);
 useEffect(()=>{renderer.current?.setState(state);},[state]);
 return <svg ref={svg} className='world-svg' role='group' aria-label='SVG 입체 항해 지도. 장소를 선택하거나 드래그하여 이동. 확대와 시점 회전 버튼으로 조작.' tabIndex={0}/>;
});
