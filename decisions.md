# Architecture Decisions — BestRobloxMCP

> **Read this before making structural changes.** Each decision includes rationale and constraints. New decisions should be appended with date, author, and rationale.

---

## D1: Fork-Based Approach (Not Clean-Slate)

**Date:** 2026-06-15
**Decision:** Fork `robloxstudio-mcp` core architecture rather than building from scratch.
**Rationale:**
- 2+ years of production use, 75 battle-tested tools
- BridgeService, ClientBroker, EvalBridges, RuntimeLogBuffer are proven
- Rebuilding would lose hard-earned stability and edge-case handling
- WEPPY built from scratch and has fewer deep features (no network sim, no device simulator, no scene analysis)

**Constraints:**
- Must match existing code style (TypeScript server, roblox-ts Luau plugin)
- Must preserve all existing error handling patterns
- Must not break BridgeService routing or plugin polling

---

## D2: MIT License (Not AGPL/Commercial)

**Date:** 2026-06-15
**Decision:** MIT License, 100% free, no paywalls.
**Rationale:**
- User explicitly chose open source MIT
- WEPPY's AGPL + Commercial dual-license creates friction
- Free = maximum adoption, community contributions, ecosystem growth
- No feature tiering simplifies code (no runtime checks for Pro/Basic)

**Constraints:**
- All features must be free — no "Pro" or "Basic" distinctions
- No tier checks in plugin or server
- Package must be published to npm as MIT

---

## D3: Single Unified Plugin (No Inspector Variant)

**Date:** 2026-06-15
**Decision:** One plugin with `safe_mode` toggle instead of separate inspector variant.
**Rationale:**
- robloxstudio-mcp maintains two separate plugins (full + 35-tool inspector) — double maintenance
- WEPPY uses one plugin with tier checks — simpler
- `safe_mode` at runtime is cleaner than two .rbxmx files
- Reduces plugin build complexity and version drift

**Constraints:**
- Plugin must support `safe_mode` toggle in UI or via API
- When `safe_mode=true`, only read/query tools are exposed
- Must preserve all 75 tools when `safe_mode=false`

---

## D4: Grouped Actions + Individual Aliases (Not Flat Tools)

**Date:** 2026-06-15
**Decision:** 12 grouped actions as primary interface + 75 individual tool aliases.
**Rationale:**
- WEPPY's grouped actions are token-efficient (LLM sees ~12 schemas vs 75)
- robloxstudio-mcp's 75 flat tools are precise but bloat context
- Best of both: grouped actions for complex tasks, individual tools for precision
- Backward compatibility: all existing tools work as aliases

**Constraints:**
- Grouped actions must subsume all individual tools (no capability loss)
- Individual tools must remain for backward compat and precision
- Grouped action schemas must be concise (reduce token count)

**The 12 Groups:**
1. `query_instances` — browse, search, inspect, compare
2. `mutate_instances` — create, delete, move, clone, duplicate
3. `manage_properties` — set/get, batch, validate
4. `manage_scripts` — read, write, edit, search, replace
5. `manage_ui` — UI Studio (design, create, preview, audit)
6. `manage_terrain` — generate, fill, smooth, read, replace
7. `manage_assets` — search, insert, preview, upload
8. `manage_playtest` — start, stop, multiplayer, network, device sim
9. `manage_sync` — pull, push, bidirectional, resolve, history
10. `manage_builds` — generate, create, import, export, library
11. `manage_diagnostics` — memory, scene analysis, runtime logs, output
12. `workspace_state` — place info, services, connected instances, undo/redo

---

## D5: Lua-Native Build Generator (Not JS Sandbox)

**Date:** 2026-06-15
**Decision:** Replace `build-executor.ts` JS sandbox with Luau-native build generation in the plugin.
**Rationale:**
- JS sandbox (`vm` package) is a security risk and maintenance burden
- Luau-native is more reliable, faster, and uses the same runtime
- Reduces server dependencies (no `vm` package needed)
- Simplifies debugging — builds run in Studio, not a sandbox

**Constraints:**
- Must support all existing primitives (room, roof, stairs, column, etc.)
- Must preserve existing build JSON format (palette + parts arrays)
- Must maintain backward compatibility with existing build library files

