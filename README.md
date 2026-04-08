# Asana CLI for AI

A lightweight, zero-dependency CLI for [Asana](https://asana.com) — purpose-built for AI coding agents and automation.

**Single file. No `npm install`. Just Node.js 18+ and your Asana token.**

```bash
node asana-cli.js my-tasks
```

```json
[
  { "gid": "123456", "name": "Review pull request", "due_on": "2026-04-10", "completed": false },
  { "gid": "789012", "name": "Deploy to staging", "due_on": null, "completed": false }
]
```

---

## Why This Exists

Most Asana integrations are either heavyweight MCP servers that eat your AI's context window, or bloated npm packages with dozens of dependencies. This is neither.

- **Zero dependencies** — uses native `fetch` (Node 18+), no `node_modules`
- **JSON-only output** — designed for AI agents to parse, not humans to read
- **Single file** — one `asana-cli.js`, nothing to build or compile
- **Auto-setup** — one command generates all your workspace aliases
- **AI Skill integration** — ships with a portable `SKILL.md` for AI coding assistants

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

This auto-discovers your workspace and generates `config.json` with:
- **Team aliases** — use `--assignee=alice` instead of `--assignee=1234567890`
- **Project shortcuts** — use `--project=my-project` instead of raw GIDs
- **Section shortcuts** — use `--section=backlog` instead of raw GIDs
- **Priority levels** — auto-detected from your custom fields

### 3. Done

```bash
node asana-cli.js my-tasks          # List your open tasks
node asana-cli.js search --text="bug"  # Search across tasks
node asana-cli.js aliases           # View your configured shortcuts
```

---

## Commands

### Tasks

| Command | Description |
|---|---|
| `my-tasks` | List your incomplete tasks (`--all` for completed) |
| `task get <GID>` | Get full task details |
| `task create --name="..."` | Create a new task |
| `task update <GID>` | Update a task (`--completed=true`, `--due=YYYY-MM-DD`, etc.) |
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
| `search --text="..."` | Search tasks (+ `--assignee`, `--project`, `--section`, `--completed`, `--due_before`, `--due_after`) |
| `users` | List workspace members |
| `workspaces` | List available workspaces |
| `aliases` | Show configured shortcuts |
| `setup` | Auto-generate `config.json` from workspace |
| `help` | Full command reference |

---

## Examples

```bash
# Create a high-priority task
node asana-cli.js task create \
  --name="Fix auth bug" \
  --project=my-project \
  --assignee=me \
  --due=2026-04-15 \
  --priority=high \
  --section=backlog

# Find tasks assigned to a team member
node asana-cli.js search --assignee=alice --project=my-project

# Mark a task done
node asana-cli.js task update 1234567890 --completed=true

# Add a comment
node asana-cli.js task comment 1234567890 --text="Deployed to staging ✅"
```

---

## AI Agent Integration

This CLI is designed to be called by AI coding assistants. It ships with a `SKILL.md` file that teaches AI agents how to use it.

### Setup for any project

Copy the skill into your project's agent directory:

```bash
mkdir -p .agents/skills/asana-management
cp /path/to/asana-cli/.agents/skills/asana-management/SKILL.md \
   .agents/skills/asana-management/SKILL.md
```

Update the CLI path inside `SKILL.md` to match your installation. The AI will auto-detect the skill and start managing your Asana tasks.

### How it works

1. You say *"show me my tasks"* or *"create a task for the auth bug"*
2. The AI reads `SKILL.md`, discovers available commands
3. It runs the CLI, parses the JSON output, and presents clean results
4. Write operations require your approval; reads auto-execute

---

## Configuration

### `.env` — Credentials (required, git-ignored)

```env
ASANA_ACCESS_TOKEN=your_personal_access_token
ASANA_WORKSPACE_GID=your_workspace_gid
```

### `config.json` — Shortcuts (optional, git-ignored)

Generated automatically by `node asana-cli.js setup`. Structure:

```json
{
  "team": { "me": "me", "alice": "1234567890" },
  "projects": { "my-project": "1111111111" },
  "sections": { "backlog": "2222222222", "done": "3333333333" },
  "priorities": { "low": "4444", "medium": "5555", "high": "6666", "urgent": "7777" },
  "customFields": { "priority": "8888888888" }
}
```

The CLI works without `config.json` — you just use raw GIDs instead of aliases.

---

## File Structure

```
asana-cli/
├── asana-cli.js          # CLI (single file, zero deps)
├── .env                  # Your credentials (git-ignored)
├── .env.example          # Credential template
├── config.json           # Your shortcuts (git-ignored, auto-generated)
├── config.example.json   # Shortcut template
├── .gitignore
├── README.md
└── .agents/
    └── skills/
        └── asana-management/
            └── SKILL.md  # AI skill definition
```

## Requirements

- **Node.js 18+** (uses native `fetch`)
- **Asana Personal Access Token** ([free](https://app.asana.com/0/developer-console))

## License

MIT
