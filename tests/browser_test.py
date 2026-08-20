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
    manifest=json.loads((ROOT/'data/catalog.json').read_text())
    data={'./data/catalog.json':manifest}
    for name in manifest['shards']:
        data[f'./data/{name}']=json.loads((ROOT/'data'/name).read_text())
    if manifest.get('offers'):
        data[f'./data/{manifest["offers"]}']=json.loads((ROOT/'data'/manifest['offers']).read_text())
    expected_count=sum(len(data[f'./data/{name}']['records']) for name in manifest['shards'])
    shim=f"""const __DATA={json.dumps(data)};
globalThis.fetch=async input=>{{
  const key=typeof input==='string'?input:input.url;
  const value=__DATA[key];
  return value
    ? new Response(JSON.stringify(value),{{status:200,headers:{{'content-type':'application/json'}}}})
    : new Response('',{{status:404}});
}};"""
    html=html.replace('<link rel="stylesheet" href="styles.css">',f'<style>{css}</style>')
    html=html.replace('<script type="module" src="app.js"></script>',f'<script type="module">{catalog}\n{shim}\n{app}</script>')
    return html,expected_count

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page=browser.new_page(viewport={"width":1280,"height":900})
        errors=[]
        page.on('pageerror',lambda exc: errors.append(f'pageerror: {exc}'))
        html,expected_count=bundled_html()
        page.set_content(html,wait_until='load')
        page.wait_for_function(f"document.querySelector('#resultCount').textContent === '{expected_count}'")
        assert int(page.locator('#resultCount').inner_text())==expected_count

        page.locator('#query').fill('Safeway')
        assert int(page.locator('#resultCount').inner_text())>=1
        assert page.locator('.fit-result',has_text='External dimensions unavailable').count()>=1
        page.locator('#clear').click()

        page.locator('#query').fill('6084707')
        assert page.locator('#resultCount').inner_text()=='1'
        assert 'Buy at Ace Hardware' in page.locator('.seller-links').inner_text()
        page.locator('#clear').click()

        page.locator('#query').fill('10791891')
        assert page.locator('#resultCount').inner_text()=='1'
        page.locator('#clear').click()
        page.locator('#query').fill('HDPE')
        assert int(page.locator('#resultCount').inner_text()) >= 19
        page.locator('#clear').click()
        page.locator('#brandFilter').select_option('Rubbermaid Commercial')
        assert int(page.locator('#resultCount').inner_text())>=4
        page.locator('#clear').click()
        page.locator('#query').fill('69020CLBKKIT')
        page.locator('#shelfWidth').fill('20'); page.locator('#shelfDepth').fill('20'); page.locator('#shelfHeight').fill('24')
        page.locator('#fitOnly').check()
        assert page.locator('#resultCount').inner_text()=='1'
        assert 'Fits 1 per shelf' in page.locator('.fit-result').inner_text()
        page.locator('#unitToggle').click()
        assert page.locator('#widthUnit').inner_text()=='mm'
        assert page.locator('#shelfWidth').input_value()=='508'
        purchase=page.locator('.purchase-link')
        assert purchase.get_attribute('href').startswith('https://www.webstaurantstore.com/')
        assert purchase.get_attribute('target')=='_blank'
        assert page.locator('#previewDialog').count()==0
        assert not errors, '\n'.join(errors)
        browser.close()
    print('browser smoke test passed')

if __name__=='__main__': main()
