"""Additional real browser drag and opt-in automatic navigation checks."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1280,'height':800})
 page.set_content((root/'dist/ODYSSEY.html').read_text(),wait_until='load')
 page.get_by_role('button',name='자유 탐색',exact=True).click();page.wait_for_timeout(1550)
 shape=page.locator('[data-layer=world]').inner_html()
 page.mouse.move(650,445);page.mouse.down();page.mouse.move(580,465,steps=7);page.mouse.up();page.wait_for_timeout(80)
 assert shape!=page.locator('[data-layer=world]').inner_html()
 expect(page.locator('.atlas-app')).to_have_attribute('data-mode','explore')
 page.get_by_role('button',name='설정',exact=True).click()
 page.get_by_label('자동 항해',exact=True).check()
 page.keyboard.press('Escape')
 expect(page.locator('.world-svg')).to_have_attribute('data-chapter','2',timeout=14500)
 page.get_by_role('button',name='일시정지',exact=True).click()
 expect(page.locator('.world-svg')).to_have_attribute('data-motion','paused')
 b.close()
 result={'realMouseDrag':'passed','explicitAutoplayAdvancedFrom1To2':'passed','autoplayCanBePaused':'passed','note':'Native hidden-tab lifecycle and reload persistence not exercised.'}
 (root/'artifacts/extra-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 print(result)
