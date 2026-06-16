# 🚀 Getting Started with BestRobloxMCP

> The complete beginner's guide to controlling Roblox Studio with AI.

---

## What is BestRobloxMCP?

BestRobloxMCP lets you **control Roblox Studio using plain English**. Instead of clicking through menus, you type commands like:

- *"Create a red button in StarterGui that says 'Start Game'"*
- *"Find all scripts that reference 'PlayerData'"*
- *"Start a playtest and tell me what the server logs say"*
- *"Generate a mountain terrain with snow on top"*

It works with AI assistants like **Claude Code**, **Cursor**, **Codex CLI**, or **Claude Desktop**.

---

## Prerequisites

| Requirement | Why you need it |
|-------------|---------------|
| **Roblox Studio** installed | The MCP connects to your Studio instance |
| **Node.js 18+** installed | The MCP server runs on Node.js (`node --version` to check) |
| **An AI assistant** (Claude, Cursor, Codex, etc.) | You need an AI that can use MCP servers |
| **(Optional)** `ROBLOX_OPEN_CLOUD_API_KEY` | For searching the Creator Store and uploading assets |

---

## Step 1: Install the MCP Server

Pick your AI assistant:

### Claude Code (Recommended)

```bash
# Install the MCP server
claude mcp add bestrobloxmcp -- npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin
```

### Codex CLI

```bash
codex mcp add bestrobloxmcp -- npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin
```

### Cursor

Open **Cursor Settings** → **MCP** → **Add New MCP Server**:
- **Name:** `bestrobloxmcp`
- **Type:** `command`
- **Command:** `npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin`

### Claude Desktop (or any other MCP client)

