```
                                         ██████╗██╗     ██╗
  █████╗ ███████╗ █████╗ ███╗   ██╗ █████╗    ██╔════╝██║     ██║
 ██╔══██╗██╔════╝██╔══██╗████╗  ██║██╔══██╗   ██║     ██║     ██║
 ███████║███████╗███████║██╔██╗ ██║███████║   ██║     ██║     ██║
 ██╔══██║╚════██║██╔══██║██║╚██╗██║██╔══██║   ██║     ██║     ██║
 ██║  ██║███████║██║  ██║██║ ╚████║██║  ██║   ╚██████╗███████╗██║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ╚═════╝╚══════╝╚═╝
                  ⚡ f o r   A I   A g e n t s ⚡
```

<p align="center">
  <strong>The zero-dependency Asana CLI built for AI coding agents.</strong><br>
  Single file. No npm install. Just Node.js 18+ and your token.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="#ai-agent-integration">AI Integration</a> •
  <a href="#configuration">Configuration</a> •
  <a href="https://github.com/hamadrashid/asana-cli/blob/main/LICENSE">License</a>
</p>

---

## What is this?

**Asana CLI for AI** is a lightweight command-line tool that lets AI coding agents (and humans) manage Asana tasks, projects, and teams directly from the terminal. Every command outputs clean JSON — purpose-built for machine parsing.

```bash
$ node asana-cli.js my-tasks
```
```json
[
  { "gid": "123456", "name": "Review pull request", "due_on": "2026-04-10", "completed": false },
  { "gid": "789012", "name": "Deploy to staging", "due_on": null, "completed": false }
]
```

---

## Why use this?

### 🚀 Zero Dependencies
No `node_modules`. No build step. No package manager. A single `.js` file that runs on any machine with Node.js 18+. Clone and go.

### 🤖 AI-Native Design
Every command outputs structured JSON. Ships with a portable **SKILL.md** that teaches AI coding agents (Gemini, Claude, Copilot) how to call the CLI. Drop it into any project and your AI starts managing Asana tasks.

### ⚡ Auto-Setup
One command discovers your entire workspace — team members, projects, sections, priorities — and generates a local config with friendly aliases. No manual GID hunting.

```bash
$ node asana-cli.js setup
# ✅ config.json generated: 26 team members, 120 projects, 180 sections, 4 priorities
```

### 🔒 Credentials Stay Local
`.env` and `config.json` are git-ignored. Your token never leaves your machine. Team members each use their own Personal Access Token.

---

## How is this different?

| | **Asana CLI for AI** | **MCP Servers** | **Go-based CLIs** | **npm packages** |
|---|---|---|---|---|
| Dependencies | **None** | MCP runtime + OAuth | Go toolchain | `node_modules` tree |
| Setup time | **~30 seconds** | Minutes (OAuth flow) | Go install + build | `npm install` |
| AI context cost | **~2KB** (SKILL.md) | ~48% of token budget | CLAUDE.md blocks | N/A |
| Output | JSON only | JSON | JSON + brief | Varies |
| Architecture | Single file | Server process | Multi-file binary | Library |
| Auto-setup | ✅ | ❌ | ❌ | ❌ |

---

## Quick Start

### 1. Clone & configure

```bash
git clone https://github.com/<your-account>/asana-cli.git
cd asana-cli
cp .env.example .env
```

Add your credentials to `.env`:

```env
ASANA_ACCESS_TOKEN=your_token_here
ASANA_WORKSPACE_GID=your_workspace_gid
```

