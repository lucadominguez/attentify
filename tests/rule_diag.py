#!/usr/bin/env python3
"""Diagnostic: does create:rule (the AI 'Add rule' button path) actually persist a rule?"""
import asyncio, os, json
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-rule"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

RULE = {"id": "cnn-politics", "displayName": "CNN Politics", "domain": "cnn.com",
        "selectors": ["[data-section='politics']", "a[href*='/politics/']"],
        "enabled": True, "severity": "medium"}

async def sm(page, msg):
    return await page.evaluate(
        "(m) => new Promise(r => chrome.runtime.sendMessage(m, res => r(res)))", msg)

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

        pg = await ctx.new_page()
        await pg.goto(f"chrome-extension://{eid}/popup.html", wait_until="load")
        await asyncio.sleep(1)

        before = await sm(pg, {"type": "get:all-rules"})
        n_before = len(before.get("rules", []))
        res = await sm(pg, {"type": "create:rule", "rule": RULE})
        after = await sm(pg, {"type": "get:all-rules"})
        ids = [r["id"] for r in after.get("rules", [])]
        print(f"create:rule response: {res}")
        print(f"rules before: {n_before} | after: {len(ids)} | 'cnn-politics' present: {'cnn-politics' in ids}")

        # Persistence across SW restart: re-read from storage directly
        stored = await pg.evaluate("() => new Promise(r => chrome.storage.local.get('rules', d => r((d.rules||[]).some(x => x.id==='cnn-politics'))))")
        print(f"persisted in storage.local: {stored}")
        await ctx.close()

asyncio.run(main())
