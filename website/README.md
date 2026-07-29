# Attentify — marketing site

A self-contained, dependency-free landing page (HTML + CSS + vanilla JS). No build step,
no framework. Open `index.html` in a browser, or deploy the folder anywhere static.

```
website/
  index.html   markup + copy
  styles.css   design system + responsive + animations
  app.js        nav, scroll reveals, count-ups, OS detection, the live demo engine
```

## The differentiator
The **Live demo** section (`#demo`) is a real, working simulation: flip the switch and the
daemon surgically removes the bait (Shorts, recommendation feed, autoplay) while keeping the
useful items, with a live intent readout and distraction meter. It auto-engages once when
scrolled into view. Competitors ship screenshots — this ships the scalpel.

## Before you publish — set the real download URLs
Download buttons are tagged `class="dl" data-os="mac|win"`. They currently point at GitHub
release assets that you must publish (or change):

- Mac:     `…/Daemon-Testing-Version-1/releases/latest/download/Productivity-Daemon.dmg`
- Windows: `…/Daemon-Testing-Version-1/releases/latest/download/Productivity-Daemon-Setup.exe`
- Extension: `https://github.com/lucadominguez/Browser-Daemon` (swap for the Chrome Web Store
  listing once published).

Search `index.html` for `releases/latest` and `lucadominguez` to update.

## Cloud / payments wiring
The site talks to the [backend Worker](../backend/) for the $5/mo Cloud tier:

- `index.html` pricing → **Get Cloud — $5/mo** (`#cloud-buy-btn`) calls
  `POST /v1/billing/checkout` and redirects to Stripe Checkout.
- `success.html?session_id=…` polls `/v1/billing/session` and shows the buyer their
  license key + how to paste it into the app.
- `account.html` lets a user check status (`/v1/me`) and open the Stripe billing
  portal (`/v1/billing/portal`).

Set the backend URL in **three** places (search for `CLOUD_API` / `const API`):
`app.js`, `success.html`, `account.html`. They default to the
`productivity-daemon-cloud.workers.dev` placeholder.

## Deploy
- **GitHub Pages:** push the repo, then either move this folder to `/docs` and enable Pages →
  *Deploy from branch → /docs*, or publish `website/` to a `gh-pages` branch.
- **Netlify / Vercel / Cloudflare Pages:** point the project at this folder; build command none,
  publish directory `website`.
- **Any static host / S3:** upload the three files.

## Local preview
```bash
cd website && python3 -m http.server 8080   # then open http://localhost:8080
```
(Plain `file://` works too — the Google Fonts just need a network connection.)
