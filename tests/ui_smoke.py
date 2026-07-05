#!/usr/bin/env python3
"""
UI + plumbing smoke test for the bug-report flow and misprediction feedback log.
Drives the real side-panel page and the background message handlers.
"""
import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-uismoke"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

OK = "\033[92mPASS\033[0m"; NO = "\033[91mFAIL\033[0m"

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    passed = failed = 0
    def check(name, cond, extra=""):
        nonlocal passed, failed
        passed, failed = (passed+1, failed) if cond else (passed, failed+1)
        print(f"  {OK if cond else NO}  {name}  {extra}")

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
        await asyncio.sleep(0.8)
        # dismiss the first-run onboarding overlay so it can't intercept clicks
        await ext.evaluate("() => new Promise(r => chrome.storage.local.set({onboardedAt: Date.now()}, () => r(1)))")
        await ext.evaluate("() => { const o = document.getElementById('onboarding'); if (o) o.style.display = 'none'; }")

        async def msg(m):
            return await ext.evaluate("(m)=>new Promise(r=>chrome.runtime.sendMessage(m,res=>r(res)))", m)

        print("\n── Bug-report UI ────────────────────────────────────────")
        # main view present
        main_disp = await ext.evaluate("()=>getComputedStyle(document.getElementById('main-view')).display")
        check("main view renders", main_disp != "none", f"(display={main_disp})")

        # open report view
        await ext.click("#report-btn")
        await asyncio.sleep(0.3)
        rv = await ext.evaluate("()=>getComputedStyle(document.getElementById('report-view')).display")
        check("report view opens on 🐞 Bug", rv != "none", f"(display={rv})")
        tok_panel = await ext.evaluate("()=>getComputedStyle(document.getElementById('gh-token-panel')).display")
        check("token setup shown when no token", tok_panel != "none")

        print("\n── Bug-report plumbing (no token) ───────────────────────")
        r = await msg({"type":"report:bug","report":{"title":"smoke title","body":"smoke body"}})
        check("report:bug returns no_token without a token", (r or {}).get("error") == "no_token", f"({r})")
        fl = await msg({"type":"get:feedback-log"})
        queued_bug = any(e.get("kind")=="bug" for e in (fl or {}).get("feedbackLog", []))
        check("bug copy queued locally for backend", queued_bug, f"(count={ (fl or {}).get('count') })")

        print("\n── GitHub token storage ─────────────────────────────────")
        await msg({"type":"set:github-token","token":"ghp_smoketesttoken123"})
        gt = await msg({"type":"get:github-token"})
        check("token persists (hasToken=true)", (gt or {}).get("hasToken") is True, f"({gt})")
        await msg({"type":"clear:github-token"})
        gt2 = await msg({"type":"get:github-token"})
        check("token clears", (gt2 or {}).get("hasToken") is False, f"({gt2})")

        print("\n── Misprediction feedback log ───────────────────────────")
        before = (await msg({"type":"get:feedback-log"})).get("count", 0)
        fb = await msg({"type":"report:feedback","entry":{
            "verdict":"wrong-hide","selector":"aside[aria-label=\"Shorts\"]","label":"Shorts",
            "score":64,"signals":["autoplay video"],"confidence":"high",
            "url":"https://youtube.com/","domain":"youtube.com",
            "assessment":{"distractionProbability":0.2}}})
        check("report:feedback acks queued", (fb or {}).get("ok") is True, f"({fb})")
        after = (await msg({"type":"get:feedback-log"})).get("count", 0)
        check("feedback log grew", after == before + 1, f"({before} -> {after})")
        log = (await msg({"type":"get:feedback-log"})).get("feedbackLog", [])
        mis = next((e for e in log if e.get("kind")=="misprediction"), None)
        check("misprediction carries context", bool(mis) and mis.get("selector") and mis.get("assessment"),
              f"(label={mis.get('label') if mis else None})")

        print("\n── Context-state endpoint ───────────────────────────────")
        cs = await msg({"type":"get:context-state"})
        check("get:context-state responds", isinstance(cs, dict) and "feedbackCount" in cs, f"({cs})")

        await ctx.close()

    print(f"\n════════ {passed} passed, {failed} failed ════════")
    sys.exit(1 if failed else 0)

asyncio.run(main())
