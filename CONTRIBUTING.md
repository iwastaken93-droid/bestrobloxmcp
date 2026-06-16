# Contributing to BestRobloxMCP

> Thanks for wanting to help make the best Roblox MCP server even better! This guide covers everything you need to get started.

---

## Quick Start for Contributors

### 1. Clone and Install

```bash
git clone https://github.com/bestrobloxmcp/bestrobloxmcp.git
cd bestrobloxmcp
npm install
```

### 2. Verify Everything Works

```bash
# Run tests
npm test --workspace=packages/core

# Typecheck
npx tsc --noEmit -p packages/core/tsconfig.json
npx tsc --noEmit -p packages/bestrobloxmcp/tsconfig.json

# Build the CLI package
npm run build --workspace=packages/bestrobloxmcp
```

---

## Project Structure

```
bestrobloxmcp/
├── packages/
│   ├── core/                 # MCP server + HTTP server + tool definitions
│   │   ├── src/
│   │   │   ├── tools/        # Tool definitions & dispatch
│   │   │   ├── __tests__/    # Jest tests
│   │   │   ├── server.ts     # MCP stdio + Express server
│   │   │   ├── http-server.ts# HTTP routes (health, status, poll, dashboard)
│   │   │   ├── bridge-service.ts # Multi-instance routing
│   │   │   └── ...
│   │   └── package.json
│   └── bestrobloxmcp/        # CLI package (bundles core with tsup)
│       ├── src/
│       │   ├── index.ts      # CLI entry point
│       │   └── install-plugin.ts
│       └── package.json
├── studio-plugin/            # Roblox Studio plugin (Luau / roblox-ts)
│   ├── src/
│   │   ├── server/index.server.ts  # Plugin entry point
│   │   └── modules/
│   │       ├── Communication.ts    # HTTP polling + request dispatch
│   │       ├── State.ts          # Connection state, version
│   │       ├── UI.ts             # Plugin UI
│   │       ├── Utils.ts          # Path resolution, property conversion
│   │       ├── LuauExec.ts       # Luau execution helpers
│   │       ├── Recording.ts      # ChangeHistoryService wrapper
│   │       ├── EvalBridges.ts    # Game-VM eval bridge scripts
│   │       ├── ClientBroker.ts   # Client→Server proxy
│   │       ├── RuntimeLogBuffer.ts # Log capture ring buffer
│   │       ├── handlers/         # All plugin handlers
│   │       └── ...
│   └── package.json
├── tests/                    # E2E test scripts
├── scripts/                  # Build and publish scripts
├── vscode-extension/         # VSCode extension scaffold
├── references/               # Symlinks to upstream repos (read-only)
│   ├── robloxstudio-mcp/
│   └── weppy-roblox-mcp/
├── README.md
├── GETTING_STARTED.md
├── PLAN.md
├── context.md
├── decisions.md
├── progress.md
└── agents.md
```

---

## How to Add a New Tool

Adding a new tool takes 5 steps. Follow them in order:

### Step 1: Add the Tool Definition

Edit `packages/core/src/tools/definitions.ts`:

```typescript
{
  name: 'my_new_tool',
  category: 'my_category',
  description: 'What this tool does in one sentence.',
  parameters: {
    type: 'object',
    properties: {
      instancePath: {
        type: 'string',
        description: 'Instance path (dot notation)'
      },
      // ... more parameters
    },
    required: ['instancePath']
  }
}
```

**Rules:**
- `description` should be concise — LLMs read these (token budget matters)
- Include `instance_id` parameter for multi-place support
- Use `anyOf` for batch mode (single params OR array params)
- Group tools by `category` for organization

### Step 2: Add the Server Method

Edit `packages/core/src/tools/index.ts`:

```typescript
public async myNewTool(params: any) {
  return this.studioClient.post('/api/my-new-tool', params);
}
```

### Step 3: Add the HTTP Handler

Edit `packages/core/src/http-server.ts`:

```typescript
app.post('/api/my-new-tool', async (req, res) => {
  try {
    const result = await handleMyNewTool(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
```

### Step 4: Add the Plugin Handler

