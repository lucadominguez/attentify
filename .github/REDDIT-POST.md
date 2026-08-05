# Reddit post draft

Not published. This file is a working draft for you to review and edit before posting.
Everything below is written to be true as of 2026-07-30, so if the product changes,
change the claims with it.

---

## Where to post

| Subreddit | Fit | Read the rules first |
|---|---|---|
| **r/SideProject** | Best first target. Self promotion is the point of the sub. | Low risk. |
| **r/productivity** | Big and on topic, but allergic to ads. Lead with the problem, not the product. | Many threads require you to be a participant first. Check the self promo rule. |
| **r/getdisciplined** | Same audience, same caution. | Self promo is often restricted to a weekly thread. |
| **r/webdev** or **r/SaaS** | Use the build story angle instead, not the pitch. | Show the engineering, not the download link. |
| **r/chrome_extensions** | Small but exactly the right people for the extension. | Fine. |

Do not cross post the same text everywhere on the same day. Pick one, learn from the
comments, rewrite, then post the next.

**Important:** the app is unsigned right now, so anyone who downloads it hits a Windows
SmartScreen warning. Reddit will absolutely call that out. It is better to say it in
the post than to have someone else say it in a comment. The draft below does.

---

## Option A: r/SideProject (recommended first post)

**Title:**

> I got tired of blockers that punish you for opening reddit.com when reddit is where the answer is, so I built one that reads the actual page

**Body:**

Every website blocker I have used treats a distraction as a property of a domain. It is not. It is a property of the moment.

`reddit.com/r/rust` while I am debugging Rust is research. `reddit.com` at 2pm on a Tuesday is me avoiding a hard function. Same domain, opposite answer. A blocklist cannot tell those apart, so it either blocks too much and I turn it off by Thursday, or it blocks too little and does nothing.

So I built Attentify. You tell it what you are working on in plain English, and it scores each page against that instead of matching a list.

It also strips the engineered parts out of pages you are allowed to be on. The home feed, the Shorts shelf, the recommendation rail and the ad come out. The posts you actually came for stay:

[CLIP: extension.webp]

The part I care about most is that it shows its work. Every decision has a visible score with the signals that produced it, and every one is correctable. If I unblock something, it backs off in that context. If I unblock it again, that correction becomes permanent. It also runs in the other direction and asks about sites it let through that quietly ate 20 minutes.

[IMAGE: how-it-works.png]

A few things that are true and worth saying up front:

- **Windows only.** No Mac build. The extension is Chromium only, so no Firefox or Safari.
- **The installer is not code signed yet**, so SmartScreen will warn you. I am working on the certificate. If that is a dealbreaker, wait, I get it.
- It needs admin rights, because it edits the hosts file and firewall rules. That is the only way blocking survives a determined 2pm me.
- **What leaves your machine:** the detailed activity database stays local. When an AI feature runs, the page domain, path, title, any search query and your stated goals go to my backend and on to the model provider. That is in the privacy policy in plain words rather than buried. You can also bring your own API key and skip my servers entirely.
- The UI, the blocking engine, the local database and the extension are **open source**. The AI prompts and the classifier are not. I would rather say that plainly than call the whole thing open source.

There is a live demo of the real app in the browser, no install and no account: https://productivity-daemon.pages.dev

Code: https://github.com/lucadominguez/attentify

Happy to go into the classifier design in the comments. The part that took longest was not the model, it was getting it to shut up: an early version blocked a Google search for an error message, which is the single fastest way to make someone uninstall.

---

## Option B: r/productivity (problem first, product last)

**Title:**

> Blockers fail because they treat "distraction" as a property of a website. It is a property of the moment.

**Body:**

I have been through the whole genre. Cold Turkey, Freedom, LeechBlock, one very sad Chrome extension I wrote in an afternoon. They all fail the same way, and it took me a while to see the pattern.

They all ask one question: **is this domain on a list?**

But that question has no correct answer. `reddit.com/r/rust` while I am debugging Rust is research. `reddit.com` twenty minutes later, when the hard part got hard, is escape. Same domain. Opposite answers. Any tool that can only see the domain has to guess, and it guesses wrong in whichever direction you tuned it:

