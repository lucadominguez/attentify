#!/usr/bin/env python3
"""
Reproduce: "doesn't auto-detect page changes — I must restart the plugin."
Checks whether rule-based blocking handles dynamic DOM + SPA navigation WITHOUT any
re-injection / restart, on a single long-lived tab.
"""
import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-dyn"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")
OK = "\033[92mPASS\033[0m"; NO = "\033[91mFAIL\033[0m"

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

        # Create a custom rule for example.com hiding .pd-ad
        await ext.evaluate("""() => new Promise(r => chrome.runtime.sendMessage({type:'create:rule', rule:{
            id:'dyn-test', domain:'example.com', displayName:'Dyn ads', selectors:['.pd-ad'], enabled:true,
            urlPatterns:[], antiBypassSearchTerms:[]}}, r))""")

        page = await ctx.new_page()
        await page.goto("https://example.com/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.6)  # content script applies rule CSS

        async def disp(sel):
            return await page.evaluate("(s)=>{const e=document.querySelector(s);return e?getComputedStyle(e).display:'gone';}", sel)
        async def add(cls, idn):
            await page.evaluate("([c,i])=>{const d=document.createElement('div');d.className=c;d.id=i;d.textContent='x';d.style.cssText='width:300px;height:120px';document.body.appendChild(d);}", [cls, idn])

        style_present = await page.evaluate("()=>!!document.getElementById('pd-element-blocker')")
        ck("rule CSS injected on load", style_present)

        print("\n── Dynamic DOM (no restart) ─────────────────────────────")
        await add('pd-ad', 'ad1')
        await asyncio.sleep(0.3)
        ck("element added AFTER load is hidden by CSS", await disp('#ad1') == 'none', f"({await disp('#ad1')})")

        await asyncio.sleep(1.0)
        await add('pd-ad', 'ad2')   # even later — simulates infinite scroll
        await asyncio.sleep(0.3)
        ck("late-added element also hidden (CSS persists)", await disp('#ad2') == 'none', f"({await disp('#ad2')})")

        print("\n── SPA navigation (history API, no full reload) ─────────")
        await page.evaluate("() => history.pushState({}, '', '/watch?v=abc')")
        await asyncio.sleep(1.2)   # past the 500ms URL poll
        await add('pd-ad', 'ad3')
        await asyncio.sleep(0.3)
        ck("rule still applies after SPA nav", await disp('#ad3') == 'none', f"({await disp('#ad3')})")
        still = await page.evaluate("()=>!!document.getElementById('pd-element-blocker')")
        ck("style element survived SPA nav", still)

        print("\n── New rule reaches an already-open tab (no restart) ────")
        await ext.evaluate("""() => new Promise(r => chrome.runtime.sendMessage({type:'create:rule', rule:{
            id:'dyn-test-2', domain:'example.com', displayName:'Dyn promo', selectors:['.pd-promo'], enabled:true,
            urlPatterns:[], antiBypassSearchTerms:[]}}, r))""")
        await asyncio.sleep(0.8)
        await add('pd-promo', 'promo1')
        await asyncio.sleep(0.4)
        ck("newly-created rule hides element on open tab", await disp('#promo1') == 'none', f"({await disp('#promo1')})")

        print("\n── Style node removed by the page (SPA re-render) ───────")
        # Re-enable the rule first
        await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'toggle:rule', ruleId:'dyn-test', enabled:true}, r))")
        await asyncio.sleep(0.8)
        # Simulate a framework wiping our injected stylesheet
        await page.evaluate("()=>{const s=document.getElementById('pd-element-blocker'); if(s) s.remove();}")
        await asyncio.sleep(0.2)
        await add('pd-ad', 'ad4')   # new distraction appears after the style was nuked
        await page.evaluate("() => history.pushState({}, '', '/watch?v=def')")  # trigger the poll
        await asyncio.sleep(1.4)
        recovered = await page.evaluate("()=>!!document.getElementById('pd-element-blocker')")
        ck("style re-asserted after external removal", recovered, f"(present={recovered})")
        ck("blocking recovers without restart", await disp('#ad4') == 'none', f"({await disp('#ad4')})")

        print("\n── Toggling a rule off un-hides without restart ─────────")
        await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'toggle:rule', ruleId:'dyn-test', enabled:false}, r))")
        await asyncio.sleep(0.8)
        ck("toggling rule off restores elements", await disp('#ad1') != 'none', f"({await disp('#ad1')})")

        await ctx.close()
    print(f"\n════════ {p_} passed, {f} failed ════════")
    sys.exit(1 if f else 0)

asyncio.run(main())
