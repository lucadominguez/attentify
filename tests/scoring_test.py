#!/usr/bin/env python3
"""
Comprehensive scoring test for the distraction scanner.

Goal: prove the scorer is precise (doesn't hide genuine content/tools) AND has good
recall (catches feeds / shorts / reels / recommendation rails), across a spread of
real-world-like layouts. Also verifies the media guard actually SILENCES audio of a
hidden autoplay player (the YouTube-Shorts-audio bug).

Each fixture is injected into a clean body, then scan:page is requested with
auto-block OFF so we read raw candidates. We match candidates by their label.
"""
import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-scoring"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

# ── Fixtures ────────────────────────────────────────────────────────────────────
# Each: (name, builder-JS that appends one labelled region, expectation)
#   expectation: 'high'  -> must be flagged, confidence high (auto-hide worthy)
#                'flag'  -> must be flagged (any confidence)
#                'none'  -> must NOT be flagged (precision: genuine content/tool)
#                'nothigh' -> may appear, but must NOT be high confidence

def cards(n, h=120):
    return ''.join(f'<article class="card" style="height:{h}px">item {i}</article>' for i in range(n))

PROSE = ("<p>" + ("The quick brown fox jumped over the lazy dog and then wrote a long, "
         "thoughtful essay about focus, attention, and the economics of the web. " * 6) + "</p>")

FIXTURES = [
    ("Recommended for you",
     f'<section role="feed" aria-label="Recommended for you" style="width:640px">{cards(8)}</section>',
     'high'),
    ("Shorts",
     '<aside aria-label="Shorts" style="width:320px;height:520px">'
     '<video autoplay loop style="width:320px;height:520px"></video></aside>',
     'high'),
    ("Trending now",
     f'<aside aria-label="Trending now" style="width:360px">{cards(7,60)}</aside>',
     'flag'),
    ("Up next",
     f'<section aria-label="Up next" style="width:380px">{cards(6,90)}</section>',
     'flag'),
    # ── Precision: these are genuine content / tools and must survive ──
    ("Article body",
     f'<section aria-label="Article body" style="width:640px">{PROSE}{PROSE}{PROSE}'
     '<a href="/x">one link</a></section>',
     'none'),
    ("Documentation",
     f'<article aria-label="Documentation" style="width:640px"><h1>API Reference</h1>{PROSE}{PROSE}</article>',
     'none'),
    ("Site search",
     '<section aria-label="Site search" style="width:640px;height:300px">'
     '<form><input type="search" placeholder="Search"><button>Go</button></form>'
     f'{cards(4,70)}</section>',
     'none'),
    ("Comments",
     f'<section aria-label="Comments" style="width:640px">'
     f'<h2>Comments</h2>{cards(6,50)}</section>',
     'nothigh'),
    ("Main navigation",
     '<nav aria-label="Main navigation" style="width:240px;height:600px">'
     '<a href="/a">A</a><a href="/b">B</a><a href="/c">C</a></nav>',
     'none'),
]