- Block aggressively and it blocks your actual work. You add an exception. Then another. Within a week the list has holes and you stop trusting it.
- Block conservatively and it never catches the drift that matters, because drift does not look like a banned site. It looks like eleven legitimate tabs.

The thing that actually correlates with wasted time is not *which* site. It is **what you were doing, and how you were using the page.** Thirty seconds on a subreddit you work in is nothing. Forty minutes of scrolling a home feed you never chose is the whole problem. Those two are indistinguishable to a blocklist and obvious to a human.

The second failure is that these tools never learn. Every one of them is a static config file. You correct it and the correction goes nowhere, so the same wrong block happens next Tuesday, and eventually you disable the tool rather than fight it. Correction should be training data, not a support ticket to yourself.

I got annoyed enough to build the version I wanted. You say what you are working on, and it scores pages against that, path aware, so a subreddit you work in is not the home feed and `/watch` is not `/shorts`. It requires two independent signals before auto blocking anything ambiguous, and searches never auto block on their own, because blocking a search for an error message is the fastest way to make someone quit. Undo a block and it backs off in that context.

It also shows its work, which I think is the actual bar for anything calling itself AI. Every score is visible with the signals behind it, and correctable.

[IMAGE: how-it-works.png]

Fair warnings before anyone clicks: it is Windows only, the installer is not code signed yet so SmartScreen will complain, and it needs admin rights to edit the hosts file. The UI and blocking engine are open source, the AI is not, and I would rather say that than fudge it.

Live demo in the browser, no install, no account: https://productivity-daemon.pages.dev

Even if you never touch it, I would genuinely like to hear whether the framing holds. Is there a case where a plain domain blocklist is actually the right tool and I am overthinking this?

---

## Attaching the media

**On Reddit, post the mp4, not the webp.** The `.webp` clips are sized for the
README, where GitHub renders them inline; Reddit's uploader does not handle animated
WebP and will treat it as a still. Upload `extension-demo.mp4` for anything that
should move, and always upload the file rather than pasting a raw URL.

For a text post, drag the file into the editor at the `[CLIP: ...]` and `[IMAGE: ...]`
markers. For an image or video post, the extension clip is the strongest single asset
and should be the one that carries the post.

| Marker | File in this repo | Use it for |
|---|---|---|
| the ad | `.github/media/attentify-ad-16x9.mp4` | The whole product in 26s. Best single asset for a video post. `attentify-ad-9x16.mp4` for Shorts, Reels or TikTok; `attentify-ad-1x1.mp4` for a square feed. |
| `extension.webp` | `.github/media/extension-demo.mp4` | The hook. A page being cleaned in real time. |
| `app-tour.webp` | `.github/media/app-tour-demo.mp4` | Second clip, showing the app has real depth. |
| `how-it-works.png` | `.github/media/how-it-works.png` | The argument, in one graphic. |
| `hero.png` | `.github/media/hero.png` | Banner, better on X or Product Hunt than Reddit. |
| `logic-dark.png` | `.github/media/logic-dark.png` | Good reply to "how does it actually decide?" |
| `analytics-dark.png` | `.github/media/analytics-dark.png` | Good reply to "what do you get out of it?" |

Both clips are 1920-wide H.264, captured at 2x from the live build, so they upload
to Reddit as-is with no conversion step.

Raw links, if you need to point at one directly:

```
https://raw.githubusercontent.com/lucadominguez/attentify/master/.github/media/extension.webp
https://raw.githubusercontent.com/lucadominguez/attentify/master/.github/media/how-it-works.png
```

## Before you post

- Reread the subreddit rules on self promotion. Several of these subs will remove the post and shadow-ban the account for a first post that is a product link.
- Post from an account with history. A brand new account posting a product link reads as spam and gets filtered automatically.
- Be around for the first two hours. Early comment replies are most of what decides whether a post lives.
- Expect these three questions, and have real answers ready: what happens when the AI is wrong, what data leaves my machine, and why is it not signed.
