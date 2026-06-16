# Changelog — BestRobloxMCP

> All notable changes to this project. Organized by release.

---

## v1.0.0 — All Phases Complete

**Date:** 2026-06-16
**Status:** Ready for release

### Phase 1: Foundation

- Forked `robloxstudio-mcp` core into `packages/core/`
- Forked studio plugin into `studio-plugin/`
- Set up workspace structure with `package.json`, `tsconfig.base.json`, build scripts
- Rebranded all package names from `@chrrxs/robloxstudio-mcp-core` to `@bestrobloxmcp/core`
- Unified inspector + main plugin into single plugin with `--safe-mode` CLI flag
- Updated all test files to reference new package names
- All 96 tests passing, TypeScript compiles cleanly

### Phase 2: Consolidation

- Removed dead code: `cleanupLegacyEditBridges` (pre-v2.7 legacy), back-compat alias `/api/mass-create-objects-with-properties`
- Merged batch support into base tools: `get_instance_properties`, `set_property`, `create_object`, `smart_duplicate`
- Removed `mass_*` tools (`mass_create_objects`, `mass_duplicate`, `mass_set_property`, `mass_get_property`)
- Added `manage_batch` transaction support with `continueOnError` flag and ChangeHistoryService rollback
- Added structured error types: `RoutingFailure` and `StudioToolFailure` with `BatchErrorCode`
- All 96 tests passing

### Phase 3: New Tools

- **`manage_terrain`** — Fill region, smooth, read voxels, replace material, generate terrain from perlin noise
- **`spatial_query`** — Raycast, find ground, check placement, get bounds, find nearest instance
- **`manage_lighting`** — Set time of day, atmosphere, bloom, color correction, reset defaults
- **`manage_audio`** — Play sound, stop sound, list sounds, set ambient background
- **`manage_animation`** — Play animation, stop, list animations, tween properties
- **`manage_sync`** — Pull (Studio→Local), push (Local→Studio), bidirectional sync, resolve conflicts
- All 96 tests passing

### Phase 4: UI Studio

- **`manage_ui`** — Create UI tree, update properties, delete, list, get tree, preview, check
- `UIHandlers.ts` plugin handler with full UI tree creation, property editing, and validation
- `getUIProperties` correctly handles Vector2, UDim, UDim2, Color3, NumberRange via `typeIs`
- `UI_CLASSES` uses `Set` for O(1) membership checks
- All 96 tests passing

### Phase 5: Polish

- **Web dashboard** (`/dashboard`) — Inline HTML dashboard showing server status, connected instances, uptime
- **VSCode extension scaffold** — `vscode-extension/` with package.json, tsconfig, extension.ts
- **Plugin auto-update** — `checkForUpdates` queries `registry.npmjs.org/@bestrobloxmcp/bestrobloxmcp/latest`
- **README update** — Modern setup guide with quick start, configuration, and CLI flags
- **Performance optimization** — Trimmed 6 verbose tool descriptions (`generate_build`, `set_network_profile`, `get_runtime_logs`, `capture_screenshot`, `get_memory_breakdown`, `get_scene_analysis`)
- **Brand consistency** — Updated all log prefixes from `[robloxstudio-mcp]` to `[bestrobloxmcp]`
- **Version mismatch fix** — Warning now references `@bestrobloxmcp/bestrobloxmcp@latest`
- All 96 tests passing

---

## Pre-v1.0 (Upstream)

Based on `robloxstudio-mcp` v2.16.1 (MIT) and `weppy-roblox-mcp` (AGPL + Commercial).

---

## How to Read This Changelog

- **Phase headings** = major development milestones
- **Tool names** = new MCP tools available to AI assistants
- **All 96 tests passing** = verification that nothing broke

---

**Last Updated:** 2026-06-16
