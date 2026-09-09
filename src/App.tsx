import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chapters, parallelStories } from './content/chapters';
import { loadState, saveState } from './content/storage';
import { World, type WorldHandle, type WorldCommand } from './components/World';
import { Icon, type IconName } from './components/Icon';
import { Modal } from './components/Modal';
import { Artifact } from './components/Artifact';
import type { RendererState } from './graphics/renderer';
const initial=loadState();
export default function App(){
 const [index,setIndex]=useState(initial.index),[started,setStarted]=useState(initial.started),[mode,setMode]=useState<'story'|'explore'>('story');
 const [paused,setPaused]=useState(initial.paused),[reduced,setReduced]=useState(initial.reduced),[systemReduced,setSystemReduced]=useState(false),[quality,setQuality]=useState(initial.quality);
 const [progress,setProgress]=useState(.15),[hotspot,setHotspot]=useState<number|null>(null),[visited,setVisited]=useState(initial.visited);
 const [settings,setSettings]=useState(false),[list,setList]=useState(false),[sources,setSources]=useState(false),[parallel,setParallel]=useState<'penelope'|'telemachus'|null>(null),[reset,setReset]=useState(false);
 const [sheet,setSheet]=useState(false),[auto,setAuto]=useState(false),[transition,setTransition]=useState(false),[storageAvailable,setStorageAvailable]=useState(true);
 const world=useRef<WorldHandle|null>(null),timeline=useRef<HTMLDivElement|null>(null),story=useRef<HTMLDivElement|null>(null);
 const chapter=chapters[index],motionReduced=systemReduced||reduced;
 const navigate=useCallback((i:number)=>{if(i<0||i>=chapters.length)return;setIndex(i);setStarted(true);setProgress(.15);setHotspot(null);setList(false);setVisited(v=>v.includes(i)?v:[...v,i]);story.current?.scrollTo({top:0});},[]);
 const openHotspot=useCallback((i:number)=>{setHotspot(i);setStarted(true);if(i===0&&[4,6].includes(index))setProgress(.8);},[index]);
 const explore=useCallback(()=>{setMode('explore');setAuto(false);},[]);
 const callbacks=useMemo(()=>({onChapter:navigate,onHotspot:openHotspot,onExplore:explore,onTransition:setTransition}),[navigate,openHotspot,explore]);
 const renderState:RendererState=useMemo(()=>({index,started,follow:mode==='story',paused,reduced:motionReduced,progress,quality,hotspot}),[index,started,mode,paused,motionReduced,progress,quality,hotspot]);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');setSystemReduced(query.matches);const update=()=>setSystemReduced(query.matches);query.addEventListener('change',update);return ()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>{setStorageAvailable(saveState({index,started,paused,reduced,quality,visited}));},[index,started,paused,reduced,quality,visited]);
 useEffect(()=>{timeline.current?.querySelector<HTMLElement>(`[data-timeline='${index}']`)?.scrollIntoView({behavior:motionReduced?'instant':'smooth',block:'nearest',inline:'nearest'});},[index,motionReduced]);
 useEffect(()=>{
  if(!auto||paused||motionReduced||settings||list||sources||parallel||reset||transition)return;
  const id=setInterval(()=>{if(document.hidden)return;if(index<14)navigate(index+1);else setAuto(false);},11000);return ()=>clearInterval(id);
 },[auto,paused,motionReduced,index,navigate,settings,list,sources,parallel,reset,transition]);
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{
   const el=event.target as HTMLElement;
   if(settings||list||sources||parallel||reset)return;
   if(event.key==='Escape'){setHotspot(null);setSheet(false);return;}
   if(el.matches('input,select,textarea')||el.isContentEditable)return;
   if(event.key==='ArrowRight'){event.preventDefault();navigate(index+1);}
   if(event.key==='ArrowLeft'){event.preventDefault();navigate(index-1);}
   if(event.code==='Space'&&!el.closest('button,summary')){event.preventDefault();setPaused(p=>!p);}
  };document.addEventListener('keydown',onKey);return ()=>document.removeEventListener('keydown',onKey);
 },[index,navigate,settings,list,sources,parallel,reset]);
 const command=(c:WorldCommand)=>world.current?.command(c);
 const follow=()=>{setMode('story');setStarted(true);command('focus');};
 const start=()=>{setMode('story');setStarted(true);command('focus');};
 const restart=()=>{setAuto(false);setPaused(false);setStarted(false);setIndex(0);setMode('story');setHotspot(null);setProgress(.15);setVisited([0]);setReset(false);setSheet(false);setTimeout(()=>command('overview'),0);};
 const controls:{cmd:WorldCommand;icon:IconName;label:string}[]=[{cmd:'zoomIn',icon:'plus',label:'확대'},{cmd:'zoomOut',icon:'minus',label:'축소'},{cmd:'rotateLeft',icon:'rotateLeft',label:'시점 왼쪽 회전'},{cmd:'rotateRight',icon:'rotateRight',label:'시점 오른쪽 회전'},{cmd:'overview',icon:'compass',label:'전체 지도'}];
 return <div className={`atlas-app ${motionReduced?'reduced-motion':''} ${paused?'is-paused':''}`} data-mode={mode}>
  <a className='skip-link' href='#story'>이야기로 이동</a>
  <header className='app-header'>
   <button className='brand' aria-label='ODYSSEY 전체 지도' onClick={()=>command('overview')}><span className='brand-mark'><Icon name='ship' size={26}/></span><span><span className='brand-title'>ODYSSEY</span><span className='brand-subtitle'>귀환의 항해</span></span></button>
   <div className='header-center'><span className='tiny-diamond'/><span>열다섯 개의 장, 하나의 귀환</span><span className='tiny-diamond'/></div>
   <div className='header-actions'><button className='text-button journey-button' onClick={()=>setList(true)}><Icon name='menu' size={16}/><span>여정 목록</span></button><span className='header-divider'/><button className='icon-button' aria-label='설정' title='설정' onClick={()=>setSettings(true)}><Icon name='settings' size={19}/></button></div>
  </header>
  <main className='experience'>
   <section className='map-stage' aria-label='입체 세계 탐색'>
    <World ref={world} state={renderState} callbacks={callbacks}/>
    <div className='map-heading'><div className='eyebrow'><span/>호메로스의 세계</div><h1>{started?chapter.place:'귀환의 항해'}</h1><p>{started?chapter.theme:'바다에 새겨진, 집으로 가는 길'}</p></div>
    <div className='map-status'><span className={`mode-indicator ${mode==='explore'?'explore':''}`}/>{mode==='story'?'스토리 모드':'자유 탐색'}<span className='mode-divider'/><span className='discovery-count'>{String(new Set(visited).size).padStart(2,'0')} / 15</span></div>
    <div className='map-edge-compass' aria-hidden='true'><span>북</span><svg width='42' height='46' viewBox='0 0 42 46'><path d='M21 4 25 33 21 29 17 33Z' fill='#bda77e'/><path d='M21 39V4 M8 23h26' stroke='#70878a' strokeWidth='.6'/><circle cx='21' cy='23' r='15' fill='none' stroke='#7a918e' strokeWidth='.6'/></svg></div>
    {!started?<div className='entry-actions'><button className='primary-button' onClick={start}><Icon name='ship' size={18}/>항해 시작<Icon name='arrowRight' size={17}/></button><button className='secondary-button' onClick={()=>{setStarted(true);setMode('explore');}}>자유 탐색</button></div>:<div className='map-bottom-actions'><button className='follow-button' onClick={follow}><Icon name='target' size={15}/>항해 따라가기</button>{transition&&<button className='skip-flight' onClick={()=>command('skip')}><Icon name='skip' size={13}/>이동 건너뛰기</button>}</div>}
    <div className='map-controls' aria-label='지도 조작'>{controls.map(item=><button key={item.cmd} className='map-control' title={item.label} aria-label={item.label} onClick={()=>command(item.cmd)}><Icon name={item.icon} size={17}/></button>)}</div>
    <div className='map-guide'><span className='desktop-hint'>드래그로 이동<span>·</span>휠로 확대<span>·</span>Shift + 드래그로 회전</span><span className='mobile-hint'>드래그로 이동 · 두 손가락으로 확대</span></div>
    <div className='map-watermark' aria-hidden='true'>ODYSSEY</div>
   </section>
   <aside id='story' className={`story-panel ${sheet?'sheet-expanded':''}`} aria-label='현재 장 이야기'>
    <button className='sheet-toggle' onClick={()=>setSheet(s=>!s)} aria-label={sheet?'이야기 접기':'이야기 펼치기'} aria-expanded={sheet}><span className='sheet-handle'/><span>{sheet?'이야기 접기':'이야기 펼치기'}</span><Icon name='chevron' size={15}/></button>
    <div className='story-top'><div className='chapter-index'><span>제{String(chapter.order).padStart(2,'0')}장</span><span className='chapter-rule'/><span>15</span></div><span className='source-tag'>원작 기반</span></div>
    <div className='story-scroll' ref={story}>
     <p className='chapter-theme'>{chapter.theme}</p><h2 className='chapter-title' data-current-title={chapter.id}>{chapter.title}</h2><p className='place-english'>{chapter.english}</p>
     <div className='story-ornament' aria-hidden='true'><span/><svg width='22' height='12' viewBox='0 0 22 12'><path d='M0 6h7l4-4 4 4h7 M7 6l4 4 4-4' stroke='currentColor' fill='none'/></svg><span/></div>
     <p className='chapter-poem'>{chapter.subtitle}</p>
     <p className='chapter-summary'>{chapter.summary}</p>
     <section className='exploration'><h3><span className='small-cross'>✧</span>장면 속 발견<span>{chapter.hotspots.length}개의 탐색 지점</span></h3><div className='hotspot-list'>{chapter.hotspots.map((h,i)=><button key={h.title} aria-pressed={hotspot===i} className={`hotspot-button ${hotspot===i?'active':''}`} onClick={()=>openHotspot(i)}><span className='hotspot-number'>{String(i+1).padStart(2,'0')}</span><span>{h.title}</span><Icon name={hotspot===i?'minus':'plus'} size={13}/></button>)}</div>
      {hotspot!==null&&<div className='hotspot-description' role='status'><div><strong>{chapter.hotspots[hotspot].title}</strong><button aria-label='탐색 설명 닫기' className='icon-button small' onClick={()=>setHotspot(null)}><Icon name='close' size={13}/></button></div><p>{chapter.hotspots[hotspot].text}</p></div>}
     </section>
     <div className='scene-progress'><div className='range-title'><label htmlFor='scene-moment'>장면의 순간</label><span>{Math.round(progress*100)}%</span></div><input id='scene-moment' type='range' min='0' max='100' value={Math.round(progress*100)} aria-label='장면 진행' onChange={(event:{currentTarget:HTMLInputElement})=>setProgress(Number(event.currentTarget.value)/100)}/><p>{chapter.moment}</p></div>
     <details className='story-details'><summary>선택과 결과<Icon name='chevron' size={14}/></summary><dl><dt>이전 사건에서</dt><dd>{chapter.cause}</dd><dt>선택과 갈등</dt><dd>{chapter.conflict}</dd><dt>남겨진 결과</dt><dd>{chapter.consequence}</dd><dt>다음 항해</dt><dd>{chapter.next}</dd></dl></details>
     {index>=13&&<section className='parallel-section'><h3>같은 세계, 또 다른 여정</h3><button onClick={()=>setParallel('penelope')}><span>이타카의 기다림</span><Icon name='arrowRight' size={14}/></button><button onClick={()=>setParallel('telemachus')}><span>아버지를 찾는 길</span><Icon name='arrowRight' size={14}/></button></section>}
     <button className='source-button' onClick={()=>setSources(true)}><Icon name='book' size={13}/>원작·연출 구분<Icon name='arrowRight' size={12}/></button>
    </div>
    <div className='story-navigation'><button className='previous-button' disabled={index===0} onClick={()=>navigate(index-1)} aria-label='이전 장'><Icon name='arrowLeft' size={17}/><span>이전</span></button><button className='next-button' disabled={index===14} onClick={()=>navigate(index+1)}>{index===14?'귀환의 완성':'다음 장'}<Icon name={index===14?'check':'arrowRight'} size={18}/></button></div>
   </aside>
  </main>
  <footer className='journey-footer'>
   <div className='journey-heading'><div><Icon name='compass' size={15}/><span>귀환의 여정</span><span className='journey-sub'>시간순 재구성</span></div><div className='journey-tools'><button className='quiet-button reset-button' onClick={()=>setReset(true)}><Icon name='reset' size={13}/><span>처음부터</span></button><button className='play-button' onClick={()=>setPaused(v=>!v)} aria-label={paused?'재생':'일시정지'} title={paused?'움직임 재생':'모든 움직임 일시정지'}><Icon name={paused?'play':'pause'} size={13}/><span>{paused?'재생':'일시정지'}</span></button></div></div>
   <div className='timeline' ref={timeline} aria-label='전체 15개 장 타임라인'>{chapters.map((c,i)=><button key={c.id} className={`timeline-stop ${i===index?'current':''} ${visited.includes(i)?'visited':''}`} data-timeline={i} aria-label={`${c.order}장 ${c.title}`} aria-current={i===index?'step':undefined} onClick={()=>navigate(i)} title={c.title}><span className='timeline-number'>{String(c.order).padStart(2,'0')}</span><span className='timeline-dot'/><span className='timeline-label'>{i===14?'시험과 재회':c.place}</span></button>)}</div>
   <div className='footer-fineprint'><span>원작 기반의 상징적 항로 · 실제 지리적 위치를 확정한 지도가 아님</span><span className='render-badge'><span/>SVG 입체 세계</span></div>
  </footer>
  <span className='sr-only' aria-live='polite'>제{chapter.order}장, {chapter.title}</span>
  {settings&&<Modal title='항해 설정' onClose={()=>setSettings(false)}><div className='setting-row'><div><strong>모션 축소</strong><p>{systemReduced?'운영체제의 모션 축소 설정 적용 중':'카메라 이동과 반복 애니메이션 없이 탐색'}</p></div><input className='toggle' aria-label='모션 축소' type='checkbox' checked={motionReduced} disabled={systemReduced} onChange={(event:{currentTarget:HTMLInputElement})=>setReduced(event.currentTarget.checked)}/></div><div className='setting-row'><div><strong>자동 항해</strong><p>각 장을 살펴본 뒤 다음 장으로 이동</p></div><input className='toggle' aria-label='자동 항해' type='checkbox' checked={auto} disabled={motionReduced} onChange={(event:{currentTarget:HTMLInputElement})=>{setAuto(event.currentTarget.checked);if(event.currentTarget.checked){setPaused(false);setMode('story');setStarted(true);}}}/></div><div className='setting-row'><div><strong>화면 품질</strong><p>자동 설정은 렌더링 부하에 따라 세부도를 조절</p></div><select value={quality} aria-label='화면 품질' onChange={(event:{currentTarget:HTMLSelectElement})=>setQuality(event.currentTarget.value as 'auto'|'high'|'low')}><option value='auto'>자동</option><option value='high'>고품질</option><option value='low'>가벼운 화면</option></select></div><div className='help-block'><h3>조작 방법</h3><p>드래그로 지도 이동 · 휠과 두 손가락으로 확대</p><p>Shift + 드래그 또는 회전 버튼으로 시점 조절</p><p>← → 이전·다음 장 · Space 재생·정지 · Esc 닫기</p></div><p className='storage-note'>{storageAvailable?'현재 장과 표시 설정은 이 브라우저에만 저장됩니다. 자동 항해는 새로 열 때 시작하지 않습니다.':'이 환경에서는 기록을 저장할 수 없습니다. 현재 탐색은 정상 작동하며 새로고침하면 기록이 초기화됩니다.'}</p></Modal>}
  {list&&<Modal title='열다섯 개의 장' onClose={()=>setList(false)} wide><p className='modal-intro'>장소를 선택하면 해당 사건으로 이동합니다. 원작의 서술 순서가 아닌 귀환 여정의 시간순 재구성입니다.</p><div className='chapter-list'>{chapters.map((c,i)=><button key={c.id} className={i===index?'selected':''} onClick={()=>navigate(i)} aria-label={`${c.order}장 ${c.title} 이동`}><span className='list-number'>{String(c.order).padStart(2,'0')}</span><span><strong>{c.title}</strong><small>{c.theme}</small></span>{i===index?<Icon name='check' size={17}/>:<Icon name='arrowRight' size={15}/>}</button>)}</div></Modal>}
  {sources&&<Modal title='원작과 시각적 해석' onClose={()=>setSources(false)}><div className='source-section'><span className='source-type'>원작 기반</span><h3>호메로스의 《오디세이아》를 출발점으로</h3><p>장 구성과 서사 핵심은 제공된 기획 문서를 기준으로 작성했습니다. 설명과 짧은 서술은 새로 쓴 각색이며, 원문의 직접 인용이나 특정 번역본의 대사가 아닙니다.</p><p className='source-reference'>{chapter.sourceRef}</p></div><div className='source-section'><span className='source-type teal'>시각적 해석</span><h3>항로, 지형과 장면의 순간</h3><p>섬의 형태, 궁전 구조, 인물 실루엣, 날씨와 색감은 웹앱을 위한 창작입니다. 지도는 실제 지리적 위치를 확정하지 않으며, 슬라이더는 원작의 결과를 변경하지 않습니다.</p></div><div className='source-section'><span className='source-type'>영화와의 관계</span><p>영화의 확인되지 않은 장면·대사·배우 외형을 사용하지 않았습니다. 이 앱의 15개 장은 영화에 등장한다고 확정한 목록이 아닙니다.</p></div><p className='storage-note'>원전의 절·행 단위 대조 주석 및 영화별 검증 자료는 포함하지 않았습니다.</p></Modal>}
  {parallel&&<Modal title={parallelStories[parallel].title} onClose={()=>setParallel(null)}><Artifact kind={parallel}/><p className='chapter-theme'>{parallelStories[parallel].subtitle}</p><p className='parallel-copy'>{parallelStories[parallel].text}</p><p className='storage-note'>보조 서사 · 항해의 개별 사건과 정확히 같은 시각에 일어났다고 연결하지 않습니다.</p></Modal>}
  {reset&&<Modal title='항해를 처음부터 시작할까요?' onClose={()=>setReset(false)}><p className='modal-intro'>현재 장과 발견한 장소 기록을 초기화합니다. 모션 축소와 화면 품질 설정은 유지됩니다.</p><div className='confirm-actions'><button className='secondary-button' onClick={()=>setReset(false)}>취소</button><button className='primary-button' onClick={restart}>초기화</button></div></Modal>}
 </div>;
}
