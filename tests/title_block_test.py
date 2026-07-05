#!/usr/bin/env python3
"""
Title-based video blocking: feed tiles hidden by title, and an instant watch-page
block overlay + muted player. Uses route interception to serve fake youtube.com pages
so the content script sees the real hostname (isWatchPage checks location.hostname).
"""
import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-titleblock"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")
OK = "\033[92mPASS\033[0m"; NO = "\033[91mFAIL\033[0m"

FEED_HTML = """<!doctype html><html><head><title>YouTube</title></head><body style="margin:0">
<ytd-rich-item-renderer style="display:block;height:90px"><a id="video-title" title="Taylor Swift - Blank Space (Official Music Video)">Taylor Swift - Blank Space (Official Music Video)</a></ytd-rich-item-renderer>
<ytd-rich-item-renderer style="display:block;height:90px"><a id="video-title" title="How to learn Python asyncio in 2026">How to learn Python asyncio in 2026</a></ytd-rich-item-renderer>
<ytd-video-renderer style="display:block;height:90px"><a id="video-title" title="My Hero Academia [EDIT] 4k amv">My Hero Academia [EDIT] 4k amv</a></ytd-video-renderer>
<ytd-rich-item-renderer style="display:block;height:90px"><a id="video-title" title="Lecture 3: Operating Systems">Lecture 3: Operating Systems</a></ytd-rich-item-renderer>
</body></html>"""

WATCH_HTML = """<!doctype html><html><head>
<title>Blank Space (Official Music Video) - YouTube</title>
<meta property="og:title" content="Blank Space (Official Music Video)"></head><body style="margin:0">
<div id="movie_player" style="width:640px;height:360px;background:#000"><video id="pd-test-vid" autoplay loop></video></div>
<h1 class="title"><yt-formatted-string>Blank Space (Official Music Video)</yt-formatted-string></h1>
</body></html>"""

WATCH_OK_HTML = """<!doctype html><html><head>
<title>Python asyncio tutorial - YouTube</title>
<meta property="og:title" content="Python asyncio tutorial"></head><body style="margin:0">
<div id="movie_player" style="width:640px;height:360px;background:#000"><video id="pd-test-vid" autoplay loop></video></div>
<h1 class="title"><yt-formatted-string>Python asyncio tutorial</yt-formatted-string></h1>
</body></html>"""

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    p_ = f = 0
    def ck(n, c, e=""):
        nonlocal p_, f; p_, f = (p_+1, f) if c else (p_, f+1); print(f"  {OK if c else NO}  {n}  {e}")

    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            UDD, headless=False, executable_path=CHROME,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}", "--no-sandbox",
                  "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"])
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

        # Serve fake youtube.com pages
        async def route(r):
            u = r.request.url
            if "/watch" in u and "v=ok" in u: body = WATCH_OK_HTML
            elif "/watch" in u: body = WATCH_HTML
            else: body = FEED_HTML
            await r.fulfill(status=200, content_type="text/html", body=body)
        page = await ctx.new_page()
        await page.route("**://*.youtube.com/**", route)

        # Set the title blocks the AI would have produced for "music videos + edits"
        res = await ext.evaluate("""() => new Promise(r => chrome.runtime.sendMessage(
            {type:'set:title-blocks', keywords:['official music video','amv','[edit]'], replace:true}, r))""")
        ck("set:title-blocks stored", 'official music video' in (res or {}).get('titleBlocks', []), f"({res})")

        # ── Feed: matching tiles hidden, benign visible ──
        print("\n── Feed-tile title blocking ─────────────────────────────")
        await page.goto("https://www.youtube.com/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(2.0)
        async def disp(sel):
            return await page.evaluate("(s)=>{const e=[...document.querySelectorAll(s)].find(x=>x);return e?getComputedStyle(e.closest('ytd-rich-item-renderer,ytd-video-renderer')||e).display:'gone';}", sel)
        async def tile_disp(title_substr):
            return await page.evaluate("""(t)=>{
              const a=[...document.querySelectorAll('#video-title')].find(x=>(x.getAttribute('title')||'').includes(t));
              if(!a) return 'gone';
              const tile=a.closest('ytd-rich-item-renderer,ytd-video-renderer');
              return getComputedStyle(tile).display;
            }""", title_substr)
        ck("music-video tile hidden", await tile_disp("Official Music Video") == "none", f"({await tile_disp('Official Music Video')})")
        ck("AMV/edit tile hidden", await tile_disp("[EDIT]") == "none", f"({await tile_disp('[EDIT]')})")
        ck("Python tutorial tile visible", await tile_disp("Python asyncio") != "none", f"({await tile_disp('Python asyncio')})")
        ck("Lecture tile visible", await tile_disp("Operating Systems") != "none", f"({await tile_disp('Operating Systems')})")

        # ── DOM recycle: a hidden tile reused for a benign video must un-hide ──
        print("\n── DOM-recycle re-evaluation ────────────────────────────")
        await page.evaluate("""()=>{const a=[...document.querySelectorAll('#video-title')].find(x=>(x.getAttribute('title')||'').includes('Official Music Video'));
          a.setAttribute('title','Now a normal study video'); a.textContent='Now a normal study video';}""")
        await ext.evaluate("""() => new Promise(r => chrome.runtime.sendMessage(
            {type:'set:title-blocks', keywords:['official music video','amv','[edit]'], replace:true}, r))""")  # forces a re-sweep
        await asyncio.sleep(0.8)
        ck("recycled tile un-hidden", await tile_disp("normal study video") != "none", f"({await tile_disp('normal study video')})")

        # ── Watch page: instant block overlay + muted player ──
        print("\n── Watch-page block (instant) ───────────────────────────")
        await page.goto("https://www.youtube.com/watch?v=music1", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.6)
        ov = await page.evaluate("()=>!!document.getElementById('pd-watch-block')")
        ck("block overlay shown on matching watch page", ov)
        hidden = await page.evaluate("()=>{const p=document.getElementById('movie_player');return p&&p.hasAttribute('data-pd-hide');}")
        ck("player hidden", bool(hidden))
        muted = await page.evaluate("()=>{const v=document.getElementById('pd-test-vid');return v?v.muted:null;}")
        ck("player muted", muted is True, f"(muted={muted})")

        # Watch anyway override
        await page.evaluate("()=>document.getElementById('pd-wb-watch')?.click()")
        await asyncio.sleep(0.4)
        ck("‘watch anyway’ removes the overlay", await page.evaluate("()=>!document.getElementById('pd-watch-block')"))

        # ── Non-matching watch page: no block ──
        print("\n── Non-matching watch page is untouched ─────────────────")
        await page.goto("https://www.youtube.com/watch?v=ok123", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.4)
        ck("no overlay on a benign video", await page.evaluate("()=>!document.getElementById('pd-watch-block')"))

        await ctx.close()
    print(f"\n════════ {p_} passed, {f} failed ════════")
    sys.exit(1 if f else 0)

asyncio.run(main())
