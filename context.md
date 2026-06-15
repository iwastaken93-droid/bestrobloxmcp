# Research Context — BestRobloxMCP

> All research on robloxstudio-mcp (free) and weppy-roblox-mcp (pro). Update this file when you discover new features or make changes.

---

## 1. Project A: robloxstudio-mcp (Free / Open Source)

- **Package:** `@chrrxs/robloxstudio-mcp`
- **License:** MIT
- **Version:** 2.16.1
- **Repo:** https://github.com/chrrxs/robloxstudio-mcp
- **Based on:** boshyxd/robloxstudio-mcp v2.7.0
- **Tools:** 75 total (including 35 read-only inspector variant)

### Core Features

| Feature | Description |
|---------|-------------|
| **Runtime debugging** | Execute Luau in plugin context (edit/server/client) |
| **Game-VM eval** | `eval_server_runtime` / `eval_client_runtime` — shares `require` cache |
| **Playtest automation** | Start/stop play/run mode, capture output, multiplayer |
| **Multiplayer testing** | StudioTestService with add/remove clients, network simulation |
| **Bulk operations** | Mass create, duplicate, set properties, delete |
| **Script editing** | Edit lines, insert, delete, find/replace, grep |
| **Build library** | JS sandbox procedural generation (room, roof, stairs, etc.) |
| **Asset management** | Search Creator Store, insert, preview, upload |
| **Screenshot** | Viewport capture at native resolution, device matrix |
| **Input simulation** | Mouse click, keyboard, character navigation |
| **Memory/Scene** | Stats per peer, SceneAnalysisService attribution |
| **Serialization** | `.rbxm` import/export via SerializationService |
| **Undo/Redo** | ChangeHistoryService integration |

### Architecture

- **Node.js/TypeScript** with Express HTTP server
- **MCP stdio transport** for Claude/Cursor/Codex/Gemini
- **BridgeService** for multi-instance routing (edit/server/client-N)
- **Proxy mode** — multiple servers on same port
- **OpenCloudClient** — asset search/upload with API key
- **RobloxCookieClient** — cookie auth for own assets
- **Build executor** — JS sandbox (`vm`) for procedural generation
- **Studio plugin** — Luau plugin (roblox-ts) with HTTP polling
- **ClientBroker** — RemoteFunction proxy for client peer execution
- **EvalBridges** — BindableFunction for Game-VM eval
- **RuntimeLogBuffer** — 64KB per-peer ring buffer

### Studio Plugin Structure

```
studio-plugin/src/
├── server/index.server.ts          # Entry point
├── modules/
│   ├── Communication.ts            # HTTP polling + request dispatch
│   ├── State.ts                    # Connection state, version
│   ├── UI.ts                       # Plugin UI (tabs, status, dots)
│   ├── Utils.ts                    # Path resolution, property conversion
│   ├── LuauExec.ts                 # Luau execution helpers
│   ├── Recording.ts                # ChangeHistoryService wrapper
│   ├── EvalBridges.ts              # Game-VM eval bridge scripts
│   ├── ClientBroker.ts             # Client→Server proxy
│   ├── RuntimeLogBuffer.ts         # Log capture ring buffer
│   ├── HttpDiagnostics.ts          # Error formatting
│   ├── RenderMonitor.ts           # Capture pre-checks
│   ├── StopPlayMonitor.ts         # Cross-DM playtest stop
│   ├── ServerUrlSettings.ts       # URL persistence
│   └── handlers/
│       ├── QueryHandlers.ts        # file-tree, search, grep, etc.
│       ├── PropertyHandlers.ts     # set/get property
│       ├── InstanceHandlers.ts     # create, delete, duplicate, clone
│       ├── ScriptHandlers.ts       # source read/write, edit, replace
│       ├── MetadataHandlers.ts     # attributes, tags, selection, execute-luau
│       ├── EvalRuntimeHandlers.ts  # eval_server/client_runtime
│       ├── TestHandlers.ts         # playtest, multiplayer, navigation
│       ├── BuildHandlers.ts        # export, import, search materials
│       ├── AssetHandlers.ts        # insert, preview
│       ├── CaptureHandlers.ts      # screenshot (begin/read)
│       ├── InputHandlers.ts        # mouse, keyboard simulation
│       ├── LogHandlers.ts          # get_runtime_logs
│       ├── SerializationHandlers.ts# import/export rbxm
│       ├── MemoryHandlers.ts       # get_memory_breakdown
│       └── SceneAnalysisHandlers.ts# get_scene_analysis
```

