# BestRobloxMCP — Implementation Plan

> **Philosophy:** Fork `robloxstudio-mcp` (battle-tested, MIT-licensed, 75 tools, 2+ years of production use), strip what doesn't serve us, and add what WEPPY Pro does well. Don't rebuild proven wheels. Improve the engine, chassis, and UX.

## 📚 Context Package

Before working on this project, read these files in order:
1. `agents.md` — How to work on this project
2. `context.md` — All research on robloxstudio-mcp vs WEPPY
3. `decisions.md` — Architecture decisions
4. `progress.md` — What's done and what's next
5. `PLAN.md` — This file: the full implementation plan

---

## 1. Architecture Decision: Fork-Based

| Factor | Why Fork |
|--------|----------|
| **BridgeService** | Proven HTTP polling, multi-session routing, role resolution (`edit`/`server`/`client-N`), proxy mode, reconnection logic |
| **Studio Plugin** | Full Luau plugin with UI, polling, heartbeat, version mismatch detection, auto-update checks |
| **ClientBroker** | RemoteFunction-based proxy for client→server routing in playtests |
| **RuntimeLogBuffer** | 64KB ring buffer per peer, deduplication, incremental polling |
| **EvalBridges** | BindableFunction-based Game-VM eval sharing `require` cache |
| **Tool Definitions** | 75 well-scoped tools with JSON schemas, categories, and descriptions |

**What we will NOT rebuild from scratch:** Core HTTP bridge, plugin polling loop, instance routing, property serialization, script editing utilities, asset upload/download, OpenCloud client.

**What we WILL rebuild or heavily modify:** Tool dispatch layer, package structure, plugin build system, and anything that improves token efficiency or UX.

---

## 2. Directory Structure

```
bestrobloxmcp/
├── package.json                    # Root workspace
├── tsconfig.base.json              # Shared TypeScript config
├── LICENSE                         # MIT
├── README.md                       # Modern setup guide
├── scripts/
│   ├── build-plugin.mjs            # Build studio plugin (rbxm/rbxmx)
│   ├── build-server.mjs            # Build MCP server
│   └── install-plugin.mjs          # Auto-install to Studio Plugins folder
├── packages/
│   ├── core/                       # MCP server + HTTP bridge + tools
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts            # Public API exports
│   │       ├── server.ts           # MCP stdio server + Express HTTP
│   │       ├── http-server.ts      # Health, status, /poll, /ready
│   │       ├── bridge-service.ts   # Multi-instance routing (forked)
│   │       ├── opencloud-client.ts # Asset search/upload (forked)
│   │       ├── roblox-cookie-client.ts
│   │       ├── jpeg-encoder.ts     # RGBA→JPEG
│   │       ├── png-encoder.ts      # RGBA→PNG
│   │       ├── proxy-bridge-service.ts
│   │       ├── install-plugin-helpers.ts
│   │       └── tools/
│   │           ├── index.ts        # Tool dispatch (forked + enhanced)
│   │           ├── definitions.ts  # Tool schemas (forked + grouped)
│   │           ├── studio-client.ts
│   │           └── build-executor.ts
│   └── bestrobloxmcp/              # CLI entry point (npx package)
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── src/
│           ├── index.ts            # CLI: start server, auto-install plugin
│           └── install-plugin.ts   # --install-plugin, --auto-install-plugin
├── studio-plugin/
│   ├── package.json
│   ├── tsconfig.json
│   ├── default.project.json
│   ├── dev.project.json
│   └── src/
│       ├── server/index.server.ts  # Plugin entry point
│       ├── types.ts
│       └── modules/
│           ├── Communication.ts    # HTTP polling + request dispatch (forked)
│           ├── State.ts            # Connection state + version
│           ├── UI.ts               # Studio plugin UI (forked + enhanced)
│           ├── Utils.ts
│           ├── LuauExec.ts
│           ├── Recording.ts
│           ├── EvalBridges.ts      # Game-VM eval (forked)
│           ├── ClientBroker.ts     # Client→Server proxy (forked)
│           ├── RuntimeLogBuffer.ts
│           ├── HttpDiagnostics.ts
│           ├── RenderMonitor.ts
│           ├── StopPlayMonitor.ts
│           ├── ServerUrlSettings.ts
│           └── handlers/           # All endpoint handlers (forked)
│               ├── QueryHandlers.ts
│               ├── PropertyHandlers.ts
│               ├── InstanceHandlers.ts
│               ├── ScriptHandlers.ts
│               ├── MetadataHandlers.ts
│               ├── EvalRuntimeHandlers.ts
│               ├── TestHandlers.ts
│               ├── BuildHandlers.ts
│               ├── AssetHandlers.ts
│               ├── CaptureHandlers.ts
│               ├── InputHandlers.ts
│               ├── LogHandlers.ts
│               ├── SerializationHandlers.ts
│               ├── MemoryHandlers.ts
│               ├── SceneAnalysisHandlers.ts
│               └── MultiplayerHandlers.ts  # NEW: extracted from TestHandlers
└── tests/
    ├── lib/mcp-client.mjs
    ├── run-all.mjs
    └── README.md
```

