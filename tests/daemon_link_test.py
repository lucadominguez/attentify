#!/usr/bin/env python3
"""
Verifies the browser extension still talks to the Attentify desktop app.
A mock daemon implements the exact HTTP contract the real DebugServer exposes
(/ping, /content-rules, /inject/chat, /extension/heartbeat). We then drive the
extension: force a sync (expects connected + port), confirm status, and run a chat
that must route through the daemon.
"""
import asyncio, os, sys, json, threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.async_api import async_playwright

EXT = "/mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon/extension"
UDD = "/tmp/pw-daemonlink"
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/tmp/pw-browsers"
CHROME = str(next(Path("/tmp/pw-browsers").glob("chromium-*")) / "chrome-linux64" / "chrome")
OK = "\033[92mPASS\033[0m"; NO = "\033[91mFAIL\033[0m"

DAEMON_RULES = [
    {"id": "youtube-shorts", "domain": "youtube.com", "displayName": "YouTube Shorts (from daemon)",
     "severity": "high", "enabled": True, "selectors": ["ytd-shorts"], "urlPatterns": [], "antiBypassSearchTerms": []},
    {"id": "daemon-special", "domain": "example.com", "displayName": "Daemon-pushed rule",
     "severity": "medium", "enabled": True, "selectors": [".daemon-block"], "urlPatterns": [], "antiBypassSearchTerms": []},
]

class Daemon(BaseHTTPRequestHandler):
    def _send(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a): pass
    def do_GET(self):
        if self.path == "/ping": return self._send({"ok": True, "pid": 1, "uptime": 1, "port": 9119})
        if self.path == "/content-rules":
            return self._send({"rules": DAEMON_RULES, "extensionConnected": True, "bypassScores": {}})
        if self.path == "/extension/status":
            return self._send({"connected": True, "rules": len(DAEMON_RULES), "enabledRules": len(DAEMON_RULES), "bypassScores": {}, "recentBypasses": []})
        self._send({"error": "nf"}, 404)
    def do_POST(self):
        ln = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(ln) if ln else b"{}"
        try: body = json.loads(raw or b"{}")
        except Exception: body = {}
        if self.path == "/inject/chat":
            return self._send({"ok": True, "content": f"DAEMON-REPLY to: {body.get('message','')[:40]}", "toolsUsed": []})
        if self.path in ("/extension/heartbeat", "/extension/bypass", "/extension/escalate", "/extension/check-in"):
            return self._send({"ok": True})
        self._send({"ok": True})

async def main():
    import shutil; shutil.rmtree(UDD, ignore_errors=True)
    srv = HTTPServer(("127.0.0.1", 9119), Daemon)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    p_ = f = 0
    def ck(n, c, e=""):
        nonlocal p_, f; p_, f = (p_+1, f) if c else (p_, f+1); print(f"  {OK if c else NO}  {n}  {e}")

    try:
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
            await asyncio.sleep(0.5)

            async def msg(m, ms=12000):
                return await ext.evaluate("(a)=>new Promise(r=>{const t=setTimeout(()=>r(null),a[1]);chrome.runtime.sendMessage(a[0],x=>{clearTimeout(t);r(x)})})", [m, ms])

            print("\n── Daemon discovery + sync ──────────────────────────────")
            sync = await msg({"type": "force:sync"}, 12000)
            ck("extension connects to daemon", (sync or {}).get("connected") is True, f"({sync})")
            ck("discovers it on port 9119", (sync or {}).get("daemonPort") == 9119)

            status = await msg({"type": "get:status"})
            ck("status reports connected", (status or {}).get("connected") is True)

            allr = await msg({"type": "get:all-rules"})
            ids = [r.get("id") for r in (allr or {}).get("rules", [])]
            ck("daemon-pushed rule synced into extension", "daemon-special" in ids, f"(rules={ids[:6]})")

            print("\n── Chat routes through the daemon ───────────────────────")
            reply = await ext.evaluate("""() => new Promise(resolve => {
                const port = chrome.runtime.connect({ name: 'pd-chat' });
                let full = '';
                const to = setTimeout(() => resolve(full || '(timeout)'), 12000);
                port.onMessage.addListener(m => {
                    if (m.type === 'chunk') full += m.text;
                    if (m.type === 'done') { clearTimeout(to); resolve(full); }
                    if (m.type === 'error') { clearTimeout(to); resolve('ERROR:' + m.message); }
                });
                port.postMessage({ type: 'chat:start', text: 'ping from test', history: [] });
            })""")
            ck("chat answered via daemon", "DAEMON-REPLY" in (reply or ""), f"(reply={str(reply)[:60]!r})")
            ck("daemon proxy marker present", "via daemon" in (reply or ""))

            await ctx.close()
    finally:
        srv.shutdown()
    print(f"\n════════ {p_} passed, {f} failed ════════")
    sys.exit(1 if f else 0)

asyncio.run(main())