> **Get your token:** [Asana Developer Console](https://app.asana.com/0/developer-console) → Personal access tokens → Create new token
>
> **Find your workspace GID:** Set your token first, then run `node asana-cli.js workspaces`

### 2. Auto-setup aliases

```bash
node asana-cli.js setup
```

This generates `config.json` with all your workspace aliases — team names, projects, sections, and priority levels.

### 3. Verify

```bash
node asana-cli.js my-tasks
```

You should see a JSON array of your open tasks. ✅

---

## Commands

### Tasks

| Command | Description |
|---|---|
| `my-tasks` | List your incomplete tasks (`--all` for completed) |
| `task get <GID>` | Get full task details |
| `task create --name="..."` | Create a new task |
| `task update <GID>` | Update task (`--completed=true`, `--due=YYYY-MM-DD`, etc.) |
| `task delete <GID>` | Delete a task permanently |
| `task comment <GID> --text="..."` | Add a comment |
| `task subtask <GID> --name="..."` | Create a subtask |
| `task subtasks <GID>` | List subtasks |
| `task move <GID> --section=<alias>` | Move task to a section |
| `task stories <GID>` | View task activity/comments |
| `task add-project <GID> --project=<alias>` | Add task to a project |
| `task deps <GID> --on=gid1,gid2` | Set dependencies |

### Projects

| Command | Description |
|---|---|
| `project list` | List all projects |
| `project get <GID>` | Get project details |
| `project sections <GID>` | List sections |
| `project tasks <GID>` | List tasks (`--all` for completed) |
| `section create --project=<GID> --name="..."` | Create a section |

### Discovery & Search

| Command | Description |
|---|---|
| `search --text="..."` | Search tasks (`--assignee`, `--project`, `--section`, `--completed`, `--due_before`, `--due_after`) |
| `users` | List workspace members |
| `workspaces` | List available workspaces |
| `aliases` | Show configured shortcuts |
| `setup` | Auto-generate `config.json` from workspace |
| `help` | Full command reference |

---

## Examples

```bash
# Create a high-priority task in a section
node asana-cli.js task create \
  --name="Fix auth bug" \
  --project=my-project \
  --assignee=me \
  --due=2026-04-15 \
  --priority=high \
  --section=backlog

# Search tasks assigned to a team member
node asana-cli.js search --assignee=alice --project=my-project

# Complete a task
node asana-cli.js task update 1234567890 --completed=true

# Add a comment
node asana-cli.js task comment 1234567890 --text="Deployed to staging ✅"

# Move a task to a different section
node asana-cli.js task move 1234567890 --section=done
```

---

## AI Agent Integration

This CLI ships with a portable `SKILL.md` — a file that teaches AI coding agents how to discover and use all commands.

### Setup for any project

```bash
# Copy the skill into your project
mkdir -p .agents/skills/asana-management
cp /path/to/asana-cli/.agents/skills/asana-management/SKILL.md \
   .agents/skills/asana-management/SKILL.md
```

Update the CLI path inside `SKILL.md` to match your setup. Done.

### How the AI uses it

1. You say: *"show me my tasks"* or *"create a task for the auth bug"*
2. AI reads `SKILL.md` → discovers available commands
3. Runs the CLI → parses JSON output → presents clean results
4. **Read commands auto-execute. Write commands ask for your approval.**

### Context efficiency

The SKILL.md skill costs **~2KB** of context. Compare that to a full MCP server integration which can consume **~48% of your AI's token budget** on connection overhead alone.

---

## Configuration

### `.env` — Credentials (required)

```env
ASANA_ACCESS_TOKEN=your_personal_access_token
ASANA_WORKSPACE_GID=your_workspace_gid
```

> Git-ignored. Each team member creates their own.

### `config.json` — Shortcuts (optional)

Auto-generated by `setup`. Lets you use aliases instead of raw GIDs:

```json
{
  "team": { "me": "me", "alice": "1234567890" },
  "projects": { "my-project": "1111111111" },
  "sections": { "backlog": "2222222222", "done": "3333333333" },
  "priorities": { "low": "4444", "high": "6666", "urgent": "7777" },
  "customFields": { "priority": "8888888888" }
}
```

> Git-ignored. The CLI works fine without it — just use raw GIDs.

---

## File Structure

```
asana-cli/
├── asana-cli.js           # The CLI (single file, zero deps)
├── .env                   # Your credentials (git-ignored)
├── .env.example           # Credential template
├── config.json            # Your shortcuts (git-ignored, auto-generated)
├── config.example.json    # Shortcut template
├── .gitignore
├── README.md
└── .agents/
    └── skills/
        └── asana-management/
            └── SKILL.md   # AI skill definition
```

## Requirements

- **Node.js 18+** (uses native `fetch`, zero npm dependencies)
- **Asana Personal Access Token** ([free](https://app.asana.com/0/developer-console))

## License

MIT
