#!/usr/bin/env python3
"""Diagnostic: does the scanner learn user topics from chat prefs + report what it auto-hides?"""
import asyncio, os, json
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-prefs"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

INJECT = """() => {
  const mk = h => { const d=document.createElement('div'); d.innerHTML=h; document.body.appendChild(d.firstElementChild); };
  mk('<section aria-label="Top story" style="width:600px;height:220px"><h2>Headline</h2><p>Politics: the election results and the congress debate dominated today.</p></section>');
  mk('<section aria-label="Recipes" style="width:600px;height:220px"><h2>Cooking</h2><p>How to bake sourdough bread at home.</p></section>');
  return true;
}"""

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
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
        # Simulate what the chat does when the user says "hide political content"
        learned = await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'set:auto-hide-prefs', keywords:['politics','election']}, r))")
        print("learned prefs ->", learned)

        page = await ctx.new_page()
        await page.goto("https://example.com/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.2)
        await page.evaluate(INJECT)
        await asyncio.sleep(2.6)   # let the auto-scan run with the learned topic

        async def disp(sel):
            return await page.evaluate("(s)=>{const e=document.querySelector(s);return e?getComputedStyle(e).display:'gone';}", sel)
        pol = await disp('section[aria-label="Top story"]')
        rec = await disp('section[aria-label="Recipes"]')
        print(f"political section display: {pol!r} (want none) | recipes: {rec!r} (want block)")

        scan = await ext.evaluate("""() => new Promise(async r => {
            const tabs = await chrome.tabs.query({});
            const t = tabs.find(t => t.url && t.url.startsWith('https://example.com'));
            chrome.tabs.sendMessage(t.id, {type:'get:distractions'}, res => r(res));
        })""")
        ah = scan.get("autoHidden", [])
        print("userKeywords seen by content:", scan.get("userKeywords"))
        print(f"auto-hidden items reported: {len(ah)}")
        for c in ah:
            print(f"   - {c['label']!r}  signals={c['signals']}  userWanted={c.get('userWanted')}")
        politem = next((c for c in ah if 'Top story' in (c.get('label') or '')), None)
        print(f"\nRESULT: political content auto-hidden by user-topic = {pol=='none' and bool(politem)} | benign untouched = {rec!='none'}")
        await ctx.close()

asyncio.run(main())
