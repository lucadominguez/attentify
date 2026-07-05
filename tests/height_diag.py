#!/usr/bin/env python3
"""Measure rendered heights of the panel page at side-panel-like size."""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-height"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

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
        await pg.set_viewport_size({"width": 360, "height": 760})  # side-panel-ish
        await pg.goto(f"chrome-extension://{eid}/popup.html", wait_until="load")
        await asyncio.sleep(1.2)
        async def measure(label):
            m = await pg.evaluate("""() => {
                const r = id => { const e=document.getElementById(id); const b=e?e.getBoundingClientRect():null; return b?Math.round(b.height):null; };
                return { win: window.innerHeight, body: Math.round(document.body.getBoundingClientRect().height),
                         mainView: r('main-view'), chatView: r('chat-view') };
            }""")
            print(label, m)
        await measure("main @760: ")
        # switch to chat view and measure it fills too
        if await pg.is_visible("#onboarding"): await pg.click("#onboard-dismiss"); await asyncio.sleep(0.2)
        await pg.click("#chat-btn"); await asyncio.sleep(0.4)
        await measure("chat @760: ")
        await pg.set_viewport_size({"width": 320, "height": 600}); await asyncio.sleep(0.3)
        await measure("chat @600: ")
        await ctx.close()

asyncio.run(main())