---

## 3. What to Keep (robloxstudio-mcp proven features)

| Feature | Reason |
|---------|--------|
| **BridgeService** | Multi-instance routing, proxy mode, role resolution, reconnection with backoff |
| **Studio Plugin** | Full Luau plugin with HTTP polling, UI tabs, version checks, auto-update |
| **ClientBroker** | RemoteFunction proxy for client peer execution in playtests |
| **EvalBridges** | Game-VM eval sharing `require` cache (critical for debugging) |
| **RuntimeLogBuffer** | 64KB per-peer ring buffers, deduplication, incremental `since` polling |
| **All 75 tools** | Every tool is battle-tested and has real use cases |
| **Script editing** | `edit_script_lines`, `insert_script_lines`, `delete_script_lines`, `find_and_replace_in_scripts` |
| **Build Library** | `generate_build`, `create_build`, `import_build`, `export_build`, `list_library` |
| **Asset tools** | `search_assets`, `insert_asset`, `preview_asset`, `upload_asset`, `get_asset_thumbnail` |
| **Serialization** | `export_rbxm`, `import_rbxm` via SerializationService |
| **Screenshot** | `capture_screenshot`, `capture_begin`, `capture_read` with EditableImage |
| **Input simulation** | `simulate_mouse_input`, `simulate_keyboard_input`, `character_navigation` |
| **Multiplayer** | `multiplayer_test_start`, `multiplayer_test_state`, `multiplayer_test_add_players`, `multiplayer_test_leave_client`, `multiplayer_test_end` |
| **Network simulation** | `set_network_profile`, `get_simulation_state`, `reset_simulation_state` |
| **Device simulator** | `get_device_simulator_state`, `set_device_simulator`, `capture_device_matrix` |
| **Scene Analysis** | `get_scene_analysis`, `get_memory_breakdown` |
| **Read-only inspector** | Separate package for safer review/debugging |

---

## 4. What to Remove (dead weight / unused)

| Feature | Why Remove | Status |
|---------|-----------|--------|
| ~~Inspector variant (35 tools)~~ | ~~Instead of a separate 35-tool inspector, use a **mode flag** (`safe_mode: true`) on the same tools.~~ | ✅ **Done in Phase 1** — unified into single plugin with `--safe-mode` CLI flag |
| ~~Redundant mass-operation tools~~ | ~~`mass_create_objects`, `mass_duplicate`, `mass_set_property`, `mass_get_property` — merge into `create_objects`, `duplicate`, `set_property` with batch arrays.~~ | ✅ **Done in Phase 2** — batch support merged into base tools, `mass_*` definitions removed |
| ~~Back-compat aliases~~ | ~~`/api/mass-create-objects-with-properties` → remove, only keep `/api/mass-create-objects`.~~ | ✅ **Done in Phase 2** — alias removed from `Communication.ts` routeMap |
| ~~Legacy eval bridge cleanup~~ | ~~`cleanupLegacyEditBridges` from pre-v2.7 — remove after 3+ versions.~~ | ✅ **Done in Phase 2** — removed from `EvalBridges.ts`, `Communication.ts`, `index.server.ts` |
| **Separate `build-executor` JS sandbox** | The JS sandbox for procedural generation is cool but fragile. Replace with a **Lua-native build generator** in the plugin (more reliable, no vm2 security issues). | Not started |

---

## 5. What to Add (from WEPPY Pro + new ideas)

### 5.1 Bidirectional Sync (WEPPY Pro killer feature)

