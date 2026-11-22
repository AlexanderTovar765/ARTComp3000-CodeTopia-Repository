"""Smoke test: plays through the language select, admin mode, the C++ track and a few fights.
Run with:  pip install playwright && playwright install chromium && python tests/smoke_test.py
"""
import json,sys,random,os
def shot(**k): pass
from playwright.sync_api import sync_playwright
F='file://'+(sys.argv[1] if len(sys.argv)>1 else os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))); errs=[]
def gate(pg,l):
    """Use a destination button as a player would; fast=True just speeds the walk up so the test does not wait."""
    if not pg.is_visible('#village'):
        if not pg.is_visible('#mLang'): pg.click('#bMap')
        pg.click('#mLang')
    pg.evaluate('V.fast=true'); pg.click(f'.vn[data-p={l}]'); pg.wait_for_selector('#map:not([hidden])',timeout=15000); pg.wait_for_timeout(200)
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
            if bt.inner_text().strip().lower() in ('open map','back to map','map'): bt.click(); return
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
    pg.click('#aGuest')
    pg.click('#sSkip'); pg.click('#play'); print('play -> village visible:',pg.is_visible('#village'),'|',pg.inner_text('#vMood'))
    pg.evaluate('closeVillage();openMap()'); pg.wait_for_timeout(600); print('first-meeting cutscene:',pg.is_visible('#cine'),'|',pg.inner_text('#cineWho')); pg.click('#cineSkip'); pg.wait_for_timeout(900)
    print('mentor strip:',pg.inner_text('#mentor b'),'|',pg.inner_text('#mentor p')[:40]); pg.evaluate('$("#mTip").click();$("#mMeet").click()'); pg.wait_for_timeout(500); print('story replay:',pg.is_visible('#cine')); pg.click('#cineSkip'); pg.wait_for_timeout(900)
    pg.evaluate('D.met={html:1,cpp:1,js:1,py:1,css:1};closeSheets()')
    pg.evaluate('openBook("map")'); print('librarian:',pg.inner_text('#librarian b'),'|',pg.inner_text('#librarian p')[:40]); pg.evaluate('$("#lDue").click()'); print('due-only grid:',pg.inner_text('#bookgrid')[:40]); pg.evaluate('$("#lDue").click()'); pg.evaluate('closeSheets()')
    pg.evaluate('openVillage()'); print('village nav:',[(b.get_attribute('data-p'),b.inner_text().replace('\n',' | ')) for b in pg.query_selector_all('.vn')])
    pg.evaluate('V.fast=true'); pg.click('.vn[data-p=html]'); pg.wait_for_selector('#map:not([hidden])',timeout=15000); print('html gate via button opens map:',pg.inner_text('#mapTitle'),'| scene',pg.evaluate('V.scene'))
    pg.evaluate('D.met={html:1,cpp:1,js:1,py:1,css:1}'); pg.click('#mLang'); pg.wait_for_timeout(300); print('back in village, still in html district:',pg.evaluate('V.scene'))
    pg.evaluate('vSwitch("sq",160,172)'); pg.wait_for_timeout(700); pg.click('.vn[data-p=cpp]'); pg.wait_for_timeout(900); print('locked road: stays in village',pg.is_visible('#village'),'|',pg.inner_text('#vBub span')[:40],'| scene',pg.evaluate('V.scene'))
    pg.click('.vn[data-p=lib]'); pg.wait_for_selector('#book:not([hidden])',timeout=8000); print('library from village:',pg.is_visible('#book'),pg.inner_text('#bClose')); pg.click('#bClose'); print('back in village:',pg.is_visible('#village'),pg.is_hidden('#book'))
    pg.click('.vn[data-p=shop]'); pg.wait_for_selector('#unl:not([hidden])',timeout=8000); print('shop from village:',pg.is_visible('#unl'),pg.inner_text('#uClose')); pg.click('#uClose'); print('back in village:',pg.is_visible('#village'),pg.is_hidden('#unl'))
    pg.click('.vn[data-p=forge]'); pg.wait_for_timeout(1200); print('forge cold at start:',pg.is_hidden('#sbx'),'|',pg.inner_text('#vBub span')[:30])
    pg.evaluate('(D.track==="html"?D.unlocked=4:D.tracks.html.unlocked=4);vRepaint()'); pg.evaluate('V.fast=true'); pg.click('.vn[data-p=forge]'); pg.wait_for_selector('#sbx:not([hidden])',timeout=8000); print('forge opens sandbox:',pg.inner_text('#sbxTitle'),pg.inner_text('#sClose')); print('forge tabs:',pg.eval_on_selector_all('.fgtab','e=>e.map(x=>x.textContent+(x.disabled?"!":""))')); pg.fill('#sbxIn','<h1>Hi</h1>'); pg.wait_for_timeout(300); print('forge html preview:',pg.frame_locator('#sbxOut').locator('h1').inner_text()); pg.evaluate('D.admin=true'); pg.evaluate('fgShow()'); pg.click('.fgtab[data-lang=py]'); pg.click('#fgRun'); pg.wait_for_timeout(400); print('forge python:',repr(pg.inner_text('#fgCon')[:20])); pg.click('.fgtab[data-lang=cpp]'); pg.click('#fgRun'); pg.wait_for_timeout(400); print('forge c++:',repr(pg.inner_text('#fgCon')[:20])); pg.click('.fgtab[data-lang=js]'); pg.click('#fgRun'); pg.wait_for_timeout(900); print('forge js:',repr(pg.inner_text('#fgCon')[:20])); pg.evaluate('D.admin=false'); pg.click('#sClose'); print('back in village:',pg.is_visible('#village'))
    pg.click('.vn[data-p=tower]'); pg.wait_for_selector('#tower:not([hidden])',timeout=8000); print('tower from village:',pg.is_visible('#tower')); pg.evaluate('closeTower()'); print('back in village:',pg.is_visible('#village'))
    pg.evaluate('V.fast=false; V.path=[]; V.scene="sq"; V.sc=vScene("sq"); V.x=160; V.y=172'); x0=pg.evaluate('[V.x,V.y]'); pg.keyboard.down('d'); pg.keyboard.down('w'); pg.wait_for_timeout(400); pg.keyboard.up('d'); pg.keyboard.up('w'); x1=pg.evaluate('[V.x,V.y]'); print('walk with keys (both axes):',x1[0]>x0[0] and x1[1]<x0[1])
    pg.evaluate('V.x=100;V.y=140'); r=pg.eval_on_selector('#vcv','e=>e.getBoundingClientRect().toJSON()'); pg.mouse.click(r['x']+r['width']*0.8,r['y']+r['height']*0.8); pg.wait_for_timeout(600); print('tap to walk moved:',pg.evaluate('[V.x,V.y]')!=[100,140])
    pg.evaluate('V.x=230;V.y=205;V.path=[];vGoto(330,205)'); pg.wait_for_timeout(400); pg.evaluate('V.fast=true'); pg.wait_for_timeout(800); print('path around fountain reached:',pg.evaluate('Math.abs(V.x-330)<3'))
    pg.evaluate('V.fast=false;V.scene="sq";V.sc=vScene("sq");V.x=320;V.y=262;V.path=[]'); pg.keyboard.down('s'); pg.wait_for_timeout(5000); pg.keyboard.up('s'); pg.wait_for_timeout(800); print('walk off south edge -> html district:',pg.evaluate('V.scene'))
    shot(path='c_village.png')
    gate(pg,'html')
    print('map buttons:',[x.inner_text() for x in pg.query_selector_all('#map .sheet-top .hbtn')],'| arena els:',len(pg.query_selector_all('#arenaWrap, #arena')))
    shot(path='c_map_html.png')
    pg.click('#mAdmin'); print('admin on; html arena els:',len(pg.query_selector_all('#arenaWrap')),'locked nodes',len(pg.query_selector_all('#trail .node:disabled')))
    gate(pg,'cpp')
    print('cpp map title:',pg.inner_text('#mapTitle'),'| nodes:',len(pg.query_selector_all('#trail .node')),'locked:',len(pg.query_selector_all('#trail .node:disabled')),'| forge button gone:',pg.query_selector('#mSbx') is None)
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
    pg.click('#mClose') if pg.is_visible('#mClose') else None; pg.click('#bMap'); pg.click('#mLang'); print('battle -> map -> village visible:',pg.is_visible('#village'),'| no section links in battle/map:',pg.evaluate('!document.querySelector("#bBook,#bLang,#mBook,#mUnl")'))
    gate(pg,'html'); print('back to html map:',pg.inner_text('#mapTitle'),'| nodes',len(pg.query_selector_all('#trail .node')),'| back-to-battle visible',pg.is_visible('#mClose'))
    # Python track: castle-roof map, then the Pythona finale cutscenes and blind final form
    gate(pg,'py'); print('py map:',pg.inner_text('#mapTitle'),'| nodes',len(pg.query_selector_all('#trail .node')))
    pg.evaluate('D.unlocked=10;persist();startLevel(10)'); pg.click('#card .btn'); pg.wait_for_timeout(500)
    print('pre cutscene visible:',pg.is_visible('#cine'),'|',pg.inner_text('#cineTxt')[:30]); pg.click('#cineSkip'); pg.wait_for_timeout(900)
    pg.evaluate('S.foeHP=Math.floor(S.foeMax/2)+1;bars()'); pg.evaluate('S.phase2=false')
    pg.evaluate('(async()=>{S.foeHP=1;bars();})()')
    pg.evaluate('void playCine(CINE_MID)'); pg.wait_for_timeout(400); print('mid cutscene visible:',pg.is_visible('#cine')); pg.click('#cineSkip'); pg.wait_for_timeout(900)
    pg.evaluate('S.ruin=true;S.blind=true;drawBackdrop();S.busy=false;lock(false)'); pg.click('.act.attack')
    if pg.is_visible('#picks'): print('blind picks:',[b.inner_text().replace('\n',' ') for b in pg.query_selector_all('.pick')][:1]); pg.click('.pick >> nth=0')
    print('blind lesson title:',pg.inner_text('#lTitle'),'| mode',pg.evaluate('S.mode'))
    pg.evaluate('S.busy=false;S.phase2=false'); pg.fill('textarea','HACK'); pg.wait_for_timeout(900); print('HACK in phase 1 plays collapse:',pg.is_visible('#cine')); pg.click('#cineSkip'); pg.wait_for_timeout(1200); print('foe hp after collapse:',pg.inner_text('#foeHpTxt')); pg.click('.act.attack')
    if pg.is_visible('#picks'): pg.click('.pick >> nth=0')
    pg.fill('textarea','HACK'); pg.wait_for_timeout(1200); print('end cutscene visible:',pg.is_visible('#cine')); pg.click('#cineSkip'); pg.wait_for_timeout(1500)
    print('win card:',pg.inner_text('#card h2'))
    # admin off while in cpp (html not cleared)
    openmap(pg); gate(pg,'cpp'); pg.click('#mAdmin'); print('admin off in cpp ->',pg.inner_text('#mapTitle'))
    pg.click('#mLang'); print('cpp locked again:',pg.evaluate('V.open.cpp===false'))
    pg.evaluate('D.admin=false;((id,v)=>{const t=id===D.track?D:(D.tracks[id]=D.tracks[id]||blankTrack());t.stars[10]=v})("html",0);persist();vRepaint()'); print('css locked until html done:',pg.evaluate('V.open.css===false'),'guild locked too:',pg.evaluate('V.open.guild===false'))
    pg.evaluate('((id,v)=>{const t=id===D.track?D:(D.tracks[id]=D.tracks[id]||blankTrack());t.stars[10]=v})("html",3);persist();vRepaint()'); print('css opens after html:',pg.evaluate('V.open.css===true && V.open.cpp===false'),'guild opens after html:',pg.evaluate('V.open.guild===true'))
    pg.evaluate('V.scene="sq";V.sc=vScene("sq");V.x=490;V.y=372;V.path=[];V.fast=false;V.keys={}'); pg.keyboard.down('s'); pg.wait_for_timeout(2500); pg.keyboard.up('s'); pg.wait_for_timeout(900); print('walk down the SE road -> guild district:',pg.evaluate('V.scene'),'| square size',pg.evaluate('vScene("sq").w+"x"+vScene("sq").h'))
    pg.evaluate('((id,v)=>{const t=id===D.track?D:(D.tracks[id]=D.tracks[id]||blankTrack());t.stars[10]=v})("css",3);persist();vRepaint()'); print('cpp opens after css:',pg.evaluate('V.open.cpp===true'))
    pg.evaluate('((id,v)=>{const t=id===D.track?D:(D.tracks[id]=D.tracks[id]||blankTrack());t.stars[10]=v})("css",0);((id,v)=>{const t=id===D.track?D:(D.tracks[id]=D.tracks[id]||blankTrack());t.stars[10]=v})("html",0);persist();vRepaint()')
    # JavaScript track (admin mode on from here), the spiral keep map, level 10 live page, Unlockables
    pg.evaluate('D.admin=true;persist();openVillage()'); gate(pg,'js'); print('js map:',pg.inner_text('#mapTitle'),'| nodes',len(pg.query_selector_all('#trail .node')))
    for L in (1,4,5,7,10):
        pg.click(f'.node[data-l="{L}"]'); print('JS L',L,pg.inner_text('#card h2'),'| foe',pg.inner_text('#foeName')); pg.click('#card .btn')
        for _ in range(4):
            if not turn(pg): break
        if L==10: print('L10 iframe in result:',bool(pg.query_selector('#preview iframe')) or 'cast ok')
        openmap(pg)
    pg.evaluate('openUnl()'); print('unlockables open:',pg.is_visible('#owngrid') or pg.is_visible('#unlGrid') or 'sheet shown'); pg.keyboard.press('Escape')
    # mobile
    m=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce'); mp=m.new_page(); mp.on('pageerror',lambda e:errs.append(str(e)))
    mp.goto(F); mp.evaluate('localStorage.clear()'); mp.reload(); mp.click('#aGuest'); mp.click('#sSkip'); mp.click('#play'); mp.evaluate('D.met={html:1,cpp:1,js:1,py:1,css:1}'); mp.evaluate('V.fast=true'); mp.click('.vn[data-p=html]'); mp.wait_for_selector('#map:not([hidden])'); mp.click('#mAdmin'); shot(path='c_m_map.png')
    mp.click('#mLang'); mp.wait_for_timeout(300); shot(path='c_m_lang.png'); mp.evaluate('V.fast=true'); mp.click('.vn[data-p=cpp]'); mp.wait_for_selector('#map:not([hidden])'); mp.click('.node[data-l="5"]'); mp.click('#card .btn')
    mp.click('.act.attack'); 
    if mp.is_visible('#picks'): mp.click('.pick >> nth=0')
    mp.wait_for_selector('#lesson'); shot(path='c_m_lesson.png')
    print('mobile overflow',mp.evaluate('document.documentElement.scrollWidth>innerWidth'))
    # village missions: walk to Pip, solve through the UI, paid once only
    pg.evaluate('localStorage.clear()'); pg.reload(); pg.click('#aGuest'); pg.click('#sSkip'); pg.click('#play'); pg.wait_for_timeout(400)
    pg.evaluate('D.met={html:1,cpp:1,js:1,py:1,css:1};D.admin=1;persist();vRepaint();V.x=518;V.y=240;V.path=[];vCamSnap()'); pg.wait_for_timeout(500)
    print('giver prompt:',pg.inner_text('#vPrompt')); pg.keyboard.press('e'); pg.wait_for_timeout(300)
    pg.fill('#msIn','wrong'); print('wrong answer coins:',pg.evaluate('D.coins'))
    pg.fill('#msIn',pg.evaluate('msCur.answers[0]')); pg.wait_for_timeout(200); print('paid:',pg.evaluate('D.coins'),'| done box:',pg.is_visible('#msDone'))
    pg.click('#msBack2'); pg.wait_for_timeout(300); print('missions counter:',pg.inner_text('#vMis'),'| coins unchanged on revisit:',pg.evaluate('(openMission("courier"),msBack(),D.coins)'))
    pg.evaluate('MISSIONS.forEach(m=>{D.missions[m.id]=1})'); print('all done state:',pg.evaluate('missionState("baker").s'))
    # sound: engine starts on a gesture, director follows the screen, toggles persist
    pg.mouse.click(5,5); pg.wait_for_timeout(600); pg.evaluate('MUSIC.direct()'); print('audio ctx:',pg.evaluate('SND.ctx&&SND.ctx.state'),'| theme:',pg.evaluate('MUSIC.now'))
    pg.evaluate('document.querySelector(".sndbtn").click()'); print('sound button off ->',pg.evaluate('[D.audio.m,D.audio.s]'),pg.evaluate('document.querySelector(".sndbtn").textContent')); pg.evaluate('document.querySelector(".sndbtn").click()'); print('sound button on ->',pg.evaluate('[D.audio.m,D.audio.s]'))
    # debuggers guild: board, a HTML case, a JavaScript case that really runs, locks, saving
    pg.evaluate('D.admin=true;D.coins=0;D.guild={};persist();vRepaint();openGuild()'); pg.wait_for_timeout(400)
    print('guild board cards:',pg.evaluate('document.querySelectorAll("#gdGrid .gd-card").length'),'| tabs open:',pg.evaluate('[...document.querySelectorAll("#gdTabs button")].filter(b=>!b.disabled).length'))
    pg.evaluate('openCase("h2")'); pg.wait_for_timeout(300); pg.click('.gd-line[data-i="0"]'); print('wrong line rejected:',pg.evaluate('GD.step===1&&GD.wl===1'))
    pg.click('.gd-line[data-i="1"]'); pg.click('.gd-opt[data-t="missing"]'); pg.fill('#gdIn','<a href="https://bakery.example">Visit our shop</a>'); pg.click('[data-a="test"]'); pg.wait_for_timeout(300)
    print('html case solved:',pg.evaluate('guildStars("h2")'),'stars, coins',pg.evaluate('D.coins'))
    pg.click('[data-a="board"]'); pg.evaluate('openCase("j3")'); pg.wait_for_timeout(1200); print('js symptom shown:',pg.evaluate('document.getElementById("gdOut").textContent.includes("undefined")'))
    pg.click('.gd-line[data-i="1"]'); pg.click('.gd-opt[data-t="value"]'); pg.fill('#gdIn','for (let i = 0; i < fruits.length; i++) {'); pg.click('[data-a="test"]'); pg.wait_for_timeout(1500); print('js case solved (3 stars):',pg.evaluate('guildStars("j3")'))
    pg.evaluate('openCase("y3")'); pg.wait_for_timeout(400); pg.click('.gd-line[data-i="1"]'); pg.click('.gd-opt[data-t="missing"]'); pg.fill('#gdIn','print(step)'); pg.click('[data-a="test"]'); pg.wait_for_timeout(500); print('python wrong fix rejected:',pg.evaluate('guildStars("y3")===0'))
    pg.evaluate('D.admin=false;D.tracks={};D.stars={};D.unlocked=1;persist();closeSheets();vRepaint()'); print('guild open langs without admin:',pg.evaluate('GUILD_LANGS.filter(guildLangOpen).join(",")'))
    print('ERRS',errs); b.close()
