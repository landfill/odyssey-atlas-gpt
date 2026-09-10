const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let ts;try{ts=require('typescript');}catch{ts=require(path.join(require('node:child_process').execFileSync(process.platform==='win32'?'npm.cmd':'npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'));}
const root=path.resolve(__dirname,'..'),cache={};
function load(name){const filename=path.resolve(root,'src',name+'.ts');if(cache[filename])return cache[filename].exports;const module={exports:{}};cache[filename]=module;const js=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;new Function('require','module','exports',js)(id=>load(path.relative(path.join(root,'src'),path.resolve(path.dirname(filename),id))),module,module.exports);return module.exports;}
const results=[];function test(name,fn){try{fn();results.push({name,status:'passed'});}catch(e){results.push({name,status:'failed',error:String(e)});}}
const {chapters}=load('content/chapters'),math=load('graphics/math'),models=load('graphics/models'),storage=load('content/storage');
test('15개 장과 14개 장소, 동일한 이타카 해안',()=>{assert.equal(chapters.length,15);assert.equal(new Set(chapters.map(c=>c.locationId)).size,14);assert.deepEqual(chapters[13].port,chapters[14].port);assert.equal(new Set(chapters.map(c=>c.id)).size,15);chapters.forEach(c=>{assert.ok(c.hotspots.length>=2);assert.ok(c.sourceRef);assert.equal(c.sourceType,'original-epic');});});
test('모든 장면의 유효한 3차원 정점과 모델',()=>{for(let i=0;i<14;i++){const m=models.island(i);assert.ok(m.length>50);for(const f of m){assert.ok(f.vertices.length>=2);for(const v of f.vertices)assert.ok([v.x,v.y,v.z].every(Number.isFinite));}}for(let i=0;i<15;i++)for(const stage of [0,.5,1]){const m=models.eventModel(i,stage,0);for(const f of m)for(const v of f.vertices)assert.ok([v.x,v.y,v.z].every(Number.isFinite));}});
test('곡선의 양 끝점과 카메라 회전 투영',()=>{const {V,cubic,project}=math,a=V(0,0,0),b=V(10,0,4),c=V(20,0,10),d=V(30,0,20);assert.deepEqual(cubic(a,b,c,d,0),a);assert.deepEqual(cubic(a,b,c,d,1),d);const camera={target:a,yaw:0,elevation:.75,zoom:2};assert.notDeepEqual(project(V(20,5,30),camera,1280,800),project(V(20,5,30),{...camera,yaw:.2},1280,800));});
test('메모리 저장 어댑터: 저장과 복구',()=>{let value=null;global.localStorage={getItem:()=>value,setItem:(_,s)=>value=s};const state={index:9,started:true,paused:true,reduced:true,quality:'high',visited:[0,3,9]};assert.equal(storage.saveState(state),true);const loaded=storage.loadState();assert.equal(loaded.index,9);assert.equal(loaded.reduced,true);assert.equal(loaded.quality,'high');assert.deepEqual([...loaded.visited].sort((a,b)=>a-b),[0,3,9]);});
test('손상되거나 범위를 벗어난 저장값의 검증',()=>{global.localStorage={getItem:()=>'{bad json',setItem:()=>{}};assert.equal(storage.loadState().index,0);global.localStorage.getItem=()=>JSON.stringify({index:999,started:'true',quality:'unsafe',visited:[-1,0,0,3,99,'4']});const s=storage.loadState();assert.equal(s.index,0);assert.equal(s.started,false);assert.equal(s.quality,'auto');assert.deepEqual(s.visited,[0,3]);});
test('저장 권한 거부 시 기본값과 오류 없는 폴백',()=>{global.localStorage={getItem:()=>{throw Error('denied')},setItem:()=>{throw Error('denied')}};const s=storage.loadState();assert.equal(s.index,0);assert.equal(storage.saveState(s),false);delete global.localStorage;assert.equal(storage.loadState().index,0);});
const language=load('content/language'),localized=load('content/chapters.en');
test('English content covers all chapters without changing navigation or geometry',()=>{
 assert.equal(localized.englishChapters.length,chapters.length);
 chapters.forEach((chapter,i)=>{
  const translated=localized.englishChapters[i];
  for(const field of ['id','order','sceneId','locationId','position','port','accent','sourceType'])assert.deepEqual(translated[field],chapter[field]);
  for(const field of ['title','place','theme','subtitle','summary','cause','conflict','consequence','next','sourceRef','moment']){
   assert.ok(translated[field].length>0,`${chapter.id}.${field}`);
   assert.equal(/[가-힣]/.test(translated[field]),false,`${chapter.id}.${field}`);
  }
  assert.equal(translated.hotspots.length,chapter.hotspots.length);
  translated.hotspots.forEach((hotspot,j)=>{
   assert.deepEqual(hotspot.offset,chapter.hotspots[j].offset);
   assert.ok(hotspot.title&&hotspot.text);
   assert.equal(/[가-힣]/.test(hotspot.title+hotspot.text),false);
  });
 });
 assert.equal(localized.getChapters('ko'),chapters);
 assert.equal(localized.getChapters('en'),localized.englishChapters);
 for(const story of Object.values(localized.getParallelStories('en')))assert.equal(/[가-힣]/.test(Object.values(story).join('')),false);
 for(const [key,value] of Object.entries(language.englishMessages)){
  assert.equal(language.translate('ko',key),key);
  assert.ok(value&&!/[가-힣]/.test(value),key);
 }
});
test('Language preference follows browser locale until explicitly chosen',()=>{
 const previous=Object.getOwnPropertyDescriptor(global,'navigator');
 const values=new Map();
 global.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 try{
  Object.defineProperty(global,'navigator',{configurable:true,value:{languages:['ko-KR','en-US'],language:'ko-KR'}});
  assert.equal(language.loadLanguage(),'ko');
  global.navigator.languages=['en-GB','ko'];assert.equal(language.loadLanguage(),'en');
  language.saveLanguage('ko');assert.equal(language.loadLanguage(),'ko');
  language.saveLanguage('en');global.navigator.languages=['ko-KR'];assert.equal(language.loadLanguage(),'en');
  values.set('odyssey-atlas-language','invalid');assert.equal(language.loadLanguage(),'ko');
  values.clear();global.navigator.languages=['fr-FR'];assert.equal(language.loadLanguage(),'en');
  global.localStorage={getItem:()=>{throw Error('denied')},setItem:()=>{throw Error('denied')}};
  assert.equal(language.loadLanguage(),'en');assert.doesNotThrow(()=>language.saveLanguage('ko'));
  delete global.navigator;assert.equal(language.loadLanguage(),'ko');
 }finally{if(previous)Object.defineProperty(global,'navigator',previous);else delete global.navigator;delete global.localStorage;}
});
const report={runtime:process.version,storage:'Injected in-memory adapter, not native browser persistence',results};fs.writeFileSync(path.join(root,'artifacts/unit-validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(results.some(r=>r.status==='failed'))process.exit(1);