```
manage_sync
├── sync_status          → Show sync state (Studio ↔ Local)
├── sync_pull            → Studio → Local (one-way)
├── sync_push            → Local → Studio (one-way)
├── sync_bidirectional   → Auto-sync both directions
├── sync_resolve         → Conflict resolution (last-modified wins, or manual)
└── sync_history         → Show recent sync operations
```

**Implementation:**
- Watch local filesystem (chokidar) for changes
- Watch Studio via periodic `get_file_tree` + `get_script_source` hashes
- Compare SHA-256 hashes, sync only changed files
- Map local folder structure to `place_<id>` folders (like WEPPY)
- Support `.rbxm`/`.rbxmx` round-trip via SerializationService

### 5.2 Terrain Tools (WEPPY Pro)

```
manage_terrain
├── generate(heightmap, noise, fill, smooth)
├── fill_region(x1,y1,z1, x2,y2,z2, material)
├── smooth_region(x1,y1,z1, x2,y2,z2)
├── read_region(x1,y1,z1, x2,y2,z2)
└── replace_material(old, new, region)
```

### 5.3 Spatial Queries (WEPPY Pro)

```
spatial_query
├── raycast(origin, direction, maxDistance)
├── find_ground(position)
├── check_placement(position, size)
├── bounds_of(instancePath)
└── nearest_of_class(position, className, maxDistance)
```

### 5.4 UI Studio Tools (WEPPY Pro)

```
manage_ui
├── design_brief(description)   → Generate UI tree from natural language
├── create_tree(spec)            → Build UI instances from JSON spec
├── preview(instancePath)        → Screenshot of UI element
├── design_check(instancePath)   → Accessibility/contrast/layout audit
└── list_ui_patterns             → List available UI templates
```

### 5.5 Lighting & Atmosphere

```
manage_lighting
├── set_time_of_day(hour)
├── set_atmosphere(density, offset, color, haze)
├── set_bloom(intensity, size, threshold)
├── set_color_correction(tint, contrast, saturation)
└── reset_lighting
```

### 5.6 Audio & Animation

```
manage_audio
├── play_sound(assetId, volume, loop, pitch)
├── stop_sound(instancePath)
├── list_sounds(parentPath)
└── set_ambience(assetId)

manage_animation
├── play_animation(assetId, instancePath)
├── stop_animation(instancePath)
├── list_animations(parentPath)
└── tween(instancePath, property, target, duration, easing)
```

### 5.7 Batch / Transaction Tools

```
manage_batch
├── execute(actions[])          → Atomic batch of operations
├── preview(actions[])          → Dry-run batch
├── rollback(transactionId)     → Undo last batch
└── list_transactions           → Show recent batch ops
```

**Implementation:** Wrap multiple operations in `ChangeHistoryService.TryBeginRecording`/`FinishRecording` as a single transaction.

### 5.8 Smart Tool Grouping (Token Efficiency)

WEPPY's action-based dispatch reduces tool count by grouping. We'll adopt this selectively:

```
# Instead of 75 flat tools, group into 12 high-level actions:
query_instances     → get_file_tree, search_files, get_instance_properties, get_descendants, etc.
mutate_instances    → create_object, delete_object, clone_object, smart_duplicate
manage_properties   → set_property, mass_set_property, set_properties
manage_scripts      → get_script_source, set_script_source, edit_script_lines, grep_scripts
manage_ui           → UI Studio tools (Pro)
manage_terrain      → Terrain tools (Pro)
manage_assets       → search_assets, insert_asset, preview_asset, upload_asset
manage_playtest     → start_playtest, stop_playtest, multiplayer_test_start, etc.
manage_sync         → Sync tools (Pro)
manage_builds       → generate_build, import_build, export_build
manage_diagnostics  → get_memory_breakdown, get_scene_analysis, get_runtime_logs
workspace_state     → get_place_info, get_services, get_connected_instances
```

**Backward compat:** Keep all 75 individual tools as aliases. The grouped actions are the primary interface; individual tools are secondary.

### 5.9 Web Dashboard (WEPPY feature)

A lightweight optional web dashboard (Express route `/dashboard`) showing:
- Connected instances (live status)
- Recent tool calls + logs
- Sync status
- Memory/performance charts
- Screenshot gallery

### 5.10 VSCode Extension (WEPPY feature)

