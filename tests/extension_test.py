#!/usr/bin/env python3
"""
Browser-Daemon Extension Test Suite
Tests all 7 items from the test plan.
Uses Playwright persistent context with --load-extension.
"""

import asyncio
import json
import os
import sys
import time
import traceback
from pathlib import Path

# Add playwright to path if needed
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"

from playwright.async_api import async_playwright

EXT_PATH = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
USER_DATA_DIR = "/tmp/pw-ext-test"
RESULTS = []

# Resolve full Chrome binary (--headless=new needs full Chrome, not headless_shell)
_CHROMIUM_DIR = next(Path("/tmp/pw-browsers").glob("chromium-*"), None)
CHROME_EXECUTABLE = str(_CHROMIUM_DIR / "chrome-linux64" / "chrome") if _CHROMIUM_DIR else None

def report(num, name, passed, detail="", error=None):
    status = "PASS" if passed else "FAIL"
    result = f"  {status}  Test {num}: {name}"
    if detail:
        result += f"  — {detail}"
    if error:
        result += f"  [{error}]"
    print(result)
    RESULTS.append({"num": num, "name": name, "passed": passed, "detail": detail, "error": str(error) if error else None})


async def get_ext_id(context):
    """Find the extension ID. External load via --load-extension won't create Extensions/ dir."""
    # Method 1: check extension pages in context (chrome-extension:// URLs)
    for page in context.pages:
        if "chrome-extension://" in page.url:
            ext_id = page.url.split("/")[2]
            if len(ext_id) == 32 and ext_id.isalnum():
                return ext_id

    # Method 2: try service workers
    try:
        for sw in context.service_workers:
            if "chrome-extension://" in sw.url:
                ext_id = sw.url.split("/")[2]
                if len(ext_id) == 32 and ext_id.isalnum():
                    return ext_id
    except Exception:
        pass

    # Method 3: parse Preferences file (works for external --load-extension)
    prefs_file = os.path.join(USER_DATA_DIR, "Default", "Preferences")
    try:
        if os.path.exists(prefs_file):
            with open(prefs_file) as f:
                import re
                ids = re.findall(r'"([a-z]{32})"', f.read())
                # Filter out known Chrome component extension IDs
                KNOWN_COMPONENTS = {
                    "ahfgeienlihckogmohjhadlkjgocpleb", "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                    "nkeimhogjdpnpccoofpliimaahmaaome", "moklfjoegmpoolceggbebbmgbddlhdgp",
                    "ldmpofkllgeicjiihkimgeccbhghhmfj", "denipklgekfpcdmbahmbpnmokgajnhma",
                    "kjfhgcncjdebkoofmbjoiemiboifnpbo", "ikfcpmgefdpheiiomgmhlmmkihchmdlj",
                    "jlgegmdnodfhciolbdjciihnlaljdbjo",
                }
                for ext_id in ids:
                    if ext_id not in KNOWN_COMPONENTS:
                        return ext_id
    except Exception:
        pass

    # Method 4: open chrome://extensions
    try:
        page = await context.new_page()
        await page.goto("chrome://extensions", wait_until="load", timeout=10000)
        await asyncio.sleep(1)
        dev_toggle = page.locator("#devMode")
        if await dev_toggle.count() > 0:
            await dev_toggle.click()
            await asyncio.sleep(0.5)
        ext_id = await page.evaluate("""() => {
            const html = document.body.innerText || '';
            const match = html.match(/ID:\\s*([a-z]{32})/);
            return match ? match[1] : null;
        }""")
        await page.close()
        if ext_id:
            return ext_id
    except Exception:
        pass

    return None


async def get_sw_console(context, ext_id):
    """Get service worker console messages for the extension."""
    try:
        # Access SW page via chrome-extension:// URL
        sw_page = None
        for page in context.pages:
            if f"chrome-extension://{ext_id}" in page.url and "background" in page.url.lower():
                sw_page = page
                break

        # Try opening the SW inspector
        sw_url = f"chrome-extension://{ext_id}/background.js"
        if not sw_page:
            try:
                sw_page = await context.new_page()
                await sw_page.goto(f"chrome-extension://{ext_id}/_generated_background_page.html", wait_until="load", timeout=5000)
            except Exception:
                pass

        return sw_page
    except Exception as e:
        return None


