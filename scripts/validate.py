"""Offline Chromium interaction checks. No web server or external requests needed.
Policy-restricted execution uses set_content; native file/origin persistence is not tested.
"""
import json, os, time, traceback, hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts'; OUT.mkdir(exist_ok=True)
HTML=(ROOT/'dist/ODYSSEY.html').read_text()
results=[]; errors=[]
def record(name,fn):
 t=time.monotonic()
 try:
  detail=fn(); results.append({'name':name,'status':'passed','seconds':round(time.monotonic()-t,2),'detail':detail or ''})
 except Exception as e:
  results.append({'name':name,'status':'failed','seconds':round(time.monotonic()-t,2),'error':str(e),'trace':traceback.format_exc()})
 print(results[-1]['status'],name,flush=True)
def new_page(browser,mobile=False,reduced=True):
 page=browser.new_page(viewport={'width':375 if mobile else 1280,'height':667 if mobile else 800},has_touch=mobile,is_mobile=mobile,reduced_motion='reduce' if reduced else 'no-preference')
 page.set_default_timeout(8000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda message:errors.append(message.text) if message.type=='error' else None)
 page.set_content(HTML,wait_until='load')
 page.wait_for_function("document.querySelector('.world-svg path')!==null")
 return page
def chapter(page,i):
 page.locator(f'[data-timeline="{i}"]').click()
 expect(page.locator('.world-svg')).to_have_attribute('data-rendered-chapter',str(i+1))
 expect(page.locator(f'[data-timeline="{i}"]')).to_have_attribute('aria-current','step')
def snap(page,name):
 page.screenshot(path=str(OUT/name))
