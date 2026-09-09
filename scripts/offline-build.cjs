/* Offline fallback: transpile and bundle the exact TS/TSX source using TypeScript.
 * A normal npm install + npm run build remains the recommended Vite build path.
 * The vendor file contains only MIT-licensed React / React DOM / Scheduler.
 */
const fs=require('node:fs'),path=require('node:path');
let ts;try{ts=require('typescript');}catch{try{const npm=process.platform==='win32'?'npm.cmd':'npm';const globalRoot=require('node:child_process').execFileSync(npm,['root','-g'],{encoding:'utf8'}).trim();ts=require(path.join(globalRoot,'typescript'));}catch{console.error('TypeScript가 필요합니다. npm install 후 다시 실행하거나 완성된 dist/ODYSSEY.html을 바로 여세요.');process.exit(1);}}
const root=path.resolve(__dirname,'..'),src=path.join(root,'src'),files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(e.name)&&!e.name.endsWith('.d.ts'))files.push(p);}}walk(src);
const map={};let issues=[];
for(const file of files){const rel=path.relative(src,file).replaceAll(path.sep,'/').replace(/\.(ts|tsx)$/,'');const result=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,removeComments:false},reportDiagnostics:true});issues.push(...(result.diagnostics||[]));map[rel]=result.outputText;}
if(issues.some(d=>d.category===ts.DiagnosticCategory.Error)){console.error(ts.formatDiagnosticsWithColorAndContext(issues,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));process.exit(1);}
const runtime=fs.readFileSync(path.join(root,'offline/react-runtime.js'),'utf8');
const body=Object.entries(map).map(([id,code])=>JSON.stringify(id)+':function(require,module,exports){\n'+code+'\n}').join(',\n');
const bundle=runtime+'\n;(function(){"use strict";const modules={'+body+'},cache={};function resolve(name,from){if(!name.startsWith("."))return name;const parts=from.split("/");parts.pop();for(const p of name.split("/")){if(p==="..")parts.pop();else if(p!==".")parts.push(p);}return parts.join("/").replace(/\\.(ts|tsx)$/," ").trim();}function load(id,from=""){if(id.endsWith(".css"))return {};if(id==="react")return window.__ODYSSEY_VENDOR__.react;if(id==="react/jsx-runtime")return window.__ODYSSEY_VENDOR__.jsx;if(id==="react-dom/client")return window.__ODYSSEY_VENDOR__.dom;id=resolve(id,from);if(cache[id])return cache[id].exports;if(!modules[id])throw Error("Unknown module: "+id);const module={exports:{}};cache[id]=module;modules[id](name=>load(name,id),module,module.exports);return module.exports;}load("main");})();\n';
const css=fs.readFileSync(path.join(src,'index.css'),'utf8');const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
fs.mkdirSync(path.join(root,'dist/assets'),{recursive:true});fs.writeFileSync(path.join(root,'dist/assets/app.js'),bundle);fs.writeFileSync(path.join(root,'dist/assets/app.css'),css);
fs.writeFileSync(path.join(root,'dist/index.html'),html.replace('<script type="module" src="./src/main.tsx"></script>','<script defer src="./assets/app.js"></script>').replace('</head>','<link rel="stylesheet" href="./assets/app.css"/></head>'));
const license='<!--\n'+fs.readFileSync(path.join(root,'licenses/react-MIT.txt'),'utf8')+'\n-->\n';
const single=license+html.replace('<script type="module" src="./src/main.tsx"></script>',()=>'<script>'+bundle.replaceAll('</script','<\\/script')+'</script>').replace('</head>','<style>'+css+'</style></head>');
fs.writeFileSync(path.join(root,'dist/ODYSSEY.html'),single);console.log(`Offline build complete: ${files.length} source modules, ${Buffer.byteLength(single)} bytes; React ${'19.1.1'}.`);