---

## D6: First-Class Sync (Not Optional)

**Date:** 2026-06-15
**Decision:** Bidirectional sync is a core feature, not an add-on.
**Rationale:**
- WEPPY paywalls sync — this is the #1 requested feature by developers
- Sync is essential for any serious workflow (version control, collaboration)
- Making it free differentiates us from WEPPY

**Constraints:**
- Must use `chokidar` for filesystem watching
- Must use SHA-256 hashes for change detection
- Must support `place_<id>` folder structure for multi-place
- Must support direction policies: `forward` (Studio→Local), `reverse` (Local→Studio), `bidirectional`
- Must handle conflict resolution (last-modified wins, or manual)

---

## D7: Web Dashboard + VSCode Extension (Optional)

**Date:** 2026-06-15
**Decision:** Web dashboard and VSCode extension are optional but included.
**Rationale:**
- WEPPY paywalls these — giving them away for free is a major differentiator
- Dashboard is useful for monitoring, not required for core functionality
- VSCode extension is power-user feature, not required for beginners

**Constraints:**
- Dashboard must be optional (don't break if not used)
- VSCode extension is a separate repo/package
- Both must be MIT licensed

---

## D8: Plugin Auto-Update

**Date:** 2026-06-15
**Decision:** Plugin checks npm for updates and prompts to auto-install.
**Rationale:**
- robloxstudio-mcp shows version mismatch warning but requires manual update
- Auto-update reduces friction and ensures compatibility
- WEPPY has no auto-update mechanism

**Constraints:**
- Must check `https://registry.npmjs.org/@bestrobloxmcp/bestrobloxmcp/latest`
- Must download and install matching plugin version
- Must prompt user to restart Studio (can't restart automatically)
- Must respect `MCP_PLUGINS_DIR` env var

---

## D9: No Tier Checks in Plugin

**Date:** 2026-06-15
**Decision:** Plugin does NOT enforce Basic/Pro tier checks.
**Rationale:**
- All features are free — no tier distinction exists
- WEPPY's plugin has runtime tier checks that complicate code
- Removing tier checks simplifies plugin logic

**Constraints:**
- All endpoints are always available
- No `IsPro` or `IsBasic` checks in handlers
- Plugin UI does not show tier status

---

## D10: Error Handling Strategy

**Date:** 2026-06-15
**Decision:** Structured errors with `ErrorCode` enum and recovery suggestions.
**Rationale:**
- robloxstudio-mcp has basic error strings
- WEPPY has action-based guardrails
- Structured errors help the LLM recover from failures

**Constraints:**
- All errors must include `code`, `message`, and optional `suggestion`
- Error codes must be consistent across server and plugin
- Recovery suggestions must be actionable

---

## D11: Phase 1 Implementation (Fork + Rebrand)

**Date:** 2026-06-15
**Decision:** Fork the entire codebase, rebrand, and verify builds/tests before modifying behavior.
**Rationale:**
- Need a working baseline before making structural changes
- Rebranding is tedious but necessary to avoid confusion with upstream
- Tests must pass on the forked code before we add new features
- Single-plugin approach is simpler than maintaining two variants

**Constraints:**
- All package names changed from `@chrrxs/robloxstudio-mcp-core` → `@bestrobloxmcp/core`
- CLI package renamed from `@chrrxs/robloxstudio-mcp` → `@bestrobloxmcp/bestrobloxmcp`
- Inspector variant removed; `--safe-mode` flag provides read-only mode
- All test files updated to reference new package names and paths
- Build and test cycle must pass before proceeding to Phase 2

## D12: Phase 2 Implementation (Consolidation)

**Date:** 2026-06-15
**Decision:** Remove dead code, merge batch operations into base tools, and add structured error types.
**Rationale:**
- `mass_*` tools (mass_create_objects, mass_duplicate, mass_set_property, mass_get_property) were redundant — base tools should accept batch arrays natively
- `cleanupLegacyEditBridges` (pre-v2.7) and back-compat alias `/api/mass-create-objects-with-properties` were dead weight
- `manage_batch` enables atomic multi-operation transactions with optional rollback via ChangeHistoryService
- Structured `RoutingFailure` + `StudioToolFailure` errors give the LLM recoverable data (instance list, error codes) instead of plain strings
- Single plugin with `safe_mode` flag is simpler than maintaining two plugin variants

**Constraints:**
- All batch operations use `anyOf` JSON Schema validation: either single-instance params OR batch array params
- Plugin base handlers (createObject, setProperty, etc.) now handle both single and batch modes
- `manage_batch` rejects image-returning, fanout, and nested batch tools to prevent infinite recursion and oversized responses
- `StudioToolFailure` carries `code`, `message`, and optional `data` for structured error responses
- All 96 tests must pass after consolidation

---

## D13: Phase 3 Implementation (New Tools)

**Date:** 2026-06-15
**Decision:** Add 6 new tools that WEPPY paywalls: terrain, spatial queries, lighting, audio, animation, and sync.
**Rationale:**
- These are the core differentiators that make BestRobloxMCP competitive with WEPPY Pro
- All implemented as free, MIT-licensed features — no paywalls, no tier checks
- Terrain uses perlin noise via `math.noise` and native `ReadVoxels`/`WriteVoxels` APIs
- Spatial queries use `Workspace:Raycast` with proper `RaycastParams` and `Blacklist` filtering
- Lighting uses `Lighting` service properties and post-processing effects (`Atmosphere`, `BloomEffect`, `ColorCorrectionEffect`)
- Audio uses `SoundService` and `Sound` instances with proper lifecycle management
- Animation uses `Animator:LoadAnimation()` (not deprecated `Humanoid:LoadAnimation()`) and `TweenService:Create()`
- Sync is server-side only (file system operations) — plugin returns a placeholder

**Constraints:**
- All plugin handlers use `pcall()` for Studio API calls
- All mutation handlers use `ChangeHistoryService.TryBeginRecording`/`FinishRecording`
- Each new tool follows the existing pattern: tool definition → server method → HTTP handler → plugin handler
- `manage_sync` is intentionally server-side only — the plugin handler is a pass-through placeholder
- All 96 tests pass after adding the new tools

---

## D14: Phase 4 Implementation (UI Studio)

**Date:** 2026-06-16
**Decision:** Add `manage_ui` tool with full UI tree creation, editing, preview, and validation.
**Rationale:**
- UI Studio is a major WEPPY Pro feature that we can offer for free
- Creating UI from JSON tree descriptions is a powerful LLM workflow (describe UI → generate tree → create in Studio)
- `create_tree` creates a full UI hierarchy from a nested JSON spec with `UIHandlers.createUINode` and `setProperties`
- `update` modifies existing UI elements via `resolveInstance` + property assignment
- `delete` removes UI elements with `ChangeHistoryService` undo support
- `list` and `get_tree` enumerate UI elements under a parent with structured property output
- `preview` returns a structured tree + dimensions (actual screenshot deferred to `capture_screenshot`)
- `check` validates UI hierarchy and reports common issues (parentless, visibility, overlapping, TextSize)
- `getUIProperties` uses `typeIs` instead of `typeof === "object"` because `typeof` in Luau returns type names like "Vector2", "UDim", "UDim2", not "object"
- `UI_CLASSES` is a `Set` for O(1) membership checks instead of a dictionary that maps keys to themselves

**Constraints:**
- All plugin handlers use `pcall()` for Studio API calls
- All mutation handlers use `ChangeHistoryService.TryBeginRecording`/`FinishRecording`
- `createUINode` returns `undefined` on error instead of the parent (critical for correct `instancePath`)
- `preview` is a structured preview, not an actual screenshot (use `capture_screenshot` for screenshots)
- `setProperties` uses `instance as any` for generic property assignment — works for all UI properties
- All 96 tests pass after adding `manage_ui`

---

## How to Add New Decisions

```markdown
## D<N>: Title

**Date:** YYYY-MM-DD
**Decision:** One-sentence summary.
**Rationale:**
- Bullet points explaining why
**Constraints:**
- Bullet points of what this decision forces
```

---

## Last Updated

Date: 2026-06-16
Status: Phase 4 complete — 14 decisions recorded, build and tests passing
