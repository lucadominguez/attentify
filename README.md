# Browser-Daemon

**Chrome extension companion for [Attentify](https://github.com/lucadominguez/Daemon-Testing-Version-1)**

Surgically removes addictive UI elements (YouTube Shorts, Instagram Reels, TikTok FYP, etc.) while leaving the useful parts of those sites intact. Communicates with the Attentify desktop app for rule sync, AI-powered bypass detection, and escalation.

---

## What it does

Your current blocker is all-or-nothing — block YouTube and you lose tutorials too. This extension hides only the addictive parts using CSS injection:

| What you want | Old way | This extension |
|---|---|---|
| Block Shorts, keep tutorials | Block youtube.com entirely | Hide `ytd-shorts`, `[is-shorts]`, redirect `/shorts/*` |
| Block Reels, keep DMs | Block instagram.com entirely | Hide `[href="/reels/"]`, redirect `/reels/*` |
| Block r/all, keep r/programming | Block reddit.com entirely | Hide `a[href="/r/all/"]`, redirect `/r/all/*` |

---

## Architecture

```
Attentify (desktop app)
  ContentRuleEngine  ←──  manages rules, bypass scores, escalation
  AgentService       ←──  AI check-ins when bypass score hits threshold
  Debug API :9119    ←──  HTTP bridge to extension

        ↕  HTTP polling (every 60s) + on-popup-open sync

Browser Extension
  background.js      ─── rule sync, URL interception, bypass detection
  content.js         ─── CSS injection, MutationObserver, SPA URL watch
  popup.html         ─── rule toggles, connection status, update checker
```

The extension has **no AI of its own** — all intelligence delegates to the daemon app.

---

## Installation

### Requirements
- Chrome or Edge (Chromium)
- [Attentify](https://github.com/lucadominguez/Daemon-Testing-Version-1) desktop app running as Administrator

### Load as unpacked extension (development)

1. Download this repo: click **Code → Download ZIP**, extract anywhere
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select the `extension/` folder
5. Pin the extension from the toolbar puzzle-piece icon
6. Start the Attentify desktop app — the extension connects automatically

### Connecting to the daemon

The extension polls `http://127.0.0.1:9119/content-rules` (ports 9119–9123 tried in sequence). The popup shows:

- 🟡 **Checking…** — connecting on popup open
- 🟢 **Connected · daemon on :9119** — sync active
- 🔴 **Daemon not found on ports 9119–9123** — daemon not running

Click **↺ Sync** to force an immediate reconnect attempt.

---

## Predefined rules (10 included, all opt-in)

| Rule | Domain | What's hidden |
|---|---|---|
| YouTube Shorts | youtube.com | Shorts shelf, player, nav button, `/shorts/*` redirected |
| YouTube Home Feed | youtube.com | Home feed recommendations |
| YouTube Recommended | youtube.com | Watch-next sidebar |
| Instagram Reels | instagram.com | Reels tab, reel links, `/reels/*` redirected |
| Instagram Explore | instagram.com | Explore tab |
| TikTok For You Page | tiktok.com | FYP feed, `/foryou` redirected |
| X/Twitter "For You" | x.com | Trending sidebar, `/explore` redirected |
| Reddit r/all & r/popular | reddit.com | Nav links, `/r/all/*` redirected |
| Facebook Reels | facebook.com | Reels entries, `/reels/*` redirected |
| LinkedIn Feed | linkedin.com | Main feed posts |

All rules default to **OFF** — enable them individually in the popup.

---

## Bypass detection (7 strategies)

The extension detects when you try to work around a rule and reports it to the daemon:

1. **URL navigation** — direct navigation to a blocked URL pattern → redirected to site root
2. **Search query** — searching "youtube shorts" → logged
3. **SPA navigation** — YouTube/Instagram JS router navigation → re-applies rules
4. **Incognito window** — opening incognito with blocked content → logged
5. **Mobile redirect** — navigating to `m.youtube.com` → logged
6. **Iframe embed** — blocked content inside an iframe → logged
7. **Search query bypass** — searching for blocked terms → logged

### Escalation

| Bypass count | Response |
|---|---|
| 1–2 | Log only |
| 3–5 | Agent check-in: daemon's Claude agent surfaces a proactive message |
| 6–9 | 5-minute full domain block + overlay notification |
| 10+ | 1-hour full domain block + overlay notification |

---

## Updates

The popup has a **Check update** button that compares the installed version against `extension/manifest.json` on this repo's `master` branch.

**To update manually:**
1. Click **Check update** in the popup — if a new version is available, download links appear
2. Download the ZIP, extract, replace your `extension/` folder
3. Go to `chrome://extensions` → click ↺ reload on the extension

Automatic updates via Chrome Web Store are planned for a future release.

---

## Agent tools (daemon side)

When connected, the daemon's Claude agent gains 4 new tools for the extension:

| Tool | What it does |
|---|---|
| `create_content_rule` | Creates a new element-level block rule (AI-generated CSS selectors) |
| `list_content_rules` | Lists all rules with enabled status and bypass counts |
| `toggle_content_rule` | Enables or disables a rule by ID |
| `get_bypass_attempts` | Shows recent bypass attempts and scores |

Example: *"Block just YouTube Shorts, not all of YouTube"* → agent calls `create_content_rule`, extension syncs within 60 seconds.

---

## Debug API

When the daemon is running, these endpoints are available at `http://127.0.0.1:9119`:

```
GET  /content-rules              → all rules + bypass scores + extension status
GET  /extension/status           → connection state + recent bypasses
POST /content-rules/predefined   → install all 10 predefined rules
POST /content-rules/:id/toggle   → { enabled } toggle a rule
POST /extension/bypass           → { ruleId, method, url } record bypass
POST /extension/heartbeat        → mark extension as connected
POST /extension/escalate         → { domain, score, action } trigger block
```

---

## Native Messaging (optional)

For a faster, event-driven connection instead of HTTP polling, see `native-host/`:

```
native-host/
  native-host.js   Node.js stdio bridge
  install.ps1      Windows registry installer
```

```powershell
# Install (run as Admin, replace with your extension ID)
.\native-host\install.ps1 -ExtensionId "abcdefghijklmnopabcdefghijklmnop"
```

---

## Project structure

```
extension/
  manifest.json    Manifest V3
  background.js    Service worker: rule sync, URL interception, bypass detection, update check
  content.js       Content script: CSS injection, MutationObserver, SPA detection
  popup.html       Extension popup
  popup.css        Dark daemon-themed UI
  popup.js         Popup logic: status, rule toggles, update banner

native-host/
  native-host.js   Optional native messaging bridge (Node.js)
  install.ps1      Windows registry + launcher installer

README.md          This file
```

---

## Related

- **Attentify desktop app:** [Daemon-Testing-Version-1](https://github.com/lucadominguez/Daemon-Testing-Version-1)
- Design doc: `.hermes/plans/2026-05-29_browser-extension-design.md` in the daemon repo