### Core Server Structure

```
packages/core/src/
├── index.ts                        # Public API
├── server.ts                       # MCP stdio + Express HTTP
├── http-server.ts                  # Health, status, poll, ready
├── bridge-service.ts               # Multi-instance routing
├── opencloud-client.ts             # Asset search/upload
├── roblox-cookie-client.ts         # Cookie auth
├── jpeg-encoder.ts                 # RGBA→JPEG
├── png-encoder.ts                  # RGBA→PNG
├── proxy-bridge-service.ts         # Proxy mode
├── install-plugin-helpers.ts       # Plugin auto-install
└── tools/
    ├── index.ts                    # Tool dispatch (75 tools)
    ├── definitions.ts              # Tool schemas
    ├── studio-client.ts            # HTTP client wrapper
    └── build-executor.ts           # JS sandbox for builds
```

---

## 2. Project B: weppy-roblox-mcp (Freemium / Pro)

- **License:** AGPL-3.0 + Commercial License
- **Cost:** Free Basic tier, paid Pro tier
- **Repo:** https://github.com/hope1026/weppy-roblox-mcp

### Core Features

| Feature | Basic (Free) | Pro (Paid) |
|---------|-------------|------------|
| MCP tool execution | ✅ | ✅ |
| One-way sync (Studio→Local) | ✅ | ✅ |
| **Bidirectional sync** | ❌ | ✅ |
| **UI Studio** | ❌ | ✅ |
| **Terrain generation** | ❌ | ✅ |
| **Spatial queries** | ❌ | ✅ |
| **Lighting/Atmosphere** | ❌ | ✅ |
| **Audio/Animation/Tween** | ❌ | ✅ |
| **Bulk operations** | ❌ | ✅ |
| **Batch execute** | ❌ | ✅ |
| **Multi-place sync** | ❌ | ✅ |
| **Web dashboard** | ❌ | ✅ |
| **VSCode extension** | ❌ | ✅ |

### Architecture

- **Action-based dispatch** — grouped tools (token efficient)
- **Web dashboard** — local status/history
- **VSCode extension** — WEPPY Roblox Explorer
- **Sync system** — `weppy-project-sync` folders with direction policies
- **Luau plugin** — with Basic/Pro tier checks at runtime
- **Skills** — MCP guide + sync guide for AI agents

### Tool Groups (Actions)

```
query_instances      → Instance browsing, search, properties
mutate_instances     → Create, delete, move, clone
manage_properties    → Set/get, batch, validate
manage_scripts       → Read/write, search, edit
manage_ui            → UI Studio (Pro)
manage_terrain       → Generate, fill, smooth (Pro)
manage_assets        → Search, insert, preview
manage_sync          → One-way (Basic), bidirectional (Pro)
manage_studio        → Playtest, run, stop
workspace_state      → Place info, services, connected instances
manage_open_cloud    → Asset upload (Pro)
manage_lighting      → Time, atmosphere, bloom (Pro)
manage_audio         → Sound playback (Pro)
manage_animation     → Animation + tween (Pro)
spatial_query        → Raycast, ground, bounds (Pro)
```

### Plugin Structure

```
plugins/weppy-roblox-mcp/
├── .mcp.json
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
└── skills/
    ├── weppy-roblox-mcp-guide/
    │   ├── SKILL.md
    │   ├── references/
    │   │   ├── mcp-actions.md
    │   │   ├── ui-studio.md
    │   │   └── playtest.md
    │   └── agents/openai.yaml
    └── weppy-roblox-sync-guide/
        ├── SKILL.md
        ├── references/
        │   ├── sync-workflow.md
        │   ├── sync-format.md
        │   ├── roblox-explorer.md
        │   └── conflicts.md
        └── agents/openai.yaml
```

