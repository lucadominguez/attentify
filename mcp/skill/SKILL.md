---
name: attentify-focus
description: Ground advice about focus, procrastination and time in what the user has actually been doing, using the Attentify MCP server, and block distracting sites when asked. Use when the user asks where their time went, why they are unproductive, whether they are on track today, to be held accountable, or to block something. Do not use for calendar scheduling or task management.
---

# Attentify: focus grounded in real behaviour

You normally have no idea what the person you are helping has actually been doing. You
infer it from what they tell you, and people are unreliable narrators about their own
attention. They under-report the drift and over-report the deep work, not from dishonesty
but because the drift is genuinely hard to recall.

The Attentify MCP server closes that gap. Use it whenever a question turns on real
behaviour rather than intention.

## Before you start

Requires the [Attentify desktop app](https://attentify.ca) running locally, plus the
connector:

```
claude mcp add attentify -- npx -y @attentify/mcp
```

If a tool reports that Attentify is not running, say so plainly and stop. Do not guess at
the user's activity to fill the gap. A confident invented answer about how someone spent
their morning is worse than no answer.

## The core move: goals first, then activity

**Always read `get_goals` before you judge anything as a distraction.** This is the whole
discipline of the skill. The same site is focus for one person and avoidance for another:
YouTube is a distraction for someone writing a dissertation and the actual job for someone
editing video. Twitter is procrastination on Tuesday and research for the person writing a
piece about Twitter.

Attentify stores what the user said they are working towards. Read it, then read
`get_recent_activity`, and judge the second against the first. Never against your own
priors about which websites are "productive".

If there are no goals recorded, say so and ask what they are working on, rather than
falling back on a generic ranking of sites.

## Choosing the window

`get_recent_activity` takes `hours`. Match it to the question:

| They ask | Window |
|---|---|
| "what am I doing right now", "am I on track" | `get_focus_status` alone, no history needed |
| "where did my morning go" | 3 to 5 |
| "why did I get nothing done today" | 8 to 12 |
| "am I getting worse at this" | 24, the maximum |

Pulling 24 hours to answer "what am I doing right now" wastes context and buries the
answer. Start narrow.

## Reporting back

Lead with the specific finding, not the methodology. "You spent 90 minutes on Reddit
between 10 and noon, against a stated goal of shipping the parser" is useful. "I analysed
your activity data across several sources" is not.

Two failure modes to avoid:

- **Do not moralise.** Report what happened and what it means for their stated goal. The
  user installed an attention tool; they do not need a lecture on top of it. State the
  number, name the trade-off, stop.
- **Do not flatter either.** If they asked to be held accountable and the data says they
  drifted, say the data says they drifted. Softening it to be pleasant destroys the only
  reason to have real data in the first place.

`get_distraction_flags` gives you Attentify's own judgement with its confidence and
reasoning. Treat it as a second opinion rather than ground truth: it is a classifier, it can
be wrong, and the user's goals are the better authority. When it disagrees with your read
of the goals, say so and let the user settle it.

## Blocking

`block_site` changes the user's machine and persists until it is undone. Only call it when
they have asked for it, or agreed to it in this conversation. "Block whatever is eating my
afternoon" is agreement. "Why do I keep ending up on Reddit" is not, because that is a question,
and the answer is an explanation, possibly followed by *offering* to block it.

When you do block, say what you blocked and how to undo it. Someone who discovers a site
mysteriously unreachable and does not connect it to a conversation with you has been
handed a bug, not a feature.

`unblock_site` is the reverse and needs the same care in the other direction: if they are
in a focus session and ask you to unblock the thing they blocked, it is worth one sentence
noting that is what past-them was trying to prevent. One sentence. Then do what they ask.

## What this is not for

Calendar scheduling, task lists, and reminders. Attentify observes attention and enforces
blocks; it does not manage a todo list. Reach for the right tool rather than bending this
one.
