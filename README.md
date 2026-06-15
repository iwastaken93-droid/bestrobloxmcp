# BestRobloxMCP

> The best Roblox Studio MCP server — all features free, MIT open source.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is this?

BestRobloxMCP is a Model Context Protocol (MCP) server for Roblox Studio that lets AI agents (Claude, Cursor, Codex, Gemini) debug, edit, and build your Roblox games directly from the chat interface.

## Why BestRobloxMCP?

| | robloxstudio-mcp | WEPPY MCP | **BestRobloxMCP** |
|---|---|---|---|
| **License** | MIT | AGPL + Commercial | **MIT** |
| **Cost** | Free | Freemium | **100% Free** |
| **Sync** | ❌ | Pro only | **✅ Free** |
| **Terrain** | ❌ | Pro only | **✅ Free** |
| **UI Studio** | ❌ | Pro only | **✅ Free** |
| **Lighting/Audio** | ❌ | Pro only | **✅ Free** |
| **Network Sim** | ✅ | ❌ | **✅ Free** |
| **Device Sim** | ✅ | ❌ | **✅ Free** |
| **Scene Analysis** | ✅ | ❌ | **✅ Free** |
| **Build Library** | ✅ | ❌ | **✅ Free** |
| **Web Dashboard** | ❌ | Pro only | **✅ Free** |
| **VSCode Extension** | ❌ | Pro only | **✅ Free** |

## Features

- **Runtime debugging** — Execute Luau in edit/server/client contexts
- **Game-VM eval** — Share `require` cache with your game scripts
- **Playtest automation** — Start/stop playtests, capture logs, multiplayer
- **Network simulation** — Test lag, jitter, packet loss on clients
- **Device simulator** — Capture screenshots across multiple device presets
- **Script editing** — Edit, insert, delete, find/replace across all scripts
- **Asset management** — Search Creator Store, insert, preview, upload
- **Build library** — Procedural generation with Lua-native primitives
- **Terrain tools** — Generate, fill, smooth, read terrain
- **UI Studio** — Natural-language UI generation + design audit
- **Lighting & atmosphere** — Time of day, bloom, color correction
- **Audio & animation** — Sound playback, animation, tweening
- **Bidirectional sync** — Keep Studio ↔ Local files in sync
- **Scene analysis** — Memory, triangles, unparented instances
- **Screenshot capture** — Native resolution viewport screenshots
- **Input simulation** — Mouse, keyboard, character navigation
- **Web dashboard** — Monitor connected instances and tool calls
- **VSCode extension** — IDE integration with live tree view

## Setup

```bash
# Install globally
npm install -g @bestrobloxmcp/bestrobloxmcp

# Or use npx
npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin
```

## Documentation

- [PLAN.md](PLAN.md) — Implementation plan
- [agents.md](agents.md) — How to work on this project
- [context.md](context.md) — Research context
- [decisions.md](decisions.md) — Architecture decisions
- [progress.md](progress.md) — Current progress

## License

MIT — see [LICENSE](LICENSE) for details.
