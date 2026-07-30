# Changelog

All notable changes to Attentify (desktop app) are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/), and the
project uses [semantic versioning](https://semver.org/).

## [Unreleased]

### Changed
- **The app now ships with its intended typefaces.** Inter, Space Grotesk and JetBrains
  Mono are bundled with the app instead of being requested from a font CDN, which the
  app's own security policy had always blocked. Text was silently falling back to system
  defaults, so the interface now looks the way it was designed to and matches the website.
- **Section headings, labels and buttons no longer shout.** Around 180 places set text in
  tracked-out uppercase monospace, which made the app read like a diagnostic readout.
  These are now normal sentence case in the regular typeface. Monospace is reserved for
  figures and status values, where fixed-width digits actually help columns line up.
- **Cards lost their decorative corner brackets** in favour of a rounded surface with a
  soft shadow, which suits an app you leave running all day.
- Small type across the app was lifted off an unreadable 8-9px floor.
- Suggestion cards on Actions now show a labelled confidence meter instead of a coloured
  hairline stretched across the card, and say "Site" or "App" rather than a raw value.
- Chart axis labels are neutral again, so colour on a chart means something.
- Settings is no longer described in terms of "threats"; Attentify is a focus tool.

### Fixed
- Suggestions with a missing timestamp showed "NaNd ago". They now say "recently".
- Removed em dashes from Attentify's own wording in the demo data, per the product's
  copy rules.

## [1.2.0] - 2026-07-30

### Added
- **Distraction detection now learns from what it MISSES, not just what it over-blocks.**
  If you spend real time on a site the app never flagged, it will occasionally ask "was
  that a distraction?". A yes blocks it and teaches the classifier it was under-blocking;
  a no confirms the pass was right. Either way the answer improves accuracy over time.
- **The classifier now factors in how you actually used a page.** When the browser
  extension is connected, real dwell time, scroll depth and clicks into recommended
  content feed into the decision, so a video you watched for 40 minutes and one you closed
  in 20 seconds are no longer treated the same. The extension keeps working on its own.
- **Confidence scores now self-calibrate.** As you accept and reverse decisions, the app
  learns how much to trust its own scores and adjusts the block/suggest thresholds to
  match reality. With little history it changes nothing.
- **Goal-aware page scoring.** A page the app has judged genuinely relevant to your active
  goal is eased off automatically, and a clearly off-task one is nudged up, without an
  extra AI call.
- **Better coverage of unfamiliar sites.** A site with a plain name that quietly eats real
  time now gets assessed too, instead of only obviously-recreational-looking domains.
- **Logic page: "How Attentify decides".** A plain-language explanation of the reasoning,
  in the open: the kinds of thing it treats as engineered distraction (short-form feeds,
  algorithmic home feeds, recommendation rails) and the principles it follows, so nothing
  about how it decides is a black box. At parity with the browser extension.
- **New "A" logo** across the app, matching the extension and website.
- **Activity page** — a searchable, filterable, day-grouped feed of your local search
  history, browsing history (URLs), and app-by-app activity. Everything stays on-device.
- **AI credits and subscription.** Every account starts with free trial credit. Top up
  any time with a credit pack ($5 / $10 / $20), or subscribe for $9.99/mo to get unlimited
  AI plus more custom analytics. Your remaining credits show in Settings and in chat.

### Changed
- Removed the soft glow that used to breathe behind the sidebar logo; the mark now reads
  as a clean logo.
- Moved the raw browsing/session data out of Analytics (its old *Websites* and *Log*
  tabs) onto the new Activity page; Analytics now focuses on charts, patterns and cards.
- **AI now runs through Attentify's secure cloud service.** Signing in gives every account
  its own metered AI, so no shared key is involved. Bringing your own OpenRouter or
  Anthropic key still works and is never metered. AI now needs a signed-in account and an
  internet connection.
- When your credits run out, AI features and adaptive blocking pause until you top up or
  subscribe. Your built-in rule packs and any blocks you set by hand keep working.

### Security
- Removed the bundled provider key from the app entirely. AI is authenticated per account
  through the cloud service instead, so there is no shared key to leak.

### Fixed
- **UI no longer freezes while the AI is thinking.** Streaming updates are coalesced in
  the main process (~55 ms) instead of firing on every token, message markdown is
  memoized so only the streaming message re-renders, and a redundant per-chunk sanitize
  pass was removed — the event loop stays responsive on long replies and conversations.

## [1.1.0] — 2026-07-12

### Added
- **Chat-first assistant** as the home screen, with multiple **conversations** (switcher
  + new chat), **image attachments** (vision), and **Cursor-style revert checkpoints** —
  scroll up and restore blocks/schedules/cards to any earlier point.
- **Logic page** — collapsible flow-charts of how Attentify reasons about your attention
  (signals → inference → suggestion), plus a bar to feed it your own context.
- **Describe-your-analytics** — ask for a metric in plain English and it builds a live
  card (bar / line / table / number) on the Analytics page.
- **Timesheets** — RescueTime-style day-by-day time breakdown by app and category.
- **AI-built schedules** that are actually **enforced** — recurring auto-block windows
  that turn on/off on their own (e.g. "block social 9–5 on weekdays").
- **Deep Clean: stop apps launching at startup** (registry + Startup folder).
- **Browser-history import** — bootstraps analytics from day one from your own profiles.
- **Native tracking for the top 15 browsers** (Chrome, Edge, Firefox, Brave, Opera,
  Vivaldi, Safari, Arc, Tor, Yandex, DuckDuckGo … ) — no extension required.
- **Light + dark themes** (follows the OS by default, with a titlebar toggle) and an
  app-version readout in Settings.
- New friendly robot **logo**, used as the app icon and the AI's chat avatar.
- `COMPATIBILITY.md` documenting supported Windows versions and dependencies.

### Changed
- **Cheap-by-default model routing**: most tasks run on DeepSeek V4 Pro; only genuinely
  high-ambiguity turns (open-ended reasoning / advice / images) escalate to Claude
  Sonnet, chosen by a zero-token local classifier. Accurate DeepSeek pricing means the
  free allowance stretches much further. Quality where it matters, far lower cost.
- Cohesive **"Slate & Violet"** color scheme replacing the clashing green/red/blue.
- Removed the separate Dashboard page; theme-aware sidebar + titlebar.

### Fixed
- Chat no longer leaks raw tool-call JSON (scrubbed live, streaming and stored history).
- The stuck blank overlay window in the corner (reveal-only-after-paint handshake).
- The browser extension's URL classifier no longer pollutes chat history (routed through
  a raw `/ai/json` proxy instead of the chat agent).

## [1.0.0] — Attentify (rebrand baseline)

- System-level distraction blocking (hosts file + process killing), activity tracking,
  13 heuristic distraction detectors, AI inference pipeline, Focus/Deep-Focus sessions,
  Deep Clean scanner, Schedule Manager, cloud auth/sync, and the Attentify rebrand.
- Predecessor project: "Productivity Daemon" (initial commit).
