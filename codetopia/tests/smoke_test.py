"""Smoke test: plays through the language select, admin mode, the C++ track and a few fights.
Run with:  pip install playwright && playwright install chromium && python tests/smoke_test.py
"""
import json,sys,random,os
def shot(**k): pass
from playwright.sync_api import sync_playwright
F='file://'+(sys.argv[1] if len(sys.argv)>1 else os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))); errs=[]
def code_of(page): return page.eval_on_selector('#code','e=>e.textContent')
def type_code(page,txt):
    skip=False
    for ch in txt:
        if ch=='↵': page.keyboard.press('Enter'); skip=True; continue
        if ch==' ' and skip: continue
        skip=False; page.keyboard.type(ch)
def openmap(page):
    if not page.is_hidden('#overlay'):
        btns=page.query_selector_all('#card .btn'); 
        for bt in btns:
            if bt.inner_text().strip().lower() in ('open map','map'): bt.click(); return
    page.wait_for_function('!document.querySelector("#bMap").disabled',timeout=20000); page.click('#bMap')
def turn(page,act=None):
    page.wait_for_function('document.querySelector(".act:not(:disabled)") || !document.querySelector("#overlay").hidden',timeout=15000)
    if not page.is_hidden('#overlay'): return False
    acts=[a for a in page.query_selector_all('.act') if not a.is_disabled()]
    random.choice(acts).click()
    if page.is_visible('#picks'): random.choice(page.query_selector_all('.pick')).click()
    page.wait_for_selector('#lesson',state='visible')
    t=code_of(page); type_code(page,t)
    page.wait_for_function('document.querySelector("#editor").classList.contains("done")',timeout=8000)
    page.wait_for_function('document.querySelector(".act:not(:disabled)") || !document.querySelector("#overlay").hidden',timeout=20000)
    return True
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce'); pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.goto(F); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.click('#sSkip'); pg.click('#play')
    print('lang cards:',[(c.get_attribute('data-lang'),c.get_attribute('aria-disabled'),c.inner_text().replace('\n',' | ')) for c in pg.query_selector_all('.lang')])
    shot(path='c_lang_locked.png')
    pg.click('.lang[data-lang=cpp]',force=True); print('locked note:',pg.inner_text('#langNote'))
    pg.click('.lang[data-lang=html]')
    print('map buttons:',[x.inner_text() for x in pg.query_selector_all('#map .sheet-top .hbtn')],'| arena els:',len(pg.query_selector_all('#arenaWrap, #arena')))
    shot(path='c_map_html.png')
    pg.click('#mAdmin'); print('admin on; html arena els:',len(pg.query_selector_all('#arenaWrap')),'locked nodes',len(pg.query_selector_all('#trail .node:disabled')))
    pg.click('#mLang'); print('lang cards (admin):',[(c.get_attribute('data-lang'),c.get_attribute('aria-disabled'),c.inner_text().replace('\n',' | ')) for c in pg.query_selector_all('.lang')])
    shot(path='c_lang_admin.png')
    pg.click('.lang[data-lang=cpp]')
    print('cpp map title:',pg.inner_text('#mapTitle'),'| nodes:',len(pg.query_selector_all('#trail .node')),'locked:',len(pg.query_selector_all('#trail .node:disabled')),'| sandbox hidden:',pg.is_hidden('#mSbx'))
    shot(path='c_map_cpp.png')
    pg.click('.node[data-l="1"]'); print(pg.inner_text('#card h2')); pg.click('#card .btn')
    print('actions:',[a.inner_text().replace('\n',' / ') for a in pg.query_selector_all('.act')])
    pg.click('.act.attack'); 
    if pg.is_visible('#picks'): shot(path='c_picks.png'); pg.click('.pick >> nth=0')
    pg.wait_for_selector('#lesson'); print('goal:',pg.inner_text('#lGoal'),'| code:',repr(code_of(pg)),'| result:',repr(pg.inner_text('#preview')),'| lab:',pg.inner_text('#result .lab'))
    t=code_of(pg)
    # make a mistake first to see the hint
    pg.keyboard.type('x'); print('hint:',pg.inner_text('#feedback')); pg.keyboard.press('Backspace')
    type_code(pg,t); pg.wait_for_function('document.querySelector("#editor").classList.contains("done")')
    shot(path='c_cast.png')
    pg.wait_for_function('document.querySelector(".act:not(:disabled)")',timeout=20000)
    # play a few turns on level 1 until clear
    n=0
    while pg.is_hidden('#overlay') and n<40:
        turn(pg); n+=1
    print('L1 overlay:',pg.inner_text('#card h2'),'| turns',n)
    st=json.loads(pg.evaluate('localStorage.getItem("codetopia.campaign.v1")')); print('saved track',st['track'],'cpp tracks',st['tracks'].get('cpp',{}).get('unlocked'),'html unlocked',st['tracks'].get('html',{}).get('unlocked'), 'top unlocked',st['unlocked'])
    pg.click('#card .btn.alt')  # open map
    # higher cpp levels in admin
    for L in (4,7,10):
        pg.click(f'.node[data-l="{L}"]'); print('L',L,pg.inner_text('#card h2'),'| foe',pg.inner_text('#foeName')); pg.click('#card .btn')
        for _ in range(5): 
            if not turn(pg): break
        shot(path=f'c_l{L}.png'); openmap(pg)
    # battle header language select
    pg.click('#mClose') if pg.is_visible('#mClose') else None; pg.click('#bLang'); print('bLang -> panel lang visible:',pg.is_visible('#pLang'))
    pg.click('.lang[data-lang=html]'); print('back to html map:',pg.inner_text('#mapTitle'),'| nodes',len(pg.query_selector_all('#trail .node')),'| back-to-battle visible',pg.is_visible('#mClose'))
    # arena via language select
    pg.click('#mLang'); pg.click('.lang[data-lang=py]'); print('arena:',pg.inner_text('#card h2'))
    pg.click('#card .btn'); turn(pg)
    # admin off while in cpp (html not cleared)
    openmap(pg); pg.click('#mLang'); pg.click('.lang[data-lang=cpp]'); pg.click('#mAdmin'); print('admin off in cpp ->',pg.inner_text('#mapTitle'))
    pg.click('#mLang'); print('cpp locked again:',pg.get_attribute('.lang[data-lang=cpp]','aria-disabled'))
    # mobile
    m=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce'); mp=m.new_page(); mp.on('pageerror',lambda e:errs.append(str(e)))
    mp.goto(F); mp.evaluate('localStorage.clear()'); mp.reload(); mp.click('#sSkip'); mp.click('#play'); mp.click('.lang[data-lang=html]'); mp.click('#mAdmin'); shot(path='c_m_map.png')
    mp.click('#mLang'); shot(path='c_m_lang.png'); mp.click('.lang[data-lang=cpp]'); mp.click('.node[data-l="5"]'); mp.click('#card .btn')
    mp.click('.act.attack'); 
    if mp.is_visible('#picks'): mp.click('.pick >> nth=0')
    mp.wait_for_selector('#lesson'); shot(path='c_m_lesson.png')
    print('mobile overflow',mp.evaluate('document.documentElement.scrollWidth>innerWidth'))
    print('ERRS',errs); b.close()
