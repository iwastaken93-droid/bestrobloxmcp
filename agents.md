# Agent Instructions — BestRobloxMCP

> **Read this file FIRST** before doing any work on this project.

## Project Overview

BestRobloxMCP is a free, open-source (MIT) MCP server for Roblox Studio that combines the best of:
- **robloxstudio-mcp** (@chrrxs/robloxstudio-mcp, v2.16.1) — battle-tested, 75 tools, MIT license
- **weppy-roblox-mcp** (Pro/commercial) — sync, terrain, UI Studio, lighting, audio, web dashboard

**Goal:** Build the best Roblox MCP server available — all features free, no paywalls, MIT license.

## File Map (Context Package)

| File | Purpose | Read When |
|------|---------|-----------|
| `agents.md` | This file — how to work on the project | Always |
| `context.md` | All research on robloxstudio-mcp vs WEPPY | When you need to understand feature parity |
| `decisions.md` | Architecture decisions made | When you need to know why something was built a certain way |
| `progress.md` | What's done and what's next | When starting a new session |
| `PLAN.md` | Full implementation plan with phases | When planning work |
| `robloxstudio-mcp/` | Forked reference source (not to modify) | When you need to understand original code |
| `weppy-roblox-mcp/` | Reference source (not to modify) | When researching WEPPY features |

## Architecture

- **Fork-based approach:** We fork `robloxstudio-mcp` core, not clean-slate
- **Workspace structure:** `packages/core/`, `packages/bestrobloxmcp/`, `studio-plugin/`, `tests/`
- **License:** MIT
- **Plugin:** Single unified plugin with `safe_mode` toggle (no separate inspector variant)
- **Tools:** 12 grouped actions + 75 individual aliases
- **Sync:** Bidirectional Studio ↔ Local file sync (first-class, free)
- **New features:** Terrain, UI Studio, lighting, audio, animation, web dashboard, VSCode extension

## How to Work on This Project

### When Starting a New Session

1. Read `progress.md` — know what's done
2. Read `decisions.md` — know the architecture constraints
3. Check `PLAN.md` — know the current phase
4. Do the work
5. Update `progress.md` — mark what you completed
6. Update `decisions.md` if you made new architectural decisions

### When Researching a Feature

1. Read `context.md` — see what both existing projects do
2. If you need code details, read from `robloxstudio-mcp/` or `weppy-roblox-mcp/`
3. If the feature is complex, read the relevant files in `studio-plugin/src/modules/handlers/`

### When Adding New Tools

1. Add the tool definition to `packages/core/src/tools/definitions.ts`
2. Add the handler to `packages/core/src/tools/index.ts`
3. Add the plugin endpoint to `studio-plugin/src/modules/Communication.ts` routeMap
4. Add the handler to `studio-plugin/src/modules/handlers/` (new file or existing)
5. Update `context.md` feature matrix
6. Update `progress.md`

### Coding Conventions

- **TypeScript** for server, **Luau** (roblox-ts) for plugin
- Match existing code style in `robloxstudio-mcp/` — don't invent new patterns
- Use `pcall()` for all Studio API calls in Luau
- Use `ChangeHistoryService.TryBeginRecording`/`FinishRecording` for all mutations
- Include `instance_id` parameter on all tool schemas for multi-place support
- Group tool descriptions should be concise — individual tool descriptions can be verbose
- All new features must be **free** (no tier checks, no paywalling)

### Testing

- Run `npm test` in `packages/core/` for unit tests
- Run `npx @chrrxs/robloxstudio-mcp@latest --auto-install-plugin` for manual plugin install
- Use `studio-plugin/INSTALLATION.md` for plugin setup instructions

### What NOT to Do

- Do NOT modify `robloxstudio-mcp/` or `weppy-roblox-mcp/` — those are reference only
- Do NOT paywall any features (no tier checks, no Pro/Basic distinctions)
- Do NOT break the existing BridgeService or plugin polling architecture unless absolutely necessary
- Do NOT remove existing tools without updating the feature matrix in `context.md`
- Do NOT forget to update `progress.md` after completing work

## Project Roots

- This project: `/home/username/projects/oopsie/bestrobloxmcp/`
- Reference: `/home/username/projects/oopsie/robloxstudio-mcp/`
- Reference: `/home/username/projects/oopsie/weppy-roblox-mcp/`

## Current State (as of last update)

See `progress.md` for the current state. The project is in **planning phase** — no code written yet.