def digest(page,selector):
 return hashlib.sha256(page.locator(selector).inner_html().encode()).hexdigest()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=new_page(browser)
 def core():
  assert page.locator('.world-svg polygon,.world-svg path').count()>1000
  assert page.locator('canvas,.world-svg image').count()==0
  expect(page.get_by_role('button',name='이전 장',exact=True)).to_be_disabled()
  snap(page,'desktop-overview.png')
  page.get_by_role('button',name='항해 시작',exact=True).click()
  expect(page.locator('.map-heading h1')).to_have_text('트로이')
  snap(page,'desktop-troy.png')
  visited=[]
  for i in range(15):
   chapter(page,i)
   expect(page.locator('.chapter-title')).not_to_be_empty()
   assert page.locator('.hotspot-button').count()>=2
   assert page.locator('[data-dynamic=ship] path').count()>5
   assert page.locator('.world-svg [data-layer=world] path').count()>50
   visited.append(page.locator('.chapter-title').inner_text())
   if i in [3,6,9,14]: snap(page,{3:'desktop-cyclops.png',6:'desktop-circe.png',9:'desktop-strait.png',14:'desktop-ithaca.png'}[i])
  expect(page.get_by_role('button',name='귀환의 완성',exact=True)).to_be_disabled()
  expect(page.locator('.discovery-count')).to_have_text('15 / 15')
  return {'chapters':visited,'noCanvasOrRaster':True,'finalNavigationDisabled':True}
 record('01 모든 15장·타임라인·선박·경계 이동',core)
 def explore():
  chapter(page,6)
  page.get_by_role('button',name='전체 지도',exact=True).click()
  page.locator('.map-label[data-place="3"]').click()
  expect(page.locator('.world-svg')).to_have_attribute('data-rendered-chapter','4')
  chapter(page,6)
  before=page.locator('.world-svg').get_attribute('data-zoom')
  page.get_by_role('button',name='확대',exact=True).click()
  expect(page.locator('.atlas-app')).to_have_attribute('data-mode','explore')
  page.wait_for_function('(old)=>document.querySelector(".world-svg").dataset.zoom!==old',arg=before)
  yaw=page.locator('.world-svg').get_attribute('data-yaw');shape=digest(page,'.world-svg [data-layer=world]')
  page.get_by_role('button',name='시점 오른쪽 회전',exact=True).click()
  page.wait_for_function('(old)=>document.querySelector(".world-svg").dataset.yaw!==old',arg=yaw)
  assert digest(page,'.world-svg [data-layer=world]')!=shape
  for cmd in ['축소','시점 왼쪽 회전','전체 지도']:
   page.get_by_role('button',name=cmd,exact=True).click()
  page.get_by_role('button',name='항해 따라가기',exact=True).click()
  page.locator('[data-hotspot="0"]').click()
  expect(page.locator('.hotspot-description')).to_be_visible()
  expect(page.locator('.hotspot-button').first).to_have_attribute('aria-pressed','true')
  page.get_by_role('button',name='탐색 설명 닫기',exact=True).click()
  expect(page.locator('.hotspot-description')).to_have_count(0)
  chapter(page,9)
  page.get_by_role('slider',name='장면 진행').fill('10')
  page.wait_for_timeout(120)
  z1=page.locator('[data-dynamic=ship]').get_attribute('data-world-z');s1=digest(page,'[data-dynamic=event]')
  page.get_by_role('slider',name='장면 진행').fill('90')
  page.wait_for_timeout(120)
  assert z1!=page.locator('[data-dynamic=ship]').get_attribute('data-world-z')
  assert s1!=digest(page,'[data-dynamic=event]')
  chapter(page,10);page.get_by_role('slider',name='장면 진행').fill('90')
  expect(page.locator('[data-dynamic=ship]')).to_have_attribute('data-kind','wreck')
  chapter(page,11);expect(page.locator('[data-dynamic=ship]')).to_have_attribute('data-kind','raft')
  chapter(page,13);x=page.locator('[data-dynamic=ship]').get_attribute('data-world-x');z=page.locator('[data-dynamic=ship]').get_attribute('data-world-z')
  chapter(page,14)
  expect(page.locator('[data-dynamic=ship]')).to_have_attribute('data-world-x',x)
  expect(page.locator('[data-dynamic=ship]')).to_have_attribute('data-world-z',z)
  for title in ['이타카의 기다림','아버지를 찾는 길']:
   page.get_by_role('button',name=title,exact=True).click()
   expect(page.get_by_role('dialog')).to_be_visible()
   assert page.locator('.artifact-illustration path').count()>3
   page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
  page.get_by_role('button',name='원작·연출 구분',exact=True).click()
  expect(page.get_by_role('dialog',name='원작과 시각적 해석')).to_be_visible()
  expect(page.get_by_text('영화와의 관계',exact=True)).to_be_visible()
  page.keyboard.press('Escape')
  return 'Zoom/yaw changed projected geometry; slide changed ship+event; wreck→raft; same coast in chapters14/15; both parallel stories/source modal'
 record('02 자유 탐색·사건 슬라이더·보조 서사',explore)
 def guardrails():
  chapter(page,6)
  page.get_by_role('button',name='처음부터',exact=True).click()
  page.get_by_role('button',name='취소',exact=True).click()
  expect(page.locator('.world-svg')).to_have_attribute('data-chapter','7')
  page.get_by_role('button',name='처음부터',exact=True).click()
  page.get_by_role('button',name='초기화',exact=True).click()
  expect(page.locator('.world-svg')).to_have_attribute('data-chapter','1')
  expect(page.get_by_role('button',name='항해 시작',exact=True)).to_be_visible()
  expect(page.locator('.discovery-count')).to_have_text('01 / 15')
  page.get_by_role('button',name='설정',exact=True).click()
  expect(page.get_by_label('모션 축소',exact=True)).to_be_checked()
  expect(page.get_by_label('모션 축소',exact=True)).to_be_disabled()
  expect(page.get_by_label('자동 항해',exact=True)).to_be_disabled()
  expect(page.get_by_text('이 환경에서는 기록을 저장할 수 없습니다.',exact=False)).to_be_visible()
  page.keyboard.press('Escape')
  expect(page.locator('.world-svg')).to_have_attribute('data-motion','reduced')
  chapter(page,3);page.wait_for_timeout(100);before=digest(page,'[data-dynamic=ship]')
  page.wait_for_timeout(350);assert before==digest(page,'[data-dynamic=ship]')
  page.locator('.world-svg').focus();page.keyboard.press('ArrowRight')
  expect(page.locator('.world-svg')).to_have_attribute('data-chapter','5')
  page.keyboard.press('ArrowLeft');expect(page.locator('.world-svg')).to_have_attribute('data-chapter','4')
  return 'Reset cancellation/confirmation; storage denied fallback; OS motion setting respected; geometry stable; keyboard navigation'
 record('03 초기화 보호·모션 축소·저장 차단 대응',guardrails)
 def mobile():
  m=new_page(browser,mobile=True)
  snap(m,'mobile-overview.png')
  assert m.evaluate('document.body.scrollWidth===innerWidth')
  m.get_by_role('button',name='항해 시작',exact=True).tap()
  m.get_by_role('button',name='이야기 펼치기',exact=True).tap()
  expect(m.locator('.story-panel')).to_have_class('story-panel sheet-expanded')
  m.locator('.hotspot-button').first.tap();expect(m.locator('.hotspot-description')).to_be_visible()
  m.locator('.hotspot-description').scroll_into_view_if_needed()
  snap(m,'mobile-story.png')
  m.get_by_role('button',name='이야기 접기',exact=True).tap()
  m.get_by_role('button',name='여정 목록',exact=True).tap()
  m.get_by_role('button',name='12장 칼립소의 오기기아 이동',exact=True).tap()
  expect(m.locator('.world-svg')).to_have_attribute('data-chapter','12')
  m.get_by_role('button',name='확대',exact=True).tap()
  expect(m.locator('.atlas-app')).to_have_attribute('data-mode','explore')
  m.get_by_role('button',name='항해 따라가기',exact=True).tap()
  m.wait_for_timeout(80)
  old=m.locator('.world-svg').get_attribute('data-zoom')
  cdp=m.context.new_cdp_session(m)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':140,'y':220,'id':1},{'x':220,'y':220,'id':2}]})
  cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':110,'y':220,'id':1},{'x':250,'y':220,'id':2}]})
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  m.wait_for_function('(old)=>document.querySelector(".world-svg").dataset.zoom!==old',arg=old)
  m.get_by_role('button',name='항해 따라가기',exact=True).tap()
  assert m.evaluate('document.body.scrollWidth===innerWidth')
  snap(m,'mobile-calypso.png')
  m.close();return '375×667: touch start, sheet, hotspot, chapter list, real browser two-pointer pinch, zoom/follow, no page horizontal overflow'
 record('04 모바일 터치·하단 시트·장 선택',mobile)
 def motion():
  n=new_page(browser,reduced=False)
  n.get_by_role('button',name='항해 시작',exact=True).click()
  n.wait_for_timeout(1600)
  chapter(n,3);n.wait_for_timeout(100);chapter(n,9);n.wait_for_timeout(100);chapter(n,6)
  n.wait_for_timeout(1700)
  expect(n.locator('.world-svg')).to_have_attribute('data-chapter','7')
  expect(n.locator('.map-heading h1')).to_have_text('아이아이에')
  n.get_by_role('button',name='일시정지',exact=True).click()
  expect(n.locator('.world-svg')).to_have_attribute('data-motion','paused')
  n.wait_for_timeout(100);a=digest(n,'[data-dynamic=ship]');event=digest(n,'[data-dynamic=event]')
  n.wait_for_timeout(350)
  assert a==digest(n,'[data-dynamic=ship]') and event==digest(n,'[data-dynamic=event]')
  n.get_by_role('button',name='재생',exact=True).click();n.wait_for_timeout(200)
  assert a!=digest(n,'[data-dynamic=ship]')
  n.get_by_role('button',name='설정',exact=True).click()
  expect(n.get_by_label('자동 항해',exact=True)).not_to_be_checked()
  n.get_by_label('화면 품질',exact=True).select_option('high')
  n.get_by_label('모션 축소',exact=True).check()
  n.keyboard.press('Escape')
  expect(n.locator('.world-svg')).to_have_attribute('data-motion','reduced')
  n.close();return 'Rapid transitions settle on latest chapter; pause stops ship+event, resume animates; opt-in auto; high quality/manual reduced setting'
 record('05 전환 취소·일시정지·사용자 설정',motion)
 browser.close()
report={'execution':'Chromium set_content (navigation blocked by environment policy)','viewport':['1280x800','375x667'],'results':results,'runtimeErrors':errors,'notVerified':['Native file:// launch','Native origin/localStorage persistence','Safari/Firefox','60fps target','Hosted deployment','Full React/Vite dependency build']}
(OUT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'passed':sum(r['status']=='passed' for r in results),'failed':sum(r['status']=='failed' for r in results),'runtimeErrors':errors},ensure_ascii=False),flush=True)
