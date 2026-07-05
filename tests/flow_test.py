#!/usr/bin/env python3
"""Context-flow view test: navigations accumulate a chronological log, and the
flow tab renders them as connected nodes."""
import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-flow"
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
        await asyncio.sleep(0.6)
        await ext.evaluate("() => new Promise(r => chrome.storage.local.set({onboardedAt: Date.now()}, () => r(1)))")
        await ext.evaluate("() => { const o = document.getElementById('onboarding'); if (o) o.style.display='none'; }")

        # Generate a few distinct navigations → distinct context-log entries
        page = await ctx.new_page()
        for path in ["/?q=python+tutorial", "/watch?v=abc123", "/"]:
            await page.goto("https://example.com" + path, wait_until="domcontentloaded", timeout=20000)
            await asyncio.sleep(2.0)   # let reportContext('load') + assess + log run

        print("\n── Context log accumulates chronologically ──────────────")
        res = await ext.evaluate("()=>new Promise(r=>chrome.runtime.sendMessage({type:'get:context-log'},x=>r(x)))")
        log = (res or {}).get("contextLog", [])
        ck("log has >=2 entries", len(log) >= 2, f"(n={len(log)})")
        ck("entries carry intent + probability", all(('intent' in e and 'distractionProbability' in e) for e in log), "")
        ck("stored newest-first", len(log) < 2 or log[0]["ts"] >= log[-1]["ts"],
           f"(first={log[0]['ts'] if log else '-'})")

        print("\n── Flow view renders the timeline ───────────────────────")
        await ext.click("#flow-btn")
        await asyncio.sleep(0.8)
        disp = await ext.evaluate("()=>getComputedStyle(document.getElementById('flow-view')).display")
        ck("flow view opens", disp != "none", f"(display={disp})")
        nodes = await ext.evaluate("()=>document.querySelectorAll('#flow-list .flow-node').length")
        ck("renders a node per logged step", nodes == len(log), f"(nodes={nodes}, log={len(log)})")
        arrows = await ext.evaluate("()=>document.querySelectorAll('#flow-list .flow-arrow').length")
        ck("nodes connected by flow arrows", nodes <= 1 or arrows == nodes - 1, f"(arrows={arrows})")

        print("\n── Flow auto-updates on new navigation (no refresh) ─────")
        before_nodes = nodes
        await page.goto("https://example.com/?q=brand+new+query", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(2.6)   # reportContext + assess + log -> storage.onChanged -> re-render
        after_nodes = await ext.evaluate("()=>document.querySelectorAll('#flow-list .flow-node').length")
        ck("new step appears automatically", after_nodes == before_nodes + 1, f"({before_nodes} -> {after_nodes})")

        # back button returns to main
        await ext.click("#flow-back-btn")
        await asyncio.sleep(0.3)
        mv = await ext.evaluate("()=>getComputedStyle(document.getElementById('main-view')).display")
        ck("back returns to main view", mv != "none")

        await ctx.close()
    print(f"\n════════ {p_} passed, {f} failed ════════")
    sys.exit(1 if f else 0)

asyncio.run(main())
