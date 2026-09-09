import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
export function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){
 const panel=useRef<HTMLDivElement|null>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  panel.current?.querySelector<HTMLElement>('button,input,select,[tabindex="0"]')?.focus();
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();close.current();}
   if(event.key==='Tab'){
    const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select,[tabindex="0"],summary')||[]);
    const first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',key);return ()=>{document.removeEventListener('keydown',key);previous?.focus();};
 },[]);
 return <div className='modal-backdrop' onClick={(event:{target:EventTarget;currentTarget:EventTarget})=>{if(event.target===event.currentTarget)onClose();}}><div className={`modal ${wide?'wide':''}`} role='dialog' aria-modal='true' aria-label={title} ref={panel}><div className='modal-header'><h2>{title}</h2><button className='icon-button' onClick={onClose} aria-label='닫기'><Icon name='close'/></button></div><div className='modal-body'>{children}</div></div></div>;
}
