#!/usr/bin/env python3
"""Diagnostic: does the distraction scanner detect/score/hide UI elements?"""
import asyncio, os, json
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-scanner"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

DISTRACTIONS_JS = """() => {
  const mk = (html) => { const d=document.createElement('div'); d.innerHTML=html; document.body.appendChild(d.firstElementChild); };
  // 1) recommendation feed: role=feed + aria-label + repeated cards
  let cards=''; for(let i=0;i<8;i++) cards += '<article class="card" style="height:120px">item '+i+'</article>';
  mk('<section role="feed" aria-label="Recommended for you" style="width:600px">'+cards+'</section>');
  // 2) autoplay short video block
  mk('<aside aria-label="Shorts" style="width:300px;height:500px"><video autoplay loop muted style="width:300px;height:500px"></video></aside>');
  // 3) benign content that should NOT be flagged
  mk('<section aria-label="Article body" style="width:600px;height:400px"><p>normal reading content</p></section>');
  return document.body.children.length;
}"""

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            UDD, headless=False, executable_path=CHROME,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}",
                  "--no-sandbox", "--disable-dev-shm-usage"])
        await asyncio.sleep(2)
        eid = None
        for _ in range(20):
            for sw in ctx.service_workers:
                if "chrome-extension://" in sw.url: eid = sw.url.split("/")[2]
            if eid: break
            await asyncio.sleep(0.3)

        ext = await ctx.new_page()
        await ext.goto(f"chrome-extension://{eid}/popup.html", wait_until="load")
        await asyncio.sleep(0.5)

        async def to_tab(msg, urlpfx="https://example.com"):
            return await ext.evaluate("""(args) => new Promise(async r => {
                const [url, msg] = args;
                const tabs = await chrome.tabs.query({});
                const t = tabs.find(t => t.url && t.url.startsWith(url));
                if (!t) return r({error:'tab not found'});
                chrome.tabs.sendMessage(t.id, msg, res => r(res || {error: chrome.runtime.lastError?.message}));
            })""", [urlpfx, msg])

        async def disp(page, sel):
            return await page.evaluate("(s) => { const e=document.querySelector(s); return e?getComputedStyle(e).display:'gone'; }", sel)

        # ── Part A: MANUAL scan with auto-block OFF ──
        await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'set:auto-block', enabled:false}, r))")
        page = await ctx.new_page()
        await page.goto("https://example.com/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.6)
        await page.evaluate(DISTRACTIONS_JS)
        await asyncio.sleep(2.0)               # past the auto-scan window (should NOT hide; auto off)
        scan = await to_tab({"type": "scan:page"})
        cands = scan.get("candidates", []) if isinstance(scan, dict) else []
        print(f"[auto OFF] candidates: {len(cands)}")
        for c in cands:
            print(f"   [{c['score']:>3} {c['confidence']:>6}] {c['label']!r}  sel={c['selector']!r}  {c['signals']}")
        feed = next((c for c in cands if 'Recommended' in (c.get('label') or '')), None)
        print(f"  feed high-confidence: {bool(feed) and feed['confidence']=='high'}")
        print(f"  benign 'Article body' NOT flagged: {not any('Article' in (c.get('label') or '') for c in cands)}")
        if feed:
            await to_tab({"type": "hide:adhoc", "selectors": [feed["selector"]]})
            await asyncio.sleep(0.4)
            print(f"  after manual Hide -> feed display: {await disp(page, feed['selector'])!r} (want none)")

        # ── Part B: AUTO-hide with auto-block ON ──
        await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'set:auto-block', enabled:true}, r))")
        page2 = await ctx.new_page()
        await page2.goto("https://example.org/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.0)
        await page2.evaluate(DISTRACTIONS_JS)
        await asyncio.sleep(2.4)               # let the auto-scan run + hide
        fd = await disp(page2, '[role=feed]')
        ad = await disp(page2, 'aside[aria-label="Shorts"]')
        bn = await disp(page2, 'section[aria-label="Article body"]')
        print(f"[auto ON] feed display: {fd!r} | aside: {ad!r} | benign article: {bn!r}")
        print(f"  -> distractions auto-hidden: {fd=='none' and ad=='none'} | benign untouched: {bn!='none'}")

        await ctx.close()

asyncio.run(main())