### Key Files

- `weppy-roblox-mcp/README.md` — Overview and setup
- `weppy-roblox-mcp/smithery.yaml` — MCP server configuration
- `weppy-roblox-mcp/glama.json` — Marketplace metadata
- `weppy-roblox-mcp/COMMERCIAL-LICENSE.md` — Pro licensing
- `weppy-roblox-mcp/plugins/weppy-roblox-mcp/.mcp.json` — MCP config
- `weppy-roblox-mcp/plugins/weppy-roblox-mcp/skills/weppy-roblox-mcp-guide/SKILL.md` — AI agent guide
- `weppy-roblox-mcp/plugins/weppy-roblox-mcp/skills/weppy-roblox-mcp-guide/references/mcp-actions.md` — Action reference

---

## 3. Feature Comparison Matrix

| Feature | robloxstudio-mcp | WEPPY Basic | WEPPY Pro | Our Plan |
|---------|-----------------|-------------|-----------|----------|
| **Instance CRUD** | ✅ | ✅ | ✅ | ✅ |
| **Script read/write** | ✅ | ✅ | ✅ | ✅ |
| **Script search (grep)** | ✅ | ✅ | ✅ | ✅ |
| **Asset search** | ✅ | ❌ | ✅ | ✅ |
| **Open Cloud upload** | ✅ | ❌ | ✅ | ✅ |
| **Bidirectional sync** | ❌ | ❌ | ✅ | ✅ |
| **One-way sync** | ❌ | ✅ | ✅ | ✅ |
| **Multi-place sync** | ❌ | ❌ | ✅ | ✅ |
| **Terrain generation** | ❌ | ❌ | ✅ | ✅ |
| **Spatial queries** | ❌ | ❌ | ✅ | ✅ |
| **UI Studio** | ❌ | ❌ | ✅ | ✅ |
| **Lighting/Atmosphere** | ❌ | ❌ | ✅ | ✅ |
| **Audio/Animation/Tween** | ❌ | ❌ | ✅ | ✅ |
| **Batch/Transactions** | ❌ | ❌ | ✅ | ✅ |
| **Web dashboard** | ❌ | ❌ | ✅ | ✅ |
| **VSCode extension** | ❌ | ❌ | ✅ | ✅ |
| **Network simulation** | ✅ | ❌ | ❌ | ✅ |
| **Device simulator** | ✅ | ❌ | ❌ | ✅ |
| **Scene Analysis** | ✅ | ❌ | ❌ | ✅ |
| **Build Library** | ✅ | ❌ | ❌ | ✅ |
| **Procedural builds** | ✅ | ❌ | ❌ | ✅ (Lua-native) |
| **Runtime eval (Game-VM)** | ✅ | ✅ | ✅ | ✅ |
| **Multiplayer (StudioTestService)** | ✅ Deep | ✅ Basic | ✅ Basic | ✅ Deep |
| **Screenshot (edit + play)** | ✅ Full | ✅ Basic | ✅ Basic | ✅ Full |
| **Input simulation** | ✅ Full | ✅ Basic | ✅ Basic | ✅ Full |
| **Memory breakdown** | ✅ | ❌ | ❌ | ✅ |
| **rbxm import/export** | ✅ | ❌ | ❌ | ✅ |
| **Undo/Redo** | ✅ | ✅ | ✅ | ✅ |
| **Read-only inspector** | ✅ (separate pkg) | ❌ | ❌ | ✅ (mode toggle) |
| **License** | MIT | AGPL | Commercial | MIT |
| **Cost** | Free | Free (Basic) | Paid | Free |
| **Open source** | ✅ | ✅ | ❌ | ✅ |

---

## 4. What robloxstudio-mcp Does Better

