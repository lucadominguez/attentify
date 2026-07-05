#!/usr/bin/env python3
"""
YouTube Shorts shelf detection test.

The logged-out YouTube home doesn't render a Shorts shelf, so we replicate the CURRENT
logged-in DOM (ytd-rich-section-renderer > ytd-rich-shelf-renderer[is-shorts] with tiles
linking to /shorts/<id>) plus a normal /watch shelf as a negative control, and verify:
  1. The deploy-proof rule selectors match the Shorts shelf and NOT the normal shelf.
  2. Those selectors actually hide the shelf when injected as CSS (the real mechanism).
  3. The scanner flags the Shorts shelf (high) and emits a precise :has() selector.
"""
import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-ytshelf"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")
OK = "\033[92mPASS\033[0m"; NO = "\033[91mFAIL\033[0m"

# Tiles linking to /shorts/<id> (shorts) vs /watch?v= (normal) — the real invariant.
SHELVES = """() => {
  document.body.innerHTML = '';
  const tiles = (kind, n) => Array.from({length:n}, (_,i) =>
    `<ytd-rich-item-renderer style="display:inline-block;width:150px;height:280px">
       <a href="${kind==='s' ? '/shorts/vid'+i : '/watch?v=w'+i}">t${i}</a>
     </ytd-rich-item-renderer>`).join('');
  // Shorts shelf (current logged-in structure)
  const s = document.createElement('div');
  s.innerHTML = `<ytd-rich-section-renderer style="display:block;width:920px">
    <ytd-rich-shelf-renderer is-shorts style="display:block;width:920px;height:360px">
      <div id="rich-shelf-header"><h2 id="title">Shorts</h2></div>
      <div id="contents">${tiles('s',8)}</div>
    </ytd-rich-shelf-renderer></ytd-rich-section-renderer>`;
  document.body.appendChild(s.firstElementChild);
  // Normal video shelf — negative control (links to /watch)
  const v = document.createElement('div');
  v.innerHTML = `<ytd-rich-section-renderer id="normal-shelf" style="display:block;width:920px">
    <ytd-rich-shelf-renderer style="display:block;width:920px;height:360px">
      <div id="rich-shelf-header"><h2>Recommended videos</h2></div>
      <div id="contents">${tiles('v',8)}</div>
    </ytd-rich-shelf-renderer></ytd-rich-section-renderer>`;
  document.body.appendChild(v.firstElementChild);
  return true;
}"""

RULE_SHORTS_SELECTORS = [
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-rich-section-renderer:has(a[href^="/shorts/"])',
    'ytd-rich-shelf-renderer:has(a[href^="/shorts/"])',
    'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
]

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    p_ = f = 0
    def ck(n, c, e=""):
        nonlocal p_, f; p_, f = (p_+1, f) if c else (p_, f+1); print(f"  {OK if c else NO}  {n}  {e}")

    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            UDD, headless=False, executable_path=CHROME,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}", "--no-sandbox", "--disable-dev-shm-usage"])
        await asyncio.sleep(2)
        eid = None
        for _ in range(20):
            for sw in ctx.service_workers:
                if "chrome-extension://" in sw.url: eid = sw.url.split("/")[2]
            if eid: break
            await asyncio.sleep(0.3)
        ext = await ctx.new_page()
        await ext.goto(f"chrome-extension://{eid}/popup.html", wait_until="load")
        await asyncio.sleep(0.4)
        await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'set:auto-block', enabled:false}, r))")

        page = await ctx.new_page()
        await page.goto("https://example.com/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.2)
        await page.evaluate(SHELVES)
        await asyncio.sleep(0.4)

        async def count(sel):
            return await page.evaluate("(s)=>{try{return document.querySelectorAll(s).length}catch(e){return -1}}", sel)
        async def disp(sel):
            return await page.evaluate("(s)=>{const e=document.querySelector(s);return e?getComputedStyle(e).display:'gone';}", sel)

        print("\n── Deploy-proof rule selectors match the Shorts shelf ───")
        for s in RULE_SHORTS_SELECTORS:
            n = await count(s)
            want = 8 if 'item-renderer' in s else 1
            ck(f"{s}", n == want, f"(matched {n}, want {want})")
        # negative control: shorts selector must NOT hit the normal /watch shelf
        normal_hit = await page.evaluate("""()=>{
          const norm = document.getElementById('normal-shelf');
          return norm.matches('ytd-rich-section-renderer:has(a[href^=\\"/shorts/\\"])');
        }""")
        ck("normal /watch shelf NOT matched by shorts selector", normal_hit is False)

        print("\n── :has() selector actually hides the shelf (CSS path) ──")
        await ext.evaluate("""() => new Promise(async r => {
            const tabs = await chrome.tabs.query({});
            const t = tabs.find(t => t.url && t.url.startsWith('https://example.com'));
            chrome.tabs.sendMessage(t.id, {type:'hide:adhoc', selectors:['ytd-rich-section-renderer:has(a[href^=\"/shorts/\"])']}, () => r(1));
        })""")
        await asyncio.sleep(0.4)
        shorts_disp = await disp('ytd-rich-section-renderer:has(a[href^="/shorts/"])')
        normal_disp = await disp('#normal-shelf')
        ck("Shorts shelf hidden", shorts_disp == 'none', f"({shorts_disp})")
        ck("normal shelf still visible", normal_disp != 'none', f"({normal_disp})")
        # undo for a clean scan
        await ext.evaluate("""() => new Promise(async r => {
            const tabs = await chrome.tabs.query({});
            const t = tabs.find(t => t.url && t.url.startsWith('https://example.com'));
            chrome.tabs.sendMessage(t.id, {type:'unhide:adhoc', selectors:['ytd-rich-section-renderer:has(a[href^=\"/shorts/\"])']}, () => r(1));
        })""")
        await asyncio.sleep(0.3)

        print("\n── Scanner flags the Shorts shelf ───────────────────────")
        scan = await ext.evaluate("""() => new Promise(async r => {
            const tabs = await chrome.tabs.query({});
            const t = tabs.find(t => t.url && t.url.startsWith('https://example.com'));
            chrome.tabs.sendMessage(t.id, {type:'scan:page'}, res => r(res||{}));
        })""")
        cands = scan.get("candidates", [])
        sh = next((c for c in cands if 'short' in (' '.join(c.get('signals',[]))+c.get('label','')).lower()
                   or '/shorts/' in c.get('selector','')), None)
        ck("Shorts shelf detected", bool(sh), f"({sh['label'] if sh else None} {sh['signals'] if sh else ''})")
        if sh:
            ck("flagged high confidence", sh['confidence'] == 'high', f"(score={sh['score']} {sh['confidence']})")
            ck("emits precise :has() selector", ':has(' in sh['selector'] and '/shorts/' in sh['selector'], f"(sel={sh['selector']!r})")

        await ctx.close()
    print(f"\n════════ {p_} passed, {f} failed ════════")
    sys.exit(1 if f else 0)

asyncio.run(main())