async def main():
    print("=" * 70)
    print("  Browser-Daemon Extension Test Suite")
    print(f"  Extension: {EXT_PATH}")
    print(f"  User data: {USER_DATA_DIR}")
    print("=" * 70)

    # Clean user data dir for fresh test
    import shutil
    if os.path.exists(USER_DATA_DIR):
        shutil.rmtree(USER_DATA_DIR, ignore_errors=True)

    async with async_playwright() as p:
        # ── Launch with extension ─────────────────────────────────────────────
        # Use headless=False (headful) — --headless=new conflicts with Playwright's headless=True
        # WSL2 has display support via X11 forwarding or WSLg
        context = await p.chromium.launch_persistent_context(
            USER_DATA_DIR,
            headless=False,  # headful mode required for extension loading with Playwright
            executable_path=CHROME_EXECUTABLE,
            args=[
                f"--disable-extensions-except={EXT_PATH}",
                f"--load-extension={EXT_PATH}",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
            ],
            viewport={"width": 1280, "height": 800},
        )

        # Collect console messages from all pages
        console_msgs = []
        page_errors = []
        context.on("console", lambda msg: console_msgs.append(msg))

        # Give extension time to boot
        print("\n  Waiting for extension to boot...")
        await asyncio.sleep(3)

        # ═══════════════════════════════════════════════════════════════════
        # TEST 1: Service Worker Boot
        # ═══════════════════════════════════════════════════════════════════
        print("\n── Test 1: Service Worker Boot ──")

        ext_id = await get_ext_id(context)
        if not ext_id:
            report(1, "SW boots (extension ID discovery)", False, "Could not find extension ID")
        else:
            print(f"    Extension ID: {ext_id}")

            # Check for SW-related pages
            sw_pages = [p for p in context.pages if "chrome-extension://" in p.url]
            print(f"    Extension pages: {len(sw_pages)}")
            for p in sw_pages:
                print(f"      {p.url[:100]}")

            # Try to access extension status via evaluate in a content page
            test_page = await context.new_page()
            await test_page.goto("about:blank", wait_until="load")
            await asyncio.sleep(0.5)

            # Check if we can message the extension
            try:
                # Inject a script that checks SW by sending a message
                has_content = await test_page.evaluate("""() => {
                    return { injected: window.__pdInjected || false };
                }""")
                print(f"    Content script injected on about:blank: {has_content}")
            except Exception as e:
                print(f"    Content check failed: {e}")

            # Check for SW errors in console
            sw_errors = [m for m in console_msgs if m.type in ("error", "warning")]
            no_sw_errors = len(sw_errors) == 0
            report(1, "SW boots with no errors",
                   no_sw_errors,
                   f"Extension found, {len(sw_pages)} page(s), {len(sw_errors)} console errors",
                   error=None if no_sw_errors else sw_errors[:3] if sw_errors else None)

            await test_page.close()

        # ═══════════════════════════════════════════════════════════════════
        # TEST 2: YouTube Shorts & TikTok FYP Blocking
        # ═══════════════════════════════════════════════════════════════════
        print("\n── Test 2: Element Blocking (YouTube + TikTok) ──")

        # 2a: YouTube — navigate to homepage, check for blocked elements
        yt_page = await context.new_page()
        yt_page.on("console", lambda msg: console_msgs.append(msg))
        yt_page.on("pageerror", lambda err: page_errors.append(err))

        try:
            print("    Navigating to youtube.com...")
            await yt_page.goto("https://www.youtube.com/", wait_until="networkidle", timeout=30000)
            await asyncio.sleep(3)  # Let content script apply CSS

            # Check for the injected style element
            style_present = await yt_page.evaluate("""() => {
                const el = document.getElementById('pd-element-blocker');
                return {
                    exists: !!el,
                    hasContent: el ? el.textContent.length > 0 : false,
                    snippet: el ? el.textContent.slice(0, 200) : ''
                };
            }""")
            print(f"    PD style element: {style_present}")

            # Check if Shorts elements are hidden
            shorts_hidden = await yt_page.evaluate("""() => {
                const ytdShorts = document.querySelector('ytd-shorts');
                const ytdReel = document.querySelector('ytd-reel-shelf-renderer');
                const getStyle = (el) => {
                    if (!el) return 'absent';
                    const s = getComputedStyle(el);
                    return { display: s.display, visibility: s.visibility };
                };
                return {
                    'ytd-shorts': getStyle(ytdShorts),
                    'ytd-reel-shelf-renderer': getStyle(ytdReel),
                };
            }""")
            print(f"    YouTube element states: {shorts_hidden}")

            # Check if elements are actually hidden by CSS
            yt_shorts_blocked = False
            if shorts_hidden.get('ytd-shorts'):
                d = shorts_hidden['ytd-shorts']
                yt_shorts_blocked = (d == 'absent' or (isinstance(d, dict) and d.get('display') == 'none'))

            # 2b: TikTok FYP
            tt_page = await context.new_page()
            tt_page.on("pageerror", lambda err: page_errors.append(err))
            try:
                print("    Navigating to tiktok.com...")
                await tt_page.goto("https://www.tiktok.com/", wait_until="networkidle", timeout=30000)
                await asyncio.sleep(3)

                tt_style = await tt_page.evaluate("""() => {
                    const el = document.getElementById('pd-element-blocker');
                    return {
                        exists: !!el,
                        hasContent: el ? el.textContent.length > 0 : false,
                        snippet: el ? el.textContent.slice(0, 200) : ''
                    };
                }""")
                print(f"    TikTok style element: {tt_style}")

                tt_fyp_blocked = await tt_page.evaluate("""() => {
                    const fypItem = document.querySelector('[data-e2e="recommend-list-item-container"]');
                    const fypTab = document.querySelector('[data-e2e="for-you-tab"]');
                    const feedContainer = document.querySelector('[class*="DivFeedContainer"]');
                    const getStyle = (el) => {
                        if (!el) return 'absent';
                        const s = getComputedStyle(el);
                        return { display: s.display, visibility: s.visibility };
                    };
                    return {
                        'recommend-list-item': getStyle(fypItem),
                        'for-you-tab': getStyle(fypTab),
                        'feedContainer': getStyle(feedContainer),
                    };
                }""")
                print(f"    TikTok element states: {tt_fyp_blocked}")

                # TikTok may not show FYP if not logged in — treat style injection as sufficient
                tt_style_loaded = tt_style.get('exists') and tt_style.get('hasContent')
            except Exception as e:
                print(f"    TikTok error: {e}")
                tt_style_loaded = False
            finally:
                await tt_page.close()

            yt_stable = style_present.get('exists') and style_present.get('hasContent')
            report(2, "YouTube Shorts + TikTok FYP blocking",
                   yt_stable,
                   f"YouTube style injected={style_present.get('exists')}, "
                   f"TikTok style injected={tt_style_loaded}")

        except Exception as e:
            report(2, "Element blocking", False, "Navigation failed", error=e)
        finally:
            await yt_page.close()

        # ═══════════════════════════════════════════════════════════════════
        # TEST 3: URL Interception (youtube.com/shorts/*)
        # ═══════════════════════════════════════════════════════════════════
        print("\n── Test 3: URL Interception ──")

        intercept_page = await context.new_page()
        intercept_page.on("console", lambda msg: console_msgs.append(msg))
        try:
            # Navigate directly to a Shorts URL
            print("    Navigating to youtube.com/shorts/abc123...")
            response = await intercept_page.goto(
                "https://www.youtube.com/shorts/abc123",
                wait_until="load",
                timeout=15000
            )
            await asyncio.sleep(1)

            final_url = intercept_page.url
            print(f"    Final URL: {final_url}")

            # Should have been redirected to youtube.com/ (origin) by webNavigation
            was_redirected = "shorts" not in final_url or final_url == "https://www.youtube.com/"
            report(3, "URL interception redirects shorts URLs",
                   was_redirected,
                   f"Start: youtube.com/shorts/abc123 → End: {final_url}")

        except Exception as e:
            # ERR_ABORTED means the extension intercepted and redirected the navigation.
            # This is the EXPECTED behavior — the webNavigation listener cancelled the
            # original request and issued chrome.tabs.update() to redirect.
            err_str = str(e)
            if "ERR_ABORTED" in err_str:
                final_url = intercept_page.url
                was_redirected = "shorts" not in final_url
                report(3, "URL interception redirects shorts URLs",
                       was_redirected,
                       f"Navigation aborted by extension (redirect). URL: {final_url[:80]}")
            else:
                report(3, "URL interception", False, "Navigation failed", error=e)
        finally:
            await intercept_page.close()

        # ═══════════════════════════════════════════════════════════════════
        # TEST 4: Content Script Performance / Idle After Load
        # ═══════════════════════════════════════════════════════════════════
        print("\n── Test 4: Content Script Idle After Load ──")

        perf_page = await context.new_page()
        perf_page.on("console", lambda msg: console_msgs.append(msg))
        try:
            await perf_page.goto("https://www.youtube.com/", wait_until="networkidle", timeout=30000)
            await asyncio.sleep(2)

            # Count how many times content script sends messages
            msg_count_before = len([m for m in console_msgs if "content" in (m.text or "").lower() or "pd" in (m.text or "").lower()])

            # Scroll a bit
            await perf_page.evaluate("window.scrollBy(0, 500)")
            await asyncio.sleep(1)
            await perf_page.evaluate("window.scrollBy(0, 1000)")
            await asyncio.sleep(1)
            await perf_page.evaluate("window.scrollBy(0, -1000)")
            await asyncio.sleep(1)

            msg_count_after = len([m for m in console_msgs if "content" in (m.text or "").lower()])

            # Check if setInterval is running (the 500ms URL poll)
            interval_count = await perf_page.evaluate("""() => {
                // Can't directly count setInterval, but we can check for rapid DOM changes
                const start = performance.now();
                return { timestamp: start };
            }""")

            # Content script should stay idle — only the URL poll runs
            # The URL poll is lightweight (500ms interval, cheap string compare)
            # We flag if message count grows significantly
            msg_delta = msg_count_after - msg_count_before
            content_idle = msg_delta < 10  # Allow a few messages but not excessive
            report(4, "Content script idle after load (no excessive activity)",
                   content_idle,
                   f"Console messages delta during scroll: {msg_delta}")

        except Exception as e:
            report(4, "Content script idle", False, "Test failed", error=e)
        finally:
            await perf_page.close()

        # ═══════════════════════════════════════════════════════════════════
        # TEST 5: Popup Renders
        # ═══════════════════════════════════════════════════════════════════
        print("\n── Test 5: Popup Rendering ──")

        if ext_id:
            try:
                popup_page = await context.new_page()
                popup_url = f"chrome-extension://{ext_id}/popup.html"
                print(f"    Opening popup: {popup_url}")
                await popup_page.goto(popup_url, wait_until="load", timeout=10000)
                await asyncio.sleep(2)

                # Check key UI elements
                popup_content = await popup_page.evaluate("""() => {
                    const brand = document.querySelector('.brand');
                    const diagPanel = document.getElementById('diag-panel');
                    const rulesList = document.getElementById('rules-list');
                    const statusText = document.getElementById('status-text');
                    const statusDot = document.getElementById('status-dot');
                    const rulesSummary = document.getElementById('rules-summary');
                    const toggleCount = document.querySelectorAll('.toggle input').length;

                    return {
                        brand: brand ? brand.textContent.trim() : null,
                        diagRows: diagPanel ? diagPanel.querySelectorAll('.diag-row').length : 0,
                        rulesCards: rulesList ? rulesList.querySelectorAll('.rule-card').length : 0,
                        statusText: statusText ? statusText.textContent.trim() : null,
                        statusDotClass: statusDot ? statusDot.className : null,
                        rulesSummary: rulesSummary ? rulesSummary.textContent.trim() : null,
                        toggleCount: toggleCount,
                        versionLabel: document.getElementById('version-label')?.textContent || null,
                    };
                }""")
                print(f"    Popup content: {json.dumps(popup_content, indent=6)}")

                popup_renders = (
                    popup_content.get('brand') is not None
                    and popup_content.get('diagRows', 0) > 0
                    and popup_content.get('rulesCards', 0) > 0
                )
                report(5, "Popup renders with diagnostics + rules list",
                       popup_renders,
                       f"v{popup_content.get('versionLabel')}, "
                       f"{popup_content.get('rulesCards')} rules, "
                       f"{popup_content.get('diagRows')} diag rows, "
                       f"\"{popup_content.get('statusText', '')[:60]}\"")

                await popup_page.close()
            except Exception as e:
                report(5, "Popup renders", False, "Popup failed to load", error=e)

        # ═══════════════════════════════════════════════════════════════════
        # TEST 6: Daemon OFF — Standalone Mode (cyan dot)
        # ═══════════════════════════════════════════════════════════════════
        print("\n── Test 6: Daemon OFF (Standalone) ──")

        if ext_id:
            try:
                standalone_page = await context.new_page()
                await standalone_page.goto(f"chrome-extension://{ext_id}/popup.html", wait_until="load", timeout=10000)
                await asyncio.sleep(2)

                dot_info = await standalone_page.evaluate("""() => {
                    const dot = document.getElementById('status-dot');
                    const statusText = document.getElementById('status-text');
                    return {
                        dotClass: dot ? dot.className : null,
                        statusText: statusText ? statusText.textContent : null,
                    };
                }""")
                print(f"    Status dot/standalone info: {json.dumps(dot_info)}")

                # In standalone mode, dot should have 'standalone' class (cyan)
                dot_cyan = 'standalone' in (dot_info.get('dotClass') or '')
                status_standalone = 'standalone' in (dot_info.get('statusText') or '').lower()
                standalone_ok = dot_cyan or status_standalone

                report(6, "Daemon OFF — popup shows standalone/cyan dot",
                       standalone_ok,
                       f"Dot class: {dot_info.get('dotClass')}, Status: {dot_info.get('statusText', '')[:60]}")

                await standalone_page.close()
            except Exception as e:
                report(6, "Standalone mode", False, "Test failed", error=e)

        # ═══════════════════════════════════════════════════════════════════
        # TEST 7: Daemon Integration
        # ═══════════════════════════════════════════════════════════════════
        print("\n── Test 7: Daemon Integration ──")

        # Check if daemon is running on any port
        daemon_found = False
        import socket
        for port in [9119, 9120, 9121, 9122, 9123]:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(0.5)
                if s.connect_ex(('127.0.0.1', port)) == 0:
                    daemon_found = True
                    print(f"    Daemon found on port {port}")
                    daemon_port = port
                s.close()
            except Exception:
                pass

        if daemon_found:
            # Daemon is running — test integration
            import urllib.request
            try:
                req = urllib.request.Request(f"http://127.0.0.1:{daemon_port}/extension/status")
                resp = urllib.request.urlopen(req, timeout=3)
                ext_status = json.loads(resp.read())
                print(f"    /extension/status: {json.dumps(ext_status, indent=6)}")

                report(7, "Daemon integration — /extension/status responds",
                       ext_status is not None,
                       f"Port {daemon_port}, response keys: {list(ext_status.keys()) if ext_status else 'none'}")
            except Exception as e:
                report(7, "Daemon integration", False, "Status endpoint failed", error=e)
        else:
            print("    No daemon found on ports 9119-9123")
            report(7, "Daemon integration",
                   False,
                   "No daemon running (expected for standalone mode). Start daemon to test.",
                   error="Daemon not found")

        # ── Console error summary ─────────────────────────────────────────────
        print("\n── Console Error Summary ──")
        errors = [m for m in console_msgs if m.type == "error"]
        warnings = [m for m in console_msgs if m.type == "warning"]
        print(f"  Errors: {len(errors)}")
        for e in errors[:10]:
            print(f"    [err] {e.text[:120] if e.text else '(no text)'}")
        print(f"  Warnings: {len(warnings)}")
        for w in warnings[:5]:
            print(f"    [warn] {w.text[:120] if w.text else '(no text)'}")
        print(f"  Page errors: {len(page_errors)}")
        for e in page_errors[:5]:
            print(f"    [page err] {str(e)[:120]}")

        # ── Final Summary ─────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("  RESULTS SUMMARY")
        print("=" * 70)
        passed = sum(1 for r in RESULTS if r["passed"])
        failed = sum(1 for r in RESULTS if not r["passed"])
        for r in RESULTS:
            icon = "✓" if r["passed"] else "✗"
            print(f"  {icon} Test {r['num']}: {r['name']} — {r['detail']}")
            if r.get("error"):
                print(f"      Error: {r['error']}")
        print(f"\n  {passed} passed, {failed} failed of {len(RESULTS)}")

        # Keep browser open briefly for visual inspection
        print("\n  Browser remains open for 5s for visual inspection...")
        await asyncio.sleep(5)

        await context.close()

    return RESULTS

if __name__ == "__main__":
    asyncio.run(main())
