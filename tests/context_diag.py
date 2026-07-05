#!/usr/bin/env python3
"""Diagnostic: does the live context loop run on navigation and store an assessment?
No API key is set, so this exercises the local-heuristic fallback path end-to-end:
content -> context:navigated -> background.assessContext -> context:assessment -> stored."""
import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-ctx"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")
OK="\033[92mPASS\033[0m"; NO="\033[91mFAIL\033[0m"

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    p_=f=0
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            UDD, headless=False, executable_path=CHROME,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}", "--no-sandbox", "--disable-dev-shm-usage"])
        await asyncio.sleep(2)
        eid=None
        for _ in range(20):
            for sw in ctx.service_workers:
                if "chrome-extension://" in sw.url: eid=sw.url.split("/")[2]
            if eid: break
            await asyncio.sleep(0.3)
        ext = await ctx.new_page()
        await ext.goto(f"chrome-extension://{eid}/popup.html", wait_until="load")
        await asyncio.sleep(0.4)

        page = await ctx.new_page()
        await page.goto("https://example.com/?q=python+tutorial", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(2.5)   # content:ready + reportContext('load') @800ms + assess round-trip

        cs = await ext.evaluate("()=>new Promise(r=>chrome.runtime.sendMessage({type:'get:context-state'},res=>r(res)))")
        a = (cs or {}).get("assessment")
        def ck(n,c,e=""):
            nonlocal p_,f; p_,f=(p_+1,f) if c else (p_,f+1); print(f"  {OK if c else NO}  {n}  {e}")

        ck("assessment stored after navigation", isinstance(a, dict), f"({a})")
        if isinstance(a, dict):
            ck("has numeric distractionProbability", isinstance(a.get("distractionProbability"), (int,float)), f"(={a.get('distractionProbability')})")
            ck("used heuristic fallback (no key)", a.get("source")=="heuristic", f"(source={a.get('source')})")
            ck("intent reflects the search query", "python" in (a.get("intent","")+a.get("reason","")).lower() or a.get("distractionProbability",1)<0.3,
               f"(intent={a.get('intent')!r}, p={a.get('distractionProbability')})")

        # content side should have adopted it
        gc = await ext.evaluate("""()=>new Promise(async r=>{const tabs=await chrome.tabs.query({});const t=tabs.find(t=>t.url&&t.url.startsWith('https://example.com'));chrome.tabs.sendMessage(t.id,{type:'get:context'},res=>r(res||{}));})""")
        ck("content adopted assessment", isinstance(gc.get("assessment"), dict), f"(distractionProb={gc.get('distractionProb')})")

        await ctx.close()
    print(f"\n════════ {p_} passed, {f} failed ════════")
    sys.exit(1 if f else 0)

asyncio.run(main())
