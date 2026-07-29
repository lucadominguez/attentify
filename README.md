# Attentify (open source)

Attentify is an AI that protects your attention. It strips the engineered traps out
of the web (feeds, Shorts, Reels, rage-bait), keeps the parts you actually came for,
and learns from you instead of nagging you.

- Website and downloads: https://productivity-daemon.pages.dev
- Product repo (issues, releases): https://github.com/lucadominguez/attentify

This repository holds the **open source part** of Attentify: the user interface,
the marketing site, the browser extension's UI and page blocker, and the
deterministic engine around them. It is published so the parts that run on your
machine and touch your browsing can be read and audited.

## What's in here

| Path | What it is |
|---|---|
| `website/` | The marketing site and the in-browser demos, as deployed. |
| `extension/` | The Chromium extension's popup UI (`popup.*`), the on-page scanner and blocker (`content.js`), icons and manifest. |
| `desktop/src/renderer/` | The whole desktop app UI: views, chat panel, card system, charts, theme and design tokens. |
| `desktop/src/preload/` | The preload bridge, i.e. the exact surface the UI can reach. |
| `desktop/src/shared/` | Shared types and the deterministic analytics query engine (cards store a spec and recompute locally). |
| `desktop/src/main/` | The non-AI engine: blocking and enforcement, activity tracking, the local database and migrations, scheduling, diagnostics, updates, safety and restore. |

## What is not in here

The AI is closed source. Specifically, every prompt and every model-call harness
stays private, along with the logic that decides what counts as a distraction:

- the agent loop, its system prompt, and its tool definitions (this is what turns
  "time on social by weekday" into a chart, so analytics generation is included)
- the model/provider routing and the AI client
- the inference engine, the LLM context assessor and the site rules that feed them
- the heuristics and confidence scoring
- the self-evaluation loop: calibration, error hypotheses and the mistake reviewer
- the notification and focus-session prompt writers
- the cloud backend (accounts, billing, and the metered AI proxy)

A few files here import those private modules by name. That is deliberate: the
wiring is visible even though the implementation is not.

## Building

This tree is a **reference and audit source, not a standalone build.** The desktop
app will not compile on its own, because the private modules above are missing.
The website and the extension UI are static and can be read or served directly.

## Contributing

Issues and pull requests against the open parts are welcome. Please file them on
the product repo: https://github.com/lucadominguez/attentify

## License

See [LICENSE](LICENSE).
