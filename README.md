# BestRobloxMCP

> The best Roblox Studio MCP server — all features free, MIT open source.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@bestrobloxmcp/bestrobloxmcp)](https://www.npmjs.com/package/@bestrobloxmcp/bestrobloxmcp)
[![GitHub](https://img.shields.io/badge/GitHub-iwastaken93--droid%2Fbestrobloxmcp-blue?logo=github)](https://github.com/iwastaken93-droid/bestrobloxmcp)

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

- 🐛 **Runtime debugging** — Execute Luau in edit/server/client contexts
- 🎮 **Game-VM eval** — Share `require` cache with your game scripts
- ▶️ **Playtest automation** — Start/stop playtests, capture logs, multiplayer
- 🌐 **Network simulation** — Test lag, jitter, packet loss on clients
- 📱 **Device simulator** — Capture screenshots across multiple device presets
- ✏️ **Script editing** — Edit, insert, delete, find/replace across all scripts
- 🎨 **Asset management** — Search Creator Store, insert, preview, upload
- 🧱 **Build library** — Procedural generation with Lua-native primitives
- 🏔️ **Terrain tools** — Generate, fill, smooth, read terrain
- 🖥️ **UI Studio** — Natural-language UI generation + design audit
- 💡 **Lighting & atmosphere** — Time of day, bloom, color correction
- 🔊 **Audio & animation** — Sound playback, animation, tweening
- 🔄 **Bidirectional sync** — Keep Studio ↔ Local files in sync
- 🔍 **Scene analysis** — Memory, triangles, unparented instances
- 📸 **Screenshot capture** — Native resolution viewport screenshots
- 🖱️ **Input simulation** — Mouse, keyboard, character navigation
- 📊 **Web dashboard** — Monitor connected instances and tool calls
- 🧩 **VSCode extension** — IDE integration with live tree view

## Quick Start

```bash
# 1. Install the MCP server
npm install -g @bestrobloxmcp/bestrobloxmcp

# 2. Start the server (auto-installs the Studio plugin)
npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin

# 3. Open Roblox Studio — the plugin connects automatically
```

📖 **New to BestRobloxMCP?** Read the [Getting Started Guide](GETTING_STARTED.md) for a complete beginner walkthrough with examples, workflows, and troubleshooting.

## Configuration

| Environment Variable | Purpose |
|---|---|
| `ROBLOX_OPEN_CLOUD_API_KEY` | Creator Store search + asset upload |
| `ROBLOX_CREATOR_USER_ID` | Default creator for uploads |
| `ROBLOX_CREATOR_GROUP_ID` | Default group for uploads |
| `ROBLOX_STUDIO_PORT` | HTTP port (default: 58741) |
| `MCP_PLUGINS_DIR` | Custom Studio plugin install path |

## CLI Flags

| Flag | Description |
|---|---|
| `--auto-install-plugin` | Download and install the Studio plugin on startup |
| `--install-plugin` | Install plugin and exit |
| `--safe-mode` | Run in read-only mode (no mutations) |
| `--open-cloud-key <key>` | Set Open Cloud API key |
| `--creator-id <id>` | Set creator user ID |
| `--creator-group-id <id>` | Set creator group ID |

## Web Dashboard

When the server is running, open `http://localhost:58741/dashboard` in your browser to see:
- Connected Studio instances (live status)
- Server uptime and health
- Plugin version mismatch warnings

## Documentation

- [PLAN.md](PLAN.md) — Implementation plan
- [agents.md](agents.md) — How to work on this project
- [context.md](context.md) — Research context
- [decisions.md](decisions.md) — Architecture decisions
- [progress.md](progress.md) — Current progress

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, conventions, and how to add new tools.

## License

MIT — see [LICENSE](LICENSE) for details.