OK = "\033[92mPASS\033[0m"
NO = "\033[91mFAIL\033[0m"

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    passed = failed = 0
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            UDD, headless=False, executable_path=CHROME,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}",
                  "--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"])
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
        # auto-block OFF so we read raw candidates without them being hidden
        await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'set:auto-block', enabled:false}, r))")

        page = await ctx.new_page()
        await page.goto("https://example.com/", wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(1.4)

        async def scan_fixture(html):
            await page.evaluate("(h) => { document.body.innerHTML = h; }", html)
            await asyncio.sleep(0.5)
            res = await ext.evaluate("""() => new Promise(async r => {
                const tabs = await chrome.tabs.query({});
                const t = tabs.find(t => t.url && t.url.startsWith('https://example.com'));
                chrome.tabs.sendMessage(t.id, {type:'scan:page'}, res => r(res || {error: chrome.runtime.lastError?.message}));
            })""")
            return (res or {}).get("candidates", [])

        print("\n── Scoring precision/recall ─────────────────────────────")
        for name, html, expect in FIXTURES:
            cands = await scan_fixture(html)
            hit = next((c for c in cands if name.lower() in (c.get("label") or "").lower()), None)
            if expect == 'high':
                good = bool(hit) and hit["confidence"] == "high"
            elif expect == 'flag':
                good = bool(hit)
            elif expect == 'none':
                good = hit is None
            elif expect == 'nothigh':
                good = (hit is None) or hit["confidence"] != "high"
            else:
                good = False
            passed, failed = (passed + 1, failed) if good else (passed, failed + 1)
            detail = f'score={hit["score"]} {hit["confidence"]}' if hit else 'not flagged'
            print(f"  {OK if good else NO}  {name:<22} want={expect:<7} got=({detail})")

        # ── Media guard: hidden autoplay player must be silenced ──────────────────
        print("\n── Media guard (Shorts audio) ───────────────────────────")
        await ext.evaluate("() => new Promise(r => chrome.runtime.sendMessage({type:'set:auto-block', enabled:true}, r))")
        await page.evaluate("""() => {
          document.body.innerHTML = '';
          const a = document.createElement('aside');
          a.setAttribute('aria-label','Shorts');
          a.style.cssText='width:320px;height:520px';
          const v = document.createElement('video');
          v.id='pd-test-vid'; v.autoplay=true; v.loop=true; v.muted=false;
          v.style.cssText='width:320px;height:520px';
          a.appendChild(v); document.body.appendChild(a);
        }""")
        await asyncio.sleep(2.6)  # let auto-scan hide it + media sweep run

        async def vstate():
            return await page.evaluate("""() => {
              const v = document.getElementById('pd-test-vid');
              const a = document.querySelector('aside[aria-label=\"Shorts\"]');
              return { hidden: a ? getComputedStyle(a).display==='none' : null, muted: v?.muted, paused: v?.paused };
            }""")

        s1 = await vstate()
        t1 = bool(s1["hidden"]) and s1["muted"] is True
        passed, failed = (passed+1, failed) if t1 else (passed, failed+1)
        print(f"  {OK if t1 else NO}  hidden shorts player auto-muted on sweep   ({s1})")

        # Now simulate the site un-muting + (re)starting playback — guard must re-silence.
        await page.evaluate("""() => { const v=document.getElementById('pd-test-vid');
          v.muted=false; v.dispatchEvent(new Event('volumechange')); }""")
        await asyncio.sleep(0.2)
        s2 = await vstate()
        t2 = s2["muted"] is True
        passed, failed = (passed+1, failed) if t2 else (passed, failed+1)
        print(f"  {OK if t2 else NO}  re-mute after site un-mutes (volumechange)  ({s2})")

        await page.evaluate("""() => { const v=document.getElementById('pd-test-vid');
          v.muted=false; v.dispatchEvent(new Event('play')); }""")
        await asyncio.sleep(0.2)
        s3 = await vstate()
        t3 = s3["muted"] is True
        passed, failed = (passed+1, failed) if t3 else (passed, failed+1)
        print(f"  {OK if t3 else NO}  re-mute on play event                       ({s3})")

        # ── Context-driven aggressiveness: high distractionProb lowers the bar ────
        # A "medium" region (Up next, score ~60) is NOT auto-hidden at baseline, but
        # once the engine reports high distraction the high-confidence bar drops below
        # its score, so the scanner promotes it and auto-hides it.
        print("\n── Context modulates aggressiveness ─────────────────────")
        # reset to a clean page so the prior auto-hidden state doesn't carry over
        await page.evaluate("()=>{document.body.innerHTML='';}")
        await ext.evaluate("""() => new Promise(r => { const f=async()=>{const tabs=await chrome.tabs.query({});const t=tabs.find(t=>t.url&&t.url.startsWith('https://example.com'));chrome.tabs.sendMessage(t.id,{type:'context:assessment',assessment:{distractionProbability:0,goalAligned:true,intent:'reset',reason:'reset'}},()=>r(1));};f();})""")
        await page.evaluate("(h)=>{document.body.innerHTML=h;}", FIXTURES[3][1])  # "Up next"
        await asyncio.sleep(1.2)

        async def scan_full():
            return await ext.evaluate("""() => new Promise(async r => {
                const tabs = await chrome.tabs.query({});
                const t = tabs.find(t => t.url && t.url.startsWith('https://example.com'));
                chrome.tabs.sendMessage(t.id, {type:'scan:page'}, res => r(res||{}));
            })""")
        def find(lst, label): return next((c for c in (lst or []) if label.lower() in (c.get('label') or '').lower()), None)

        base = await scan_full()
        base_hidden = find(base.get("autoHidden"), "Up next") is not None
        base_cand = find(base.get("candidates"), "Up next")
        # raise distraction probability and let it re-scan
        await ext.evaluate("""() => new Promise(r => { const f=async()=>{const tabs=await chrome.tabs.query({});const t=tabs.find(t=>t.url&&t.url.startsWith('https://example.com'));chrome.tabs.sendMessage(t.id,{type:'context:assessment',assessment:{distractionProbability:0.95,goalAligned:false,intent:'doomscroll',reason:'test'}},()=>r(1));};f();})""")
        await asyncio.sleep(1.0)
        hot = await scan_full()
        hot_hidden = find(hot.get("autoHidden"), "Up next") is not None
        # success: not auto-hidden at baseline, auto-hidden once distracted
        promoted = (not base_hidden) and hot_hidden
        passed, failed = (passed+1, failed) if promoted else (passed, failed+1)
        bc = base_cand["confidence"] if base_cand else "—"
        print(f"  {OK if promoted else NO}  high P(distracted) auto-hides a medium item ("
              f"base: hidden={base_hidden} conf={bc} -> hot: hidden={hot_hidden})")

        await ctx.close()

    print(f"\n════════ {passed} passed, {failed} failed ════════")
    sys.exit(1 if failed else 0)

asyncio.run(main())
