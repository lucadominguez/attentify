#!/usr/bin/env python3
"""Diagnostic: does element blocking survive tab/window switches?"""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-tabswitch"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

async def style_state(page):
    return await page.evaluate("""() => {
        const el = document.getElementById('pd-element-blocker');
        return { present: !!el, cssLen: el ? el.textContent.length : 0 };
    }""")

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            UDD, headless=False, executable_path=CHROME,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}",
                  "--no-sandbox", "--disable-dev-shm-usage"],
        )
        await asyncio.sleep(2)

        yt = await ctx.new_page()
        await yt.goto("https://www.youtube.com/", wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(3)
        print("YT after load:        ", await style_state(yt))

        other = await ctx.new_page()
        await other.goto("https://example.com/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1)
        print("example loaded (switched away from YT)")

        # Switch back to YT — fires chrome.tabs.onActivated
        await yt.bring_to_front()
        await asyncio.sleep(2)
        print("YT after switch back: ", await style_state(yt), "  <-- must still be present with cssLen>0")

        # Open a 2nd YT tab AFTER the SW has been alive a while, switch around
        yt2 = await ctx.new_page()
        await yt2.goto("https://www.youtube.com/", wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(3)
        await other.bring_to_front(); await asyncio.sleep(1)
        await yt2.bring_to_front(); await asyncio.sleep(2)
        print("YT2 after switch:     ", await style_state(yt2))

        await ctx.close()

asyncio.run(main())
