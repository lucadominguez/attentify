<div align="center">

![Attentify](.github/media/hero.png)

**Blockers ask "is this site on a list?" Attentify asks "does this page fit what you said you were doing?"**

[Download for Windows](https://api.attentify.ca/download/win) &nbsp;·&nbsp;
[Try the live demo](https://attentify.ca) &nbsp;·&nbsp;
[Browser extension](https://attentify.ca/ext/attentify-extension.zip) &nbsp;·&nbsp;
[Privacy](https://attentify.ca/privacy)

![Windows](https://img.shields.io/badge/Windows%2010%2B-desktop%20app-6366f1?style=flat-square)
![Chromium](https://img.shields.io/badge/Chrome%20·%20Edge%20·%20Brave-extension-22d3ee?style=flat-square)
![License](https://img.shields.io/badge/license-AGPL--3.0-8b96ad?style=flat-square)
![Open core](https://img.shields.io/badge/open%20core-UI%20%2B%20engine-34d399?style=flat-square)

</div>

---

## The short version

Seventy five seconds on why a blocklist cannot do this, cut from the real app and the real extension. Nothing here is a mockup.

![Why a blocklist cannot do this](.github/media/ad.webp)

Full quality, with narration:
[16:9](.github/media/attentify-ad-16x9.mp4) &nbsp;·&nbsp;
[9:16](.github/media/attentify-ad-9x16.mp4) &nbsp;·&nbsp;
[1:1](.github/media/attentify-ad-1x1.mp4)

## It cleans the page while you read it

Three real pages, cleaned in front of you. The Reddit feed loses its promoted posts and its short-form video rail, a YouTube search loses the sponsored result and the Shorts shelf, and the watch page loses the autoplay queue and the recommendation rail. The posts and the video you actually came for stay. On the right is the real extension panel, naming every call as it makes it.

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

## Everything it does

Nine surfaces, each doing one job. Every screenshot below is the real compiled app
running on generated sample activity.

### Assistant. Say it once, it handles the rest.

The home screen is a conversation, not a dashboard of toggles. Ask in plain English and
it has real tools behind it: blocking, focus sessions, schedules, goals and analytics.
Conversations are saved, you can attach a screenshot, and you can revert to any earlier
checkpoint in one click if it goes too far.

![Assistant](.github/media/chat-light.png)

### Logic. It shows its work.

Most "AI" products ask you to trust a number. This one opens the box. Every signal
behind a decision is listed with its weight, alongside your goals and everything it has
learned about you, and you can edit any of it. Undo a block and that is treated as data:
it backs off in that context, and a second undo makes the correction permanent. It runs
the loop the other way too, asking about sites it let through that ate twenty minutes of
your day.

![Logic](.github/media/logic-light.png)

### Actions. It catches you before you spiral.

Everything it wants your call on, in one queue, each with a confidence score and the
reason in plain language. Dismiss it or block it. Nothing is enforced behind your back
without appearing here first.

![Actions](.github/media/actions-light.png)

### Analytics. Just describe the metric.

Ask for "time on social media per weekday" or "my top 5 domains in the evening" and it
builds the chart, live, from your own activity. Cards keep their spec and recompute
locally, so looking at a chart never costs a model call.

![Analytics](.github/media/analytics-light.png)

### Timesheets. Where the hours actually went.

Day by day, split into productive and distracting, with the top apps for the week. The
RescueTime view, without the subscription to a second product.

![Timesheets](.github/media/timesheets-light.png)

### Activity. The timeline of your day.

Every app and page in order, so "where did the afternoon go" has an answer rather than a
guess.

![Activity](.github/media/activity-light.png)

### Deep Focus. Set it and actually forget it.

A hard lockdown with an allowlist: Pomodoro, deep work, flow state or a half day.
A locked session refuses to end early, which is the point.

![Deep Focus](.github/media/deepfocus-light.png)

### Protection. Ban the stuff that hooks you, by name.

The rules layer: what is blocked, how it is enforced, and the keyword and title blocks
you set yourself. This part is free and needs no account.

![Protection](.github/media/protection-light.png)

### And the rest

- **Deep Clean** finds attention leaks and can stop apps launching at startup.
- **Scheduler** builds recurring focus blocks, and the AI can create them for you.
- **History import** reads your existing browser history so analytics work on day one.
- **Works with your browser, whatever it is.** Time tracking covers 30 browser
  processes natively. Full address reading covers Chrome, Edge, Firefox, Brave and
  Vivaldi. The extension is Chromium only.
- **Light and dark themes**, both designed rather than inverted.

<details>
<summary><b>The same screens in dark theme</b></summary>
<br>

| | |
|---|---|
| ![Assistant, dark](.github/media/chat-dark.png) | ![Logic, dark](.github/media/logic-dark.png) |
| **Assistant** | **Logic** |
| ![Analytics, dark](.github/media/analytics-dark.png) | ![Actions, dark](.github/media/actions-dark.png) |
| **Analytics** | **Actions** |
| ![Activity, dark](.github/media/activity-dark.png) | ![Deep Focus, dark](.github/media/deepfocus-dark.png) |
| **Activity** | **Deep Focus** |
| ![Protection, dark](.github/media/protection-dark.png) | ![Timesheets, dark](.github/media/timesheets-dark.png) |
| **Protection** | **Timesheets** |

</details>

> The screenshots and clips above run on generated sample activity so the charts have
> something to show. The interface is the real compiled app, not a mockup.

## Getting it

**Desktop app (Windows 10 or later).** [Download the installer](https://api.attentify.ca/download/win). It is not code signed yet, so Windows SmartScreen will warn you on first run: choose "More info" then "Run anyway", or wait for a signed build. The app needs administrator rights because it edits the hosts file, firewall rules and browser policy, which is how blocking survives a determined 2pm you.

**Browser extension (Chrome, Edge, Brave, Arc, Opera, Vivaldi).** [Download the zip](https://attentify.ca/ext/attentify-extension.zip), unzip it, then load it at `chrome://extensions` with Developer mode on. It is not on the Web Store yet. It works standalone, so no desktop app is required, though the two make each other better.

There is no macOS build, and the extension does not run on Firefox or Safari.

**What leaves your machine.** The detailed activity database stays local. When an AI feature runs, the page domain, path, title, any search query and your stated goals are sent to the backend and on to the model provider. The [privacy policy](https://attentify.ca/privacy) spells this out. AI runs only through the managed service, so there is no configuration in which it bypasses those servers.

## Give it to your AI agent

Your agent can read your code and your files, but not the forty minutes you lost before you opened them. The MCP server in [`mcp/`](mcp/) closes that gap.

```
claude mcp add attentify -- npx -y @attentify/mcp
```

Then: *"what have I actually been working on for the last three hours?"*, *"am I drifting off what I said I'd do today?"*, *"block whatever has been eating my afternoon."*

Seven tools. Six read what you did and what you said you were aiming at; one blocks a site. It talks to the desktop app over `127.0.0.1`, gated by a per-install token, and makes no network calls of its own. Zero dependencies and one file of about 250 lines, because asking you to let an agent read your browsing history and then handing you a dependency tree would be rude.

There is a [skill](mcp/skill/SKILL.md) that goes with it, teaching an agent to read your goals before it judges anything as a distraction. The same site is focus for one person and avoidance for another, and an agent that does not know the difference is just a worse version of a blocklist.

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
| `mcp/` | The MCP server, so an AI agent can use all of the above. Unlike the rest of this tree it **is** a standalone build: `npm test` runs here as-is. |

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