Add this to your `claude_desktop_config.json` (or your client's MCP config):

```json
{
  "mcpServers": {
    "bestrobloxmcp": {
      "command": "npx",
      "args": ["-y", "@bestrobloxmcp/bestrobloxmcp@latest", "--auto-install-plugin"]
    }
  }
}
```

> **Windows users:** If you hit issues, use `cmd` as the command:
> ```json
> {
>   "mcpServers": {
>     "bestrobloxmcp": {
>       "command": "cmd",
>       "args": ["/c", "npx", "-y", "@bestrobloxmcp/bestrobloxmcp@latest", "--auto-install-plugin"]
>     }
>   }
> }
> ```

---

## Step 2: Install the Roblox Studio Plugin

The `--auto-install-plugin` flag handles this automatically, but if it doesn't work, here's how to do it manually:

### Method A: Automatic (via CLI)

```bash
npx -y @bestrobloxmcp/bestrobloxmcp@latest --install-plugin
```

This downloads the plugin and puts it in your Studio's Plugins folder.

### Method B: Manual Download

1. Download `MCPPlugin.rbxmx` from the [latest GitHub release](https://github.com/bestrobloxmcp/bestrobloxmcp/releases/latest)
2. Copy it to your Studio Plugins folder:
   - **Windows:** `%LOCALAPPDATA%/Roblox/Plugins/`
   - **macOS:** `~/Documents/Roblox/Plugins/`
3. Restart Roblox Studio

### Method C: Via Studio's Plugins Folder

1. In Roblox Studio, go to **Plugins** → **Plugins Folder**
2. Drag the downloaded `.rbxmx` file into the folder that opens
3. Restart Studio

---

## Step 3: Enable HTTP Requests in Studio

This is **required** — the plugin talks to the MCP server over HTTP.

1. In Roblox Studio, go to **File** → **Game Settings**
2. Click **Security** on the left
3. Check **"Allow HTTP Requests"**
4. Save and close

---

## Step 4: Connect and Test

1. **Open Roblox Studio** with any place
2. **Start your AI assistant** (Claude, Cursor, etc.) — this starts the MCP server automatically
3. In Studio, click the **"MCP Server"** button in the Plugins toolbar
   - You should see a green status = **Connected**
   - If you see red, click the button to activate it

4. **Test it** — ask your AI:
   > *"Show me the file tree of my current place"*

   The AI should call a tool and return something like:
   ```
   📁 Workspace
     📁 Terrain
     📁 Camera
     📁 Part
   📁 StarterGui
     📁 ScreenGui
   📁 ServerScriptService
     📁 Script
   ```

---

## What Can You Do?

### 🗂️ Explore Your Game

| Ask your AI... | What it does |
|---------------|--------------|
| *"Show me the file tree"* | Lists all instances in your place |
| *"Find all scripts that mention 'Leaderstats'"* | Searches every script for text |
| *"What services are available?"* | Lists Roblox services (Workspace, Lighting, etc.) |
| *"Get the properties of the player spawn"* | Reads properties of any object |
| *"Find all parts named 'Checkpoint'"* | Searches by name, class, or property |

### ✏️ Edit Scripts

| Ask your AI... | What it does |
|---------------|--------------|
| *"Show me the code in ServerScriptService/MyScript"* | Reads script source |
| *"Add a print statement at line 10"* | Inserts code at a specific line |
| *"Delete lines 20-25"* | Removes lines |
| *"Replace 'oldVar' with 'newVar' everywhere"* | Find/replace across all scripts |
| *"Fix the error on line 15"* | Edits a specific line |

### 🧱 Build Stuff

| Ask your AI... | What it does |
|---------------|--------------|
| *"Create a 10x10 floor at y=0"* | Builds a floor |
| *"Make a room with walls and a roof"* | Procedurally generates a room |
| *"Generate a staircase from (0,0,0) to (0,10,20)"* | Builds stairs |
| *"Create a forest with 20 trees"* | Procedural generation |
| *"Import the .rbxm file from my Desktop"* | Imports a model file |

### 🎮 Playtest & Debug

| Ask your AI... | What it does |
|---------------|--------------|
| *"Start a playtest"* | Runs your game in Play mode |
| *"Stop the playtest"* | Stops the current playtest |
| *"What are the server logs saying?"* | Captures runtime output |
| *"Simulate a client with 200ms ping"* | Tests network lag |
| *"Add 2 more client players"* | Multiplayer testing |
| *"Show me a screenshot"* | Captures the viewport |

### 🧑‍🎨 UI Design

| Ask your AI... | What it does |
|---------------|--------------|
| *"Create a health bar UI"* | Builds a ScreenGui with health bar |
| *"Make a title screen with a Start button"* | Creates a full menu |
| *"List all UI elements in StarterGui"* | Shows all UI objects |
| *"Update the button to be green and 50px wide"* | Edits UI properties |
| *"Check my UI for Roblox best practices"* | Validates UI hierarchy |

### 🌍 Terrain & World

| Ask your AI... | What it does |
|---------------|--------------|
| *"Generate a flat terrain with grass"* | Fills terrain region |
| *"Create a mountain range with snow on top"* | Procedural terrain using noise |
| *"Smooth the terrain around (100, 50, 100)"* | Smooths terrain |
| *"Replace all sand with water in this area"* | Material replacement |

### 💡 Lighting & Atmosphere

| Ask your AI... | What it does |
|---------------|--------------|
| *"Set the time to sunset"* | Changes TimeOfDay |
| *"Make the atmosphere foggy"* | Adjusts Atmosphere |
| *"Add a bloom effect"* | Adds post-processing |
| *"Make the scene dark and moody"* | Color correction |

### 🔊 Audio & Animation

| Ask your AI... | What it does |
|---------------|--------------|
| *"Play a sound when the button is clicked"* | Sound playback |
| *"List all sound effects in the place"* | Finds Sound objects |
| *"Play the 'Dance' animation on the player"* | Animation playback |
| *"Tween the door to open over 2 seconds"* | Smooth animation |

### 🔍 Scene Analysis

| Ask your AI... | What it does |
|---------------|--------------|
| *"How much memory is the server using?"* | Per-peer memory stats |
| *"Show me any unparented instances"* | Finds orphaned objects |
| *"Count the total triangles in the scene"* | Mesh triangle count |
| *"Analyze the scene for performance issues"* | Full scene report |

### 💾 Asset Management

| Ask your AI... | What it does |
|---------------|--------------|
| *"Search the Creator Store for 'sword mesh'"* | Finds assets |
| *"Insert asset ID 123456 into Workspace"* | Places an asset |
| *"Upload this model to my inventory"* | Uploads to Roblox |
| *"Show me a thumbnail of asset 123456"* | Gets asset preview |

### 🔄 Sync (Keep Studio and Files in Sync)

| Ask your AI... | What it does |
|---------------|--------------|
| *"Export my scripts to the local project folder"* | One-way sync |
| *"Sync the local files back to Studio"* | Bidirectional sync |

---

## Full Tools Reference

All 75+ tools available to your AI. You don't need to memorize these — just ask your AI what you want, and it picks the right tool.

### 🗂️ Exploration & Query

| Tool | What it does |
|------|--------------|
| `get_file_tree` | Get instance hierarchy tree from Studio |
| `get_project_structure` | Get full game hierarchy tree (adjustable depth) |
| `search_files` | Search instances by name, class, or script content |
| `search_objects` | Find instances by name, class, or properties |
| `search_by_property` | Find objects with specific property values |
| `get_instance_children` | Get children and their class types |
| `get_descendants` | Get all descendants recursively with depth info |
| `get_place_info` | Get place ID, name, and game settings |
| `get_services` | Get available services and their children |
| `get_class_info` | Get properties/methods for a Roblox class |
| `get_selection` | Get all currently selected objects |
| `get_connected_instances` | List all connected plugin instances with roles |

### 🧱 Instances & Properties

| Tool | What it does |
|------|--------------|
| `create_object` | Create a new instance (single or batch) |
| `delete_object` | Delete an instance |
| `clone_object` | Deep clone an instance to a new parent |
| `smart_duplicate` | Duplicate with naming, positioning, and property variations |
| `compare_instances` | Diff two instances by comparing their properties |
| `set_property` | Set a property on one or multiple instances |
| `get_instance_properties` | Get all properties of an instance, or a specific property from many |
| `set_properties` | Set multiple properties on a single instance in one call |
| `set_attribute` | Set an attribute (supports Vector3, Color3, UDim2, BrickColor) |
| `get_attributes` | Get all attributes on an instance |
| `delete_attribute` | Delete an attribute |
| `bulk_set_attributes` | Set multiple attributes on an instance in one call |
| `get_tags` | Get all tags on an instance |
| `add_tag` | Add a tag to an instance |
| `remove_tag` | Remove a tag from an instance |
| `get_tagged` | Get all instances with a specific tag |

### ✏️ Scripts

| Tool | What it does |
|------|--------------|
| `get_script_source` | Read the full source of a script |
| `set_script_source` | Replace entire script source |
| `edit_script_lines` | Replace exact text at a specific line |
| `insert_script_lines` | Insert lines after a given line number |
| `delete_script_lines` | Delete a range of lines |
| `grep_scripts` | Search across all script sources with regex/patterns |
| `find_and_replace_in_scripts` | Find and replace text across all scripts (supports dry-run preview) |

### 🎮 Playtest & Runtime

| Tool | What it does |
|------|--------------|
| `start_playtest` | Start a single-player playtest (play or run mode) |
| `stop_playtest` | Stop the playtest and return captured output |
| `get_playtest_output` | Poll output buffer without stopping |
| `get_output_log` | Get the Studio Output window history |
| `execute_luau` | Execute Luau code in plugin context (edit/server/client) |
| `eval_server_runtime` | Execute Luau on the server peer in the running game |
| `eval_client_runtime` | Execute Luau on a client peer in the running game |
| `get_runtime_logs` | Read in-memory log buffers from Studio plugin peers |
| `set_network_profile` | Simulate network conditions (latency, jitter, packet loss) |
| `get_simulation_state` | Inspect current NetworkSettings and DeviceSimulator state |
| `reset_simulation_state` | Reset simulation state to a clean baseline |

### 👥 Multiplayer Testing

| Tool | What it does |
|------|--------------|
| `multiplayer_test_start` | Start a multiplayer test with server + clients |
| `multiplayer_test_state` | Get the active multiplayer test state |
| `multiplayer_test_add_players` | Add more client players to a running test |
| `multiplayer_test_leave_client` | Disconnect a specific client from the test |
| `multiplayer_test_end` | End the multiplayer test and clean up |

### 📱 Device Simulator

| Tool | What it does |
|------|--------------|
| `get_device_simulator_state` | Inspect supported device presets and current state |
| `set_device_simulator` | Apply a built-in device preset (iPhone, iPad, Pixel, etc.) |
| `capture_device_matrix` | Capture screenshots across up to 6 device presets at once |

### 🧱 Build & Generation

| Tool | What it does |
|------|--------------|
| `create_build` | Create a build model from scratch and save to library |
| `generate_build` | Procedurally generate a build via JS/Lua code with primitives |
| `get_build` | Retrieve a build from the library by ID |
| `import_build` | Import a build into Studio (by object or library ID) |
| `import_scene` | Import a full scene layout with multiple models |
| `export_build` | Export a Model/Folder to a compact JSON build format |
| `list_library` | List available builds in the local library |
| `search_materials` | Search MaterialService for custom materials |
| `export_rbxm` | Serialize instances to a `.rbxm` file on disk |
| `import_rbxm` | Deserialize a `.rbxm` file and parent into Studio |
| `undo` | Undo the last Studio change |
| `redo` | Redo the last undone change |

### 🎨 Assets & Marketplace

| Tool | What it does |
|------|--------------|
| `search_assets` | Search the Creator Store by type and keywords |
| `get_asset_details` | Get detailed metadata for a specific asset |
| `get_asset_thumbnail` | Get asset thumbnail as base64 PNG |
| `insert_asset` | Insert a Roblox asset into Studio |
| `preview_asset` | Preview an asset without inserting it (inspect then destroy) |
| `upload_asset` | Upload Audio, Decal, Model, Animation, or Video to Roblox |

### 📸 Capture & Input

| Tool | What it does |
|------|--------------|
| `capture_screenshot` | Capture the Studio viewport at native resolution |
| `simulate_mouse_input` | Simulate a mouse click during a playtest |
| `simulate_keyboard_input` | Simulate keyboard input (WASD, Space, etc.) |
| `character_navigation` | Move the player character to a target position via pathfinding |

### 🔍 Diagnostics

| Tool | What it does |
|------|--------------|
| `get_memory_breakdown` | Read per-category memory usage by DeveloperMemoryTag |
| `get_scene_analysis` | Read SceneAnalysisService data (triangles, instances, performance) |

### 🌍 Terrain

| Tool | What it does |
|------|--------------|
| `manage_terrain` | Fill region, smooth, read voxels, replace material, generate from noise |

### 🧭 Spatial Queries

| Tool | What it does |
|------|--------------|
| `spatial_query` | Raycast, find ground, check placement, get bounds, find nearest |

### 💡 Lighting

| Tool | What it does |
|------|--------------|
| `manage_lighting` | Set time of day, atmosphere, bloom, color correction, reset defaults |

### 🔊 Audio

| Tool | What it does |
|------|--------------|
| `manage_audio` | Play sound, stop sound, list sounds, set ambient background |

### 🎬 Animation

| Tool | What it does |
|------|--------------|
| `manage_animation` | Play animation, stop, list animations, tween properties |

### 🖥️ UI Studio

| Tool | What it does |
|------|--------------|
| `manage_ui` | Create UI tree, update properties, delete, list, get tree, preview, check |

### 🔄 Sync

| Tool | What it does |
|------|--------------|
| `manage_sync` | Pull (Studio→Local), push (Local→Studio), bidirectional sync, resolve conflicts |

### ⚡ Batch Operations

| Tool | What it does |
|------|--------------|
| `manage_batch` | Execute multiple tool operations in a single atomic batch |

---

## Common Workflows

### Workflow 1: Start a New Project

1. Create a new place in Roblox Studio
2. Ask your AI: *"Create the basic folder structure: a Terrain folder in Workspace, a ScreenGui in StarterGui, and a Main script in ServerScriptService"*
3. Ask: *"Generate a flat terrain with grass material"*
4. Ask: *"Create a basic spawn location at (0, 10, 0)"*
5. Save the place

### Workflow 2: Debug a Script

1. Ask: *"Show me the code in ServerScriptService/CurrencySystem"*
2. Ask: *"Find all scripts that reference 'Currency'"*
3. Ask: *"Start a playtest and capture the server logs"*
4. Ask: *"Stop the playtest"*
5. Ask: *"Fix the nil error on line 23 by adding a null check"*

### Workflow 3: Build a UI

1. Ask: *"Create a title screen in StarterGui with a title label and a Start button"*
2. Ask: *"Make the title bold and yellow, and the button green with white text"*
3. Ask: *"Add a tween so the button pulses when hovered"*
4. Ask: *"Check the UI for any issues"*
5. Ask: *"Take a screenshot so I can see how it looks"*

### Workflow 4: Test Multiplayer

1. Ask: *"Start a playtest"*
2. Ask: *"Add 2 client players"*
3. Ask: *"Set client-1 to have 300ms latency and 0.5% packet loss"*
4. Ask: *"Get the simulation state for all peers"*
5. Ask: *"End the multiplayer test"*

### Workflow 5: Analyze Performance

1. Ask: *"Get the memory breakdown for the server"*
2. Ask: *"Get the scene analysis report"*
3. Ask: *"Find all unparented instances"*
4. Ask: *"Count the total triangles in the workspace"*
5. Ask: *"Simulate on a mobile device and take a screenshot"*

---

## Tips & Tricks

### 🎯 Be Specific

- **Good:** *"Create a Part named 'SpawnLocation' at position (0, 10, 0) with size (10, 1, 10) and color (0, 1, 0)"*
- **Bad:** *"Make a spawn thing"*

### 🏷️ Use Paths

Roblox uses dot-notation paths like `Workspace.Terrain`, `StarterGui.ScreenGui`, `ServerScriptService.MainScript`.

### 🔄 Undo is Your Friend

Every change is recorded in Studio's undo history. If something goes wrong, you can ask: *"Undo the last change"*.

### 🖥️ Web Dashboard

Open `http://localhost:58741/dashboard` in your browser while the server is running to see:
- Connected Studio instances
- Server uptime
- Plugin version status

### ⚡ Safe Mode

If you only want the AI to **read** (not modify), start the server with `--safe-mode`:

```bash
npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin --safe-mode
```

---

## Troubleshooting

### "The AI says it can't find any tools"

- Make sure the MCP server is running (check your AI's MCP status)
- Restart your AI assistant — the server starts automatically

### "Plugin shows Disconnected"

- Make sure the MCP server is running
- Click the **"MCP Server"** button in Studio's Plugins toolbar to activate it
- Check that Studio has **"Allow HTTP Requests"** enabled

### "HTTP 403 Forbidden"

- Go to **File** → **Game Settings** → **Security** → **Allow HTTP Requests**
- Make sure the MCP server is running on `localhost:58741`

### "Version mismatch warning"

- The plugin and server versions don't match. This is usually fine, but for best results:
  - Stop the server
  - Restart with `--auto-install-plugin` (updates the plugin)
  - Fully close and reopen Studio

### "The AI made changes I don't like"

- Ask: *"Undo the last change"* — every mutation is tracked
- Or use `--safe-mode` if you only want read-only access

### "Windows Firewall is blocking"

- Allow `localhost:58741` through your firewall
- The server only listens on localhost, so it's safe

---

## Next Steps

- **Explore the tools:** Ask your AI *"What tools are available?"* and it will list all 75+ tools.
- **Read the feature comparison:** See `context.md` for what's possible vs other MCP servers.
- **Check the dashboard:** Open `http://localhost:58741/dashboard` to monitor connections.
- **Try the examples:** Go through the 5 workflows above to get comfortable.

---

## Frequently Asked Questions

### Is this safe? Will it delete my game?

**No.** Every change is recorded in Studio's **undo history** (ChangeHistoryService). If the AI does something you don't like, just say *"Undo the last change"* and it reverses it. You can also run the server in `--safe-mode` if you only want the AI to **read** (inspect, analyze, debug) without making any changes.

### Do I need to know how to code?

**No.** You talk to the AI in plain English. The AI translates your request into the right tool calls. For example, *"Make the sky pink at sunset"* — the AI figures out which tool to call and what parameters to use. You can be as vague or as specific as you want.

### Can I use this with any AI assistant?

Any AI that supports **MCP servers** works. The most popular ones are:
- **Claude Code** (recommended)
- **Claude Desktop**
- **Cursor** (with MCP config)
- **Codex CLI**
- Any other MCP-compatible client

### Why does the plugin say "Disconnected"?

The plugin shows **Disconnected** when the MCP server isn't running. This is normal. Once you start your AI assistant (which starts the server), the plugin turns green. If it stays red:
1. Make sure your AI is running
2. Click the **"MCP Server"** button in Studio's Plugins toolbar
3. Check that **Allow HTTP Requests** is enabled in Game Settings

### Can the AI actually break my place?

The AI can only do what the tools allow — create, delete, move, and edit things in Studio. It **cannot** access your Roblox account, publish your place, or change game settings outside Studio. All network traffic is **localhost only** (your machine, not the internet). If something goes wrong, use **undo**.

### How do I stop the AI from making changes?

Start the server with `--safe-mode`:
```bash
npx -y @bestrobloxmcp/bestrobloxmcp@latest --auto-install-plugin --safe-mode
```
In safe mode, the AI can only **read** — inspect, search, analyze, screenshot — but never modify.

### Does this work in Team Create?

Yes, but with caveats. The plugin connects to your local Studio instance. If you're in Team Create, the AI can edit the place just like you can. Other team members will see the changes in real time. **Be careful** — the AI's undo history is local to your Studio, so undoing won't affect changes already synced to others.

### Why is the AI slow to respond sometimes?

Every tool call involves a round-trip between your AI → the MCP server → the Studio plugin → back. This takes 1-3 seconds per call. Complex requests that require multiple tools (e.g., *"Build a UI, then take a screenshot, then check for issues"*) will take longer. Patience is key — the AI is doing real work in your Studio.

### Can I use this on existing projects?

**Absolutely.** BestRobloxMCP works with any place — new or old, big or small. It's especially useful for:
- Understanding large, complex projects you didn't build
- Debugging scripts you wrote months ago
- Refactoring old code
- Adding new features without digging through menus

### Is this free forever?

**Yes.** BestRobloxMCP is MIT open source and 100% free. No paywalls, no tiers, no feature limits. The only paid thing you might need is an Open Cloud API key for Creator Store searches and asset uploads (Roblox's requirement, not ours).

### What happens if the AI generates bad code?

The AI can write code into your scripts, but the code is just text — it doesn't automatically run until you playtest. You can review what the AI wrote before testing it. If it's wrong, use **undo** or ask the AI to fix it.

### Can I run this on a server / VPS?

No. The MCP server and the Studio plugin must be on the **same machine** because they communicate over `localhost`. Roblox Studio itself is a desktop app, so it can't run on a server.

---

## Need Help?

- Open an issue on [GitHub](https://github.com/bestrobloxmcp/bestrobloxmcp)
- Check the [README](README.md) for advanced configuration
- Read the [architecture docs](agents.md) if you want to contribute

---

**Happy building! 🎮**