Create or edit `studio-plugin/src/modules/handlers/MyNewHandlers.ts`:

```typescript
import { Recording } from '../Recording';

export function handleMyNewTool(args: any): any {
  const [success, result] = pcall(() => {
    const instance = resolveInstance(args.instancePath);
    // ... do work
    return { success: true, result };
  });

  if (!success) {
    return { error: result };
  }

  return result;
}
```

**Rules:**
- Wrap all Studio API calls in `pcall()`
- Use `ChangeHistoryService.TryBeginRecording` / `FinishRecording` for mutations
- Return `{ error: string }` on failure, not exceptions

### Step 5: Register the Route

Edit `studio-plugin/src/modules/Communication.ts`:

```typescript
import { handleMyNewTool } from './handlers/MyNewHandlers';

// In the routeMap:
'my_new_tool': handleMyNewTool,
```

### Step 6: Test It

Add a test to `packages/core/src/__tests__/tool-schema.test.ts`:

```typescript
it('should map my_new_tool', () => {
  expect(mappings['my_new_tool']).toBe('myNewTool');
});
```

Run the full test suite:

```bash
npm test --workspace=packages/core
```

---

## Coding Conventions

### TypeScript (Server)

- Use strict TypeScript (`strict: true` in tsconfig)
- Prefer `async/await` over callbacks
- Use `any` only when the value truly can be any type
- Match existing code style — don't invent new patterns
- One runnable check per non-trivial logic (assert, test, or demo)

### Luau (Plugin)

- Wrap all Studio API calls in `pcall()`
- Use `ChangeHistoryService` for all mutations
- Use `typeIs` instead of `typeof` for Luau type checking
- Use `Set` for O(1) membership checks
- Return `{ error: string }` on failure

### General

- **No paywalls** — All features must be free (no tier checks)
- **No new dependencies** unless absolutely necessary
- **Deletion over addition** — Remove dead code before adding new
- **Minimal changes** — Only change what you need to
- **Update docs** — Always update `progress.md`, `context.md`, and `decisions.md`

---

## Testing

### Unit Tests

```bash
npm test --workspace=packages/core
```

Runs 96 tests covering:
- Tool schema validation
- HTTP server routing
- Bridge service routing
- Integration tests

### Manual Testing

```bash
# Start the server with plugin auto-install
npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin

# Open Roblox Studio and click the MCP Server button
# Test your tool from the AI chat
```

### Plugin Build

```bash
# Build the plugin
npm run build --workspace=studio-plugin

# Or use the build script
node scripts/build-plugin.mjs
```

---

## Working with Reference Code

The `references/` directory contains symlinks to upstream repos:

```bash
# Read upstream code for reference
cd references/robloxstudio-mcp
# ... inspect files, but DO NOT modify

cd references/weppy-roblox-mcp
# ... inspect files, but DO NOT modify
```

These are **read-only** — copy patterns and ideas, but don't edit them.

---

## Commit Messages

Use clear, descriptive commits:

```
feat: add manage_batch tool for atomic transactions
fix: resolve instance_id routing in multi-place mode
docs: update GETTING_STARTED with FAQ section
perf: trim verbose tool descriptions in definitions.ts
```

---

## Pull Request Checklist

Before submitting a PR:

- [ ] All 96 tests pass (`npm test --workspace=packages/core`)
- [ ] TypeScript compiles cleanly (`npx tsc --noEmit`)
- [ ] No old-name references (`chrrxs`, `robloxstudio-mcp` in active code)
- [ ] Plugin handlers use `pcall()` and `ChangeHistoryService`
- [ ] Tool definitions include `instance_id` for multi-place
- [ ] `progress.md` updated with what you completed
- [ ] `decisions.md` updated if you made new architectural decisions
- [ ] `context.md` updated if you changed the feature matrix

---

## Getting Help

- Read `agents.md` — How to work on this project
- Read `decisions.md` — Why things were built a certain way
- Read `progress.md` — What's done and what's next
- Read `context.md` — Feature comparison and research
- Open an issue on GitHub for questions

---

## License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

**Happy hacking! 🎮**
