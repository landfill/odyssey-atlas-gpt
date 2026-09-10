"""Browser acceptance checks against a local production build.

Run a static server for dist on port 4173, then run this script.
"""
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts'
URL = 'http://127.0.0.1:4173'
results = []
errors = []


def english_only(page):
    text = page.evaluate("""() => {
      const copy = document.body.cloneNode(true);
      copy.querySelectorAll('.language-switch,script').forEach(node => node.remove());
      return copy.textContent + [...copy.querySelectorAll('[aria-label]')].map(node => node.getAttribute('aria-label')).join(' ');
    }""")
    assert not re.search('[가-힣]', text), 'Untranslated Korean outside language selector'


def header_fits(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    boxes = [page.locator(selector).bounding_box() for selector in
             ['.brand', '.language-switch', '.journey-button', '.header-actions>.icon-button']]
    for box in boxes:
        assert box['x'] >= 0 and box['x'] + box['width'] <= page.viewport_size['width']
    for a, b in zip(boxes, boxes[1:]):
        assert a['x'] + a['width'] <= b['x'] + 1, 'Header controls overlap'


with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(locale='ko-KR', viewport={'width': 1280, 'height': 800}, reduced_motion='reduce')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    expect(page.locator('html')).to_have_attribute('lang', 'ko')
    expect(page.locator('.chapter-title')).to_have_text('트로이')
    page.get_by_role('button', name='항해 시작', exact=True).click()
    page.locator('[data-timeline="6"]').click()
    page.locator('.hotspot-button').first.click()
    page.locator('#scene-moment').fill('67')
    expect(page.locator('.world-svg')).to_have_attribute('data-rendered-chapter', '7')
    page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
    original_geometry = page.locator('[data-layer="world"]').inner_html()
    saved = page.evaluate("localStorage.getItem('odyssey-atlas-v1')")
    page.get_by_role('button', name='View in English', exact=True).focus()
    page.keyboard.press('Enter')
    expect(page.locator('html')).to_have_attribute('lang', 'en')
    expect(page.locator('.chapter-title')).to_have_text('Circe’s Aeaea')
    expect(page.locator('#scene-moment')).to_have_value('67')
    expect(page.locator('.hotspot-description strong')).to_have_text('The Enchanted Cup')
    expect(page.get_by_role('button', name='View in English')).to_have_attribute('aria-pressed', 'true')
    page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
    assert original_geometry == page.locator('[data-layer="world"]').inner_html(), 'Language change moved the scene'
    assert saved == page.evaluate("localStorage.getItem('odyssey-atlas-v1')")
    expect(page).to_have_title('ODYSSEY — The Voyage Home')
    english_only(page)
    page.reload()
    expect(page.locator('html')).to_have_attribute('lang', 'en')
    expect(page.locator('.chapter-title')).to_have_text('Circe’s Aeaea')
    results.append('Keyboard language switch preserves chapter, discovery, slider, geometry and journey storage; choice survives reload')

    for i in range(15):
        page.locator(f'[data-timeline="{i}"]').click()
        expect(page.locator('.world-svg')).to_have_attribute('data-rendered-chapter', str(i + 1))
        page.locator('.hotspot-button').first.click()
        expect(page.locator('.hotspot-description')).to_be_visible()
        english_only(page)
    page.get_by_role('button', name='Settings', exact=True).click()
    expect(page.get_by_role('dialog')).to_have_attribute('aria-label', 'Voyage settings')
    english_only(page)
    page.get_by_role('button', name='Close', exact=True).click()
    page.get_by_role('button', name='Chapters', exact=True).click()
    assert page.locator('.chapter-list>button').count() == 15
    english_only(page)
    page.get_by_role('button', name='Close', exact=True).click()
    page.get_by_role('button', name='Sources and interpretation', exact=True).click()
    english_only(page)
    page.get_by_role('button', name='Close', exact=True).click()
    for title in ['Waiting in Ithaca', 'In Search of a Father']:
        page.locator('.parallel-section').get_by_role('button', name=title, exact=True).click()
        english_only(page)
        page.get_by_role('button', name='Close', exact=True).click()
    results.append('All 15 chapters, discoveries, SVG labels, settings, chapter list, source notes and both companion stories are English')
    page.get_by_role('button', name='Restart', exact=True).click()
    page.get_by_role('button', name='Reset voyage', exact=True).click()
    expect(page.locator('html')).to_have_attribute('lang', 'en')
    page.get_by_role('button', name='Full map', exact=True).click()
    page.locator('.story-scroll').evaluate('(node) => node.scrollTop = 0')
    header_fits(page)
    page.screenshot(path=str(OUT / 'language-desktop-en.png'))
    page.get_by_role('button', name='한국어로 보기', exact=True).click()
    expect(page.locator('.chapter-title')).to_have_text('트로이')
    page.reload()
    expect(page.locator('html')).to_have_attribute('lang', 'ko')
    results.append('Restart retains language; switching back to Korean survives reload')
    context.close()

    for width in [320, 375, 760]:
        context = browser.new_context(locale='en-US', viewport={'width': width, 'height': 812}, is_mobile=True, has_touch=True, reduced_motion='reduce')
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(URL)
        expect(page.locator('html')).to_have_attribute('lang', 'en')
        header_fits(page)
        if width <= 480:
            actions = page.locator('.entry-actions').bounding_box()
            controls = page.locator('.map-controls').bounding_box()
            assert actions['x'] + actions['width'] <= controls['x'], 'Entry actions overlap map controls'
        page.get_by_role('button', name='Chapters', exact=True).click()
        page.locator('.chapter-list>button').nth(9).click()
        page.get_by_role('button', name='Expand story', exact=True).click()
        expect(page.locator('.chapter-title')).to_have_text('Scylla and Charybdis')
        page.locator('.hotspot-button').first.click()
        english_only(page)
        page.get_by_role('button', name='View in English').focus()
        header_fits(page)
        if width == 375:
            page.screenshot(path=str(OUT / 'language-mobile-en.png'))
        page.get_by_role('button', name='한국어로 보기', exact=True).click()
        expect(page.locator('.chapter-title')).to_have_text('스킬라와 카리브디스')
        header_fits(page)
        context.close()
    results.append('English browser default and both language layouts work at 320, 375 and 760px; mobile chapter selection and expanded discoveries work')

    context = browser.new_context(locale='en-GB', reduced_motion='reduce')
    context.add_init_script("""Storage.prototype.getItem = () => { throw new Error('blocked'); };
      Storage.prototype.setItem = () => { throw new Error('blocked'); };""")
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    expect(page.locator('html')).to_have_attribute('lang', 'en')
    page.get_by_role('button', name='한국어로 보기', exact=True).click()
    expect(page.locator('html')).to_have_attribute('lang', 'ko')
    page.get_by_role('button', name='항해 시작', exact=True).click()
    expect(page.locator('.map-heading h1')).to_have_text('트로이')
    results.append('Blocked storage still allows browser-language detection, switching and navigation')
    context.close()
    browser.close()

assert not errors, errors
report = {'results': results, 'browser_errors': errors}
(OUT / 'language-validation.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps(report, indent=2, ensure_ascii=True))