A companion VSCode extension (`bestrobloxmcp-vscode`) that:
- Shows live Studio instance tree in the sidebar
- One-click sync push/pull
- Inline script editing with auto-save
- Screenshot preview panel

---

## 6. Key Improvements Over Both Projects

| Improvement | Description |
|-------------|-------------|
| **Unified Plugin** | One plugin with runtime mode toggle (`safe`/`full`) instead of two separate plugins. |
| **Token-Efficient Actions** | 12 grouped actions + 75 individual aliases. Best of both worlds. |
| **Bidirectional Sync** | First-class sync for free (not paywalled). |
| **Lua-Native Builds** | Replace JS sandbox with Luau build generator (more secure, faster). |
| **Web Dashboard** | Optional local dashboard for monitoring. |
| **VSCode Extension** | IDE integration for power users. |
| **Transaction Batches** | Atomic multi-operation undo support. |
| **Better Error Messages** | Structured errors with recovery suggestions, not just `error: string`. |
| **Plugin Auto-Update** | Check npm for updates, auto-download and prompt to restart Studio. |
| **Multi-Place Sync** | `place_<id>` folders for working with multiple places simultaneously. |
| **Conflict Resolution** | Three-way merge for sync conflicts. |
| **Terrain + Lighting** | World-building tools that WEPPY paywalls. |
| **Audio/Animation/Tween** | Complete game object lifecycle tools. |
| **UI Studio** | Natural-language UI generation + design audit. |

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1) ✅ COMPLETE
1. ~~Fork `robloxstudio-mcp` core into `packages/core/`~~ ✅ Done
2. ~~Fork studio plugin into `studio-plugin/`~~ ✅ Done
3. ~~Set up workspace (`package.json`, `tsconfig`, build scripts)~~ ✅ Done
4. ~~Verify basic connectivity: `npx bestrobloxmcp` → plugin connects~~ ✅ Build and tests pass
5. ~~Run existing tests, fix any issues~~ ✅ 96 tests pass

### Phase 2: Consolidation (Week 2) ✅ COMPLETE
1. ~~Merge inspector variant into single plugin with `safe_mode` toggle~~ ✅ Done in Phase 1
2. ~~Remove dead code (back-compat aliases, legacy cleanup)~~ ✅ Done
3. ~~Refactor tool definitions into grouped actions + individual aliases~~ ✅ Done (batch merged into base tools)
4. ~~Add `manage_batch` transaction support~~ ✅ Done
5. ~~Improve error messages with structured `ErrorCode` enum~~ ✅ Done

### Phase 3: New Tools (Week 3-4) ✅ COMPLETE
1. ~~`manage_sync` — bidirectional sync (filesystem ↔ Studio)~~ ✅ Done (server-side placeholder)
2. ~~`manage_terrain` — terrain generation + editing~~ ✅ Done (generate, fill, smooth, read, replace_material)
3. ~~`spatial_query` — raycast, find_ground, bounds~~ ✅ Done (raycast, find_ground, check_placement, bounds, nearest)
4. ~~`manage_lighting` — time, atmosphere, bloom, color correction~~ ✅ Done (set_time, set_atmosphere, set_bloom, set_color_correction, get_settings)
5. ~~`manage_audio` — sound playback + management~~ ✅ Done (play_sound, stop_sound, list_sounds, set_ambience)
6. ~~`manage_animation` — animation + tween tools~~ ✅ Done (play, stop, list, tween)

### Phase 4: UI Studio (Week 5)
1. `manage_ui` — design_brief, create_tree, preview, design_check
2. UI pattern library (common Roblox UI templates)
3. Screenshot preview for UI elements

### Phase 5: Polish (Week 6)
1. Web dashboard (`/dashboard`)
2. VSCode extension scaffold
3. Plugin auto-update mechanism
4. Documentation + README
5. Performance optimization (reduce tool definitions payload for LLM)

---

## 8. License

**MIT License** — same as `robloxstudio-mcp`. Free for everyone, commercial use allowed, attribution required.

---

## 9. Next Steps

**Phase 1 is complete.** The recommended order:
1. ✅ **Phase 1** — Fork the core and verify it works (DONE)
2. **Phase 2** — Consolidate and clean up (NEXT)
3. **Phase 3** — Add the big new features (sync, terrain, lighting)

Tell me which phase to start with, or if you want to jump to a specific feature.
