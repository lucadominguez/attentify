#!/usr/bin/env python3
"""Diagnostic: does entering + saving the OpenRouter API key work and persist?"""
import asyncio, os, re
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-apikey"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")
FAKE_KEY = "sk-or-v1-0000000000000000000000000000000000000000000000000000000000000000"

async def ext_id(ctx):
    for _ in range(20):
        for sw in ctx.service_workers:
            if "chrome-extension://" in sw.url:
                return sw.url.split("/")[2]
        await asyncio.sleep(0.3)
    return None

async def open_chat(ctx, eid):
    pg = await ctx.new_page()
    await pg.goto(f"chrome-extension://{eid}/popup.html", wait_until="load")
    await asyncio.sleep(1)
    if await pg.is_visible("#onboarding"):
        await pg.click("#onboard-dismiss")
        await asyncio.sleep(0.3)
    await pg.click("#chat-btn")
    await asyncio.sleep(0.6)
    return pg

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            UDD, headless=False, executable_path=CHROME,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}",
                  "--no-sandbox", "--disable-dev-shm-usage"])
        await asyncio.sleep(2)
        eid = await ext_id(ctx)
        print("ext id:", eid)

        # 1) Enter + save a key
        pg = await open_chat(ctx, eid)
        panel_before = await pg.is_visible("#api-key-panel")
        await pg.fill("#api-key-input", FAKE_KEY)
        await pg.click("#api-key-save-btn")
        await asyncio.sleep(0.8)
        panel_after = await pg.is_visible("#api-key-panel")
        key_btn = await pg.is_visible("#api-key-change-btn")
        print(f"panel visible before save: {panel_before} | after save: {panel_after} (want False) | key btn shown: {key_btn} (want True)")
        await pg.close()

        # 2) Reopen popup fresh — does the key persist?
        pg2 = await open_chat(ctx, eid)
        got = await pg2.evaluate("""() => new Promise(r => chrome.runtime.sendMessage({type:'get:api-key'}, res => r(res?.key||null)))""")
        panel = await pg2.is_visible("#api-key-panel")
        print(f"persisted key present: {got == FAKE_KEY} (want True) | panel hidden on reopen: {not panel} (want True)")
        await pg2.close()
        await ctx.close()

asyncio.run(main())
