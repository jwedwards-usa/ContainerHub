import json, re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]

def bundled_html():
    html=(ROOT/'index.html').read_text()
    css=(ROOT/'styles.css').read_text()
    catalog=(ROOT/'src/catalog.js').read_text().replace('export function ','function ')
    app=(ROOT/'app.js').read_text()
    app=re.sub(r"^import \{.*?\} from './src/catalog.js';\n",'',app,flags=re.S)
    data=(ROOT/'data/containers.json').read_text()
    shim=f"const __DATA={data}; globalThis.fetch=async()=>new Response(JSON.stringify(__DATA),{{status:200,headers:{{'content-type':'application/json'}}}});"
    html=html.replace('<link rel="stylesheet" href="styles.css">',f'<style>{css}</style>')
    html=html.replace('<script type="module" src="app.js"></script>',f'<script type="module">{catalog}\n{shim}\n{app}</script>')
    return html

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page=browser.new_page(viewport={"width":1280,"height":900})
        errors=[]
        page.on('pageerror',lambda exc: errors.append(f'pageerror: {exc}'))
        page.set_content(bundled_html(),wait_until='load')
        page.wait_for_function("document.querySelector('#resultCount').textContent === '15'")
        assert page.locator('#resultCount').inner_text()=='15'
        page.locator('#query').fill('HDPE')
        assert page.locator('#resultCount').inner_text()=='3'
        page.locator('#clear').click()
        page.locator('#brandFilter').select_option('Rubbermaid Commercial')
        assert page.locator('#resultCount').inner_text()=='4'
        page.locator('#clear').click()
        page.locator('#query').fill('69020CLBKKIT')
        page.locator('#shelfWidth').fill('20'); page.locator('#shelfDepth').fill('20'); page.locator('#shelfHeight').fill('24')
        page.locator('#fitOnly').check()
        assert page.locator('#resultCount').inner_text()=='1'
        assert 'Fits 1 per shelf' in page.locator('.fit-result').inner_text()
        page.locator('#unitToggle').click()
        assert page.locator('#widthUnit').inner_text()=='mm'
        assert page.locator('#shelfWidth').input_value()=='508'
        page.locator('.preview-buy').click()
        assert page.locator('#previewDialog').evaluate('(e)=>e.open') is True
        assert page.locator('#openPurchase').get_attribute('href').startswith('https://www.webstaurantstore.com/')
        page.locator('#closePreview').click()
        assert not errors, '\n'.join(errors)
        browser.close()
    print('browser smoke test passed')

if __name__=='__main__': main()
