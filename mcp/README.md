# Attentify MCP server

Gives an AI agent access to what you have **actually** been doing, and the ability to act
on it.

Most agents are blind to the human they work for. They can read your code and your files,
but not "you have been on Reddit for forty minutes and your stated goal this morning was
to ship the parser". This closes that gap, and lets the agent do something about it.

```
claude mcp add attentify -- npx -y @attentify/mcp
```

Then ask your agent things like:

- *"What have I actually been working on for the last three hours?"*
- *"Am I drifting off what I said I'd do today?"*
- *"Block whatever has been eating my afternoon."*

## Requirements

The [Attentify desktop app](https://attentify.ca) running on the same machine. This server
is a connector, not the product: the sensing, classification and blocking all happen in the
app. Windows only for now, because the app is.

## Tools

| Tool | What it does |
|---|---|
| `get_focus_status` | Current page, active focus session, blocked counts, unactioned distraction flags |
| `get_recent_activity` | What you have been doing, most recent first, over a window you choose |
| `get_goals` | The goals you have told Attentify you are working towards |
| `get_blocklist` | Which domains and apps are blocked right now |
| `get_distraction_flags` | What Attentify judged distracting, with confidence and reasoning |
| `block_site` | Block a domain across every browser |
| `unblock_site` | Remove a domain from the blocklist |

`block_site` changes your machine. Agents are told in the tool description to use it only
when you have asked or agreed.

There is deliberately no `start_focus_session`: the app has no local route for it yet, and
a tool that quietly does nothing is worse than a tool that is missing.

## How it connects, and what it can see

The app exposes a local API on `127.0.0.1` (ports 9119-9123) gated by a per-install token
at `C:\ProgramData\Attentify\debug-token`. This server reads that file. **Nothing here
touches the network**. No telemetry, no phone-home, no account required. Your activity
data does not leave the machine by way of this connector.

What your *agent* then does with the data is between you and your agent. If you are running
a hosted model, the activity you pass it goes wherever that model runs. That is worth being
deliberate about, which is why the read tools return what you ask for rather than dumping
everything by default.

Zero dependencies, one file, no build step. This asks you to let an agent see your browsing
history, so the whole thing should be readable in one sitting: about 250 lines of
`attentify-mcp.mjs`.

## Configuration

| Variable | Purpose |
|---|---|
| `ATTENTIFY_TOKEN` | Use this token instead of reading the file |
| `ATTENTIFY_DATA_DIR` | Look for `debug-token` and `debug-port` somewhere other than `C:\ProgramData\Attentify` |

## Development

```
npm test        # bundles the app's real access-control module, then runs the server for real
```

The tests spawn the actual server as a child process and speak MCP to it over stdio,
against an HTTP server whose authorization decision comes from the app's own compiled
access module. Only the data layer is faked.

## Licence

AGPL-3.0-or-later, same as the rest of Attentify.
