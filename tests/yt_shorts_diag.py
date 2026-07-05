#!/usr/bin/env python3
"""Diagnostic: inspect the REAL YouTube home page — what Shorts containers exist,
whether the youtube-shorts rule selectors match them, and whether the scanner flags them."""
import asyncio, os, sys, json
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-ytshorts"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")

# Selectors currently in the youtube-shorts rule
RULE_SELECTORS = [
    'ytd-shorts', 'ytd-reel-shelf-renderer',
    'ytd-guide-entry-renderer:has(a[href="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
    'yt-chip-cloud-chip-renderer:has([title="Shorts"])',
    'a.yt-simple-endpoint[href="/shorts"]',
]
# Candidate modern containers to probe
PROBE = [
    'ytd-reel-shelf-renderer', 'ytd-rich-shelf-renderer', 'ytd-rich-shelf-renderer[is-shorts]',
    'grid-shelf-view-model', 'ytm-shorts-lockup-view-model', 'ytd-shorts-lockup-view-model',
    'ytd-shorts-lockup-view-model-v2', 'ytd-rich-section-renderer',
    'a[href^="/shorts/"]', 'a[title="Shorts"]', '[is-shorts]',
]

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

        ext = await ctx.new_page()
        await ext.goto(f"chrome-extension://{eid}/popup.html", wait_until="load")
        await asyncio.sleep(0.4)

        page = await ctx.new_page()
        await page.goto("https://www.youtube.com/", wait_until="domcontentloaded", timeout=45000)
        # dismiss consent if present
        try:
            btn = page.locator('button[aria-label*="Accept"], button:has-text("Accept all"), tp-yt-paper-button:has-text("Accept all")').first
            if await btn.count(): await btn.click(timeout=3000)
        except Exception: pass
        await asyncio.sleep(5)   # let the feed hydrate
        # scroll to force lazy feed (incl. shorts shelf) to render
        for _ in range(6):
            await page.evaluate("() => window.scrollBy(0, window.innerHeight*1.5)")
            await asyncio.sleep(1.2)
        await page.evaluate("() => window.scrollTo(0, 0)")
        await asyncio.sleep(1.5)

        title = await page.title()
        print(f"\nPage: {title!r}  url={page.url}")

        print("\n── Distinct custom-element tags matching shelf|reel|short|section ──")
        tags = await page.evaluate("""() => {
          const set = {};
          for (const el of document.querySelectorAll('*')) {
            const t = el.tagName.toLowerCase();
            if (t.includes('-') && /(shelf|reel|short|section|lockup)/.test(t)) set[t] = (set[t]||0)+1;
          }
          return set;
        }""")
        for t, n in sorted(tags.items(), key=lambda x:-x[1]): print(f"  {n:>3}  {t}")

        print("\n── Ancestor chain of a shelf holding >=2 /shorts/ links ──")
        chain = await page.evaluate("""() => {
          const groups = new Map();
          for (const a of document.querySelectorAll('a[href^="/shorts/"]')) {
            let n=a; for (let i=0;i<10&&n;i++,n=n.parentElement){}
          }
          // find element with most /shorts/ descendants
          let best=null, bestN=0;
          for (const el of document.querySelectorAll('ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, [is-shorts], div')) {
            const c = el.querySelectorAll('a[href^="/shorts/"]').length;
            if (c>bestN){bestN=c;best=el;}
          }
          if(!best) return {found:false};
          const chain=[]; let n=best;
          for(let i=0;i<6&&n&&n.tagName!=='BODY';i++,n=n.parentElement){
            chain.push(n.tagName.toLowerCase()+(n.hasAttribute('is-shorts')?'[is-shorts]':'')+(n.getAttribute('aria-label')?' aria="'+n.getAttribute('aria-label').slice(0,24)+'"':'')+(n.id?'#'+n.id:''));
          }
          return {found:true, shortsLinks:bestN, chain};
        }""")
        print(f"  {json.dumps(chain, indent=2)}")

        print("\n── Rule selectors (current youtube-shorts rule) ─────────")
        for s in RULE_SELECTORS:
            n = await page.evaluate("(s)=>{try{return document.querySelectorAll(s).length}catch(e){return -1}}", s)
            print(f"  {n:>3}  {s}")

        print("\n── Probing modern Shorts containers ─────────────────────")
        for s in PROBE:
            n = await page.evaluate("(s)=>{try{return document.querySelectorAll(s).length}catch(e){return -1}}", s)
            print(f"  {n:>3}  {s}")

        # What does a shorts shelf actually look like? dump tagnames + key attrs of any
        # element whose subtree links to /shorts/
        print("\n── Containers that hold /shorts/ links (home feed) ──────")
        info = await page.evaluate("""() => {
          const links = [...document.querySelectorAll('a[href^="/shorts/"]')];
          const shelves = new Set();
          for (const a of links) {
            // climb to the nearest 'shelf'/'section' custom element
            let n = a;
            for (let i=0; i<8 && n; i++, n=n.parentElement) {
              const t = n.tagName ? n.tagName.toLowerCase() : '';
              if (/shelf|section|rich-grid|reel/.test(t)) {
                shelves.add(t + (n.hasAttribute('is-shorts') ? '[is-shorts]' : '')
                  + (n.getAttribute('aria-label') ? ' aria="'+n.getAttribute('aria-label').slice(0,30)+'"' : ''));
                break;
              }
            }
          }
          return { shortsLinks: links.length, shelves: [...shelves] };
        }""")
        print(f"  /shorts/ links on page: {info['shortsLinks']}")
        for sh in info["shelves"]: print(f"   shelf → {sh}")

        print("\n── Scanner candidates on this page ──────────────────────")
        scan = await ext.evaluate("""() => new Promise(async r => {
            const tabs = await chrome.tabs.query({});
            const t = tabs.find(t => t.url && t.url.includes('youtube.com'));
            chrome.tabs.sendMessage(t.id, {type:'scan:page'}, res => r(res || {error: chrome.runtime.lastError?.message}));
        })""")
        cands = (scan or {}).get("candidates", [])
        print(f"  candidates: {len(cands)}")
        for c in cands:
            print(f"   [{c['score']:>3} {c['confidence']:>6}] {c['label']!r}  sel={c['selector']!r}")
        sh = next((c for c in cands if 'short' in (c.get('label','')+c.get('selector','')).lower()), None)
        print(f"\n  scanner caught a shorts shelf: {bool(sh)}")

        await asyncio.sleep(1)
        await ctx.close()

asyncio.run(main())
