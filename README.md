<div align="center">

![Attentify](.github/media/hero.png)

**Blockers ask "is this site on a list?" Attentify asks "does this page fit what you said you were doing?"**

[Download for Windows](https://attentify-cloud.ludomi2502.workers.dev/download/win) &nbsp;·&nbsp;
[Try the live demo](https://productivity-daemon.pages.dev) &nbsp;·&nbsp;
[Browser extension](https://productivity-daemon.pages.dev/ext/attentify-extension.zip) &nbsp;·&nbsp;
[Privacy](https://productivity-daemon.pages.dev/privacy)

![Windows](https://img.shields.io/badge/Windows%2010%2B-desktop%20app-6366f1?style=flat-square)
![Chromium](https://img.shields.io/badge/Chrome%20·%20Edge%20·%20Brave-extension-22d3ee?style=flat-square)
![License](https://img.shields.io/badge/license-AGPL--3.0-8b96ad?style=flat-square)
![Open core](https://img.shields.io/badge/open%20core-UI%20%2B%20engine-34d399?style=flat-square)

</div>

---

## The short version

Twenty six seconds, cut from the real app and the real extension. Nothing here is a mockup.

![Attentify in twenty six seconds](.github/media/ad.webp)

Full quality, no compression for the page:
[16:9](.github/media/attentify-ad-16x9.mp4) &nbsp;·&nbsp;
[9:16](.github/media/attentify-ad-9x16.mp4) &nbsp;·&nbsp;
[1:1](.github/media/attentify-ad-1x1.mp4)

## It cleans the page while you read it

The feed, the Shorts shelf, the recommendation rail and the ad come out. The three posts you actually came for stay. On the right, it shows you exactly why it made each call.

![The extension removing distractions from a live page](.github/media/extension.webp)

## Why "just block reddit.com" does not work

Every blocker you have tried treats a distraction as a property of a website. It is not. It is a property of the moment.

`reddit.com/r/rust` while you are debugging Rust is research. `reddit.com` at 2pm on a Tuesday is not. Same domain, opposite answer. A blocklist cannot tell them apart, so you either block too much and turn it off, or block too little and it does nothing.

Attentify scores the page, not the domain.

![How Attentify decides](.github/media/how-it-works.png)

## Tell it what you are doing. It handles the rest.

> **You:** I'm writing until 5, keep me off social.
>
> **Attentify:** On it. I've muted Reddit, X, Instagram and TikTok until 5pm and I'll nudge you if you start drifting. Go write.

No rule builder, no regex, no per-site config screens. The home screen is a chat, and it has real tools behind it: blocking, focus sessions, schedules, goals and analytics.

![Moving through the app](.github/media/app-tour.webp)

## It shows its work, and it takes correction

Most "AI" products ask you to trust a number. This one opens the box.

The Logic page lists every signal behind a decision with its weight, so a block is never a black box. When you undo one, that is treated as data: it backs off in that context, and if you undo it again the correction becomes permanent. It also runs the loop in the other direction and asks about sites it let through that ate 20 minutes of your day.

<table>
<tr>
<td width="50%"><img src=".github/media/logic-dark.png" alt="Logic page showing the reasoning behind decisions"></td>
<td width="50%"><img src=".github/media/actions-dark.png" alt="Pending decisions awaiting review"></td>
</tr>
<tr>
<td align="center"><b>Logic</b><br><sub>What it knows and why it decided</sub></td>
<td align="center"><b>Actions</b><br><sub>Everything it wants your call on</sub></td>
</tr>
<tr>
<td width="50%"><img src=".github/media/analytics-dark.png" alt="Analytics with charts built from natural language"></td>
<td width="50%"><img src=".github/media/chat-dark.png" alt="Chat-first home screen"></td>
</tr>
<tr>
<td align="center"><b>Analytics</b><br><sub>Describe a metric, it builds the chart</sub></td>
<td align="center"><b>Assistant</b><br><sub>The home screen is a conversation</sub></td>
</tr>
</table>

<details>
<summary><b>More screens, and the light theme</b></summary>
<br>

| | |
|---|---|
| ![Activity](.github/media/activity-dark.png) | ![Deep Focus](.github/media/deepfocus-dark.png) |
| **Activity**, the timeline of your day | **Deep Focus**, locked sessions |
| ![Protection](.github/media/protection-dark.png) | ![Timesheets](.github/media/timesheets-dark.png) |
| **Protection**, rules and enforcement | **Timesheets**, where the hours went |
| ![Analytics, light](.github/media/analytics-light.png) | ![Logic, light](.github/media/logic-light.png) |
| Light theme is a real target, not an afterthought | Both themes are designed, not inverted |

</details>

> The screenshots and clips above run on generated sample activity so the charts have something to show. The interface is the real compiled app, not a mockup.

## Getting it

**Desktop app (Windows 10 or later).** [Download the installer](https://attentify-cloud.ludomi2502.workers.dev/download/win). It is not code signed yet, so Windows SmartScreen will warn you on first run: choose "More info" then "Run anyway", or wait for a signed build. The app needs administrator rights because it edits the hosts file, firewall rules and browser policy, which is how blocking survives a determined 2pm you.

**Browser extension (Chrome, Edge, Brave, Arc, Opera, Vivaldi).** [Download the zip](https://productivity-daemon.pages.dev/ext/attentify-extension.zip), unzip it, then load it at `chrome://extensions` with Developer mode on. It is not on the Web Store yet. It works standalone, so no desktop app is required, though the two make each other better.

There is no macOS build, and the extension does not run on Firefox or Safari.

**What leaves your machine.** The detailed activity database stays local. When an AI feature runs, the page domain, path, title, any search query and your stated goals are sent to the backend and on to the model provider. The [privacy policy](https://productivity-daemon.pages.dev/privacy) spells this out. AI runs only through the managed service, so there is no configuration in which it bypasses those servers.

## This repository

This is the open source part of Attentify: the parts that run on your machine and touch your browsing, published so they can be read and audited.

| Path | What it is |
|---|---|
| `website/` | The marketing site and the in-browser demos, as deployed. |
| `extension/` | The extension's popup UI, the on-page scanner and blocker (`content.js`), icons and manifest. |
| `desktop/src/renderer/` | The whole desktop app UI: views, chat panel, card system, charts, theme and design tokens. |
| `desktop/src/preload/` | The preload bridge, meaning the exact surface the UI is allowed to reach. |
| `desktop/src/shared/` | Shared types and the deterministic analytics query engine. Cards store a spec and recompute locally, so a chart never costs a model call. |
| `desktop/src/main/` | The non-AI engine: blocking and enforcement, activity tracking, the local database and migrations, scheduling, diagnostics, updates, safety and restore. |

**The AI is closed source.** Every prompt and every model-call harness stays private, along with the logic that decides what counts as a distraction: the agent loop and its tools, model routing, the inference engine and site rules, the heuristics and confidence scoring, the self-evaluation loop, and the cloud backend that handles accounts, billing and the metered AI proxy.

Some files here import those private modules by name. That is deliberate, so the wiring stays visible even where the implementation is not.

**This tree is a reference and audit source, not a standalone build.** The desktop app will not compile on its own without the private modules. The website and the extension UI are static, and can be read or served directly.

## Why this is a subscription and not a one-time purchase

The hard part of this product is not the build, it is the upkeep. Sites rewrite their
layouts and their dark patterns constantly, and a selector or a rule that worked last
month quietly stops matching. So the work that matters is continuous:

- **Detection is maintained.** New feeds, shelves and rails are handled as they appear,
  and broken selectors are fixed rather than left to rot.
- **The classifier is improved from real mistakes.** Every correction you make feeds a
  calibration loop, and the thresholds are retuned as evidence accumulates.
- **The app updates itself.** You stay on the current build without going looking for it.
- **The AI is operated for you.** Model routing, provider changes and cost are handled
  server side, so nothing to configure and nothing to keep working.

A fork is a snapshot of one afternoon. It stops being accurate the moment a site ships a
redesign, and nobody is on the other end of it.

## License

[GNU AGPL-3.0](LICENSE).

This is copyleft with the network clause: you are free to read, modify and self-host
this code, and if you run a modified version as a network service you have to publish
your changes under the same licence. It was MIT until August 2026.