1. **Deep runtime debugging** — Game-VM eval bridges, network simulation, device simulator matrix
2. **Build library** — Procedural generation with JS sandbox primitives
3. **Scene Analysis** — Memory, triangles, unparented instances, audio, animation
4. **Inspector variant** — Read-only package for safer sessions
5. **Battle-tested** — 2+ years, 75 tools, robust error handling
6. **Multiplayer** — Full StudioTestService control (add/remove/leave clients)

## 5. What WEPPY Does Better

1. **Sync** — Bidirectional Studio ↔ Local files (Pro only)
2. **Token efficiency** — Grouped actions instead of 75 flat tools
3. **UI Studio** — Natural-language UI generation + design audit (Pro only)
4. **Terrain** — Generate, fill, smooth (Pro only)
5. **Spatial queries** — Raycast, find ground, bounds (Pro only)
6. **Lighting/Audio/Animation** — Complete world-building tools (Pro only)
7. **Web dashboard** — Local monitoring (Pro only)
8. **VSCode extension** — IDE integration (Pro only)
9. **Skills** — Built-in AI agent guides (`.codex-plugin`, `.claude-plugin`)

## 6. What Neither Has (Our Opportunities)

1. **Transaction batches** — Atomic multi-operation with rollback
2. **Conflict resolution** — Three-way merge for sync conflicts
3. **Plugin auto-update** — Check npm, auto-download, prompt restart
4. **Lua-native build generator** — Replace JS sandbox (security + reliability)
5. **UI pattern library** — Common Roblox UI templates (Inventory, Shop, HUD, etc.)
6. **Smart tool grouping** — 12 actions + 75 aliases (best of both worlds)
7. **Multi-place sync** — Work with multiple places simultaneously
8. **Better error messages** — Structured errors with recovery suggestions

---

## 7. Code Paths (Reference)

### robloxstudio-mcp (Reference Only — Do Not Modify)

- `/home/username/projects/oopsie/robloxstudio-mcp/packages/core/src/tools/definitions.ts` — 75 tool schemas
- `/home/username/projects/oopsie/robloxstudio-mcp/packages/core/src/tools/index.ts` — Tool dispatch
- `/home/username/projects/oopsie/robloxstudio-mcp/packages/core/src/bridge-service.ts` — Multi-instance routing
- `/home/username/projects/oopsie/robloxstudio-mcp/packages/core/src/server.ts` — MCP + Express server
- `/home/username/projects/oopsie/robloxstudio-mcp/studio-plugin/src/modules/Communication.ts` — Plugin HTTP polling
- `/home/username/projects/oopsie/robloxstudio-mcp/studio-plugin/src/modules/EvalBridges.ts` — Game-VM eval
- `/home/username/projects/oopsie/robloxstudio-mcp/studio-plugin/src/modules/ClientBroker.ts` — Client proxy
- `/home/username/projects/oopsie/robloxstudio-mcp/studio-plugin/src/modules/RuntimeLogBuffer.ts` — Log capture

### WEPPY (Reference Only — Do Not Modify)

- `/home/username/projects/oopsie/weppy-roblox-mcp/plugins/weppy-roblox-mcp/skills/weppy-roblox-mcp-guide/SKILL.md` — AI guide
- `/home/username/projects/oopsie/weppy-roblox-mcp/plugins/weppy-roblox-mcp/skills/weppy-roblox-mcp-guide/references/mcp-actions.md` — Actions
- `/home/username/projects/oopsie/weppy-roblox-mcp/plugins/weppy-roblox-mcp/skills/weppy-roblox-sync-guide/SKILL.md` — Sync guide
- `/home/username/projects/oopsie/weppy-roblox-mcp/plugins/weppy-roblox-mcp/skills/weppy-roblox-sync-guide/references/sync-workflow.md` — Sync workflow
- `/home/username/projects/oopsie/weppy-roblox-mcp/plugins/weppy-roblox-mcp/skills/weppy-roblox-sync-guide/references/sync-format.md` — Sync format

---

## 8. Last Updated

Date: 2026-06-15
By: Initial planning session
