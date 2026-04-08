# Asana CLI

A lightweight, zero-dependency command-line interface for Asana — built for AI-assisted workflows with [Antigravity](https://gemini.google.com).

No `npm install` required. Just Node.js 18+ and your Asana Personal Access Token.

---

## Quick Start

### 1. Clone the repo

```bash
git clone <repo-url>
cd asana-cli
```

### 2. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and paste your **Personal Access Token**:

```env
ASANA_ACCESS_TOKEN=your_token_here
ASANA_WORKSPACE_GID=1206442218701962
```

> **How to get your token:**
> 1. Go to [Asana Developer Console](https://app.asana.com/0/developer-console)
> 2. Click **Personal access tokens** → **Create new token**
> 3. Give it a name (e.g., "CLI") and copy the token
> 4. Paste it into your `.env` file

### 3. Test it

```bash
node asana-cli.js my-tasks
```

You should see a JSON array of your open tasks. Done. ✅

---

## Usage

```
node asana-cli.js <command> [subcommand] [options]
```

### Task Commands

| Command | Description |
|---|---|
| `my-tasks` | List your incomplete tasks (`--all` for completed too) |
| `task get <GID>` | Get full task details |
| `task create --name="..." --project=X` | Create a new task |
| `task update <GID> --completed=true` | Update a task |
| `task delete <GID>` | Delete a task permanently |
| `task comment <GID> --text="..."` | Add a comment |
| `task subtask <GID> --name="..."` | Create a subtask |
| `task subtasks <GID>` | List subtasks |
| `task move <GID> --section=taaleem` | Move task to a section |
| `task stories <GID>` | View task comments/activity |
| `task add-project <GID> --project=X` | Add task to another project |
| `task deps <GID> --on=gid1,gid2` | Set task dependencies |

### Project Commands

| Command | Description |
|---|---|
| `project list` | List all projects (`--archived=true` to include archived) |
| `project get <GID>` | Get project details |
| `project sections <GID>` | List sections in a project |
| `project tasks <GID>` | List tasks in a project (`--all` for completed too) |
| `section create --project=X --name="..."` | Create a new section |

### Other Commands

| Command | Description |
|---|---|
| `search --text="keyword"` | Search tasks (filters: `--assignee`, `--project`, `--section`, `--completed`, `--due_before`, `--due_after`) |
| `users` | List workspace members |
| `workspaces` | List available workspaces |
| `aliases` | Show all shortcuts (team, projects, sections, priorities) |
| `help` | Show the full command reference |

---

## Shortcuts

Instead of remembering GIDs, use these built-in aliases:

### Team Members (`--assignee=`)

| Alias | Name |
|---|---|
| `me` | Yourself |
| `hamad` | Hamad Rashid |
| `faisal` | Faisal Ashraf |
| `khusro` | Khusro Khan |
| `riaz` | Riaz Ali Khan |
| `levie` | Levie Nacional |

### Projects (`--project=`)

| Alias | Project |
|---|---|
| `focused-tasks` | Focused Tasks |
| `group-admin` | Group Admin |
| `cloud-services` | Cloud Services Management AWS |

### Sections (`--section=`)

| Alias | Section (Focused Tasks) |
|---|---|
| `taaleem` | Taaleem |
| `ens` | ENS |
| `proptera` | Proptera |
| `dental-id` | Dental ID |
| `garden-5` | Garden 5 |
| `cogeter` | Cogeter |
| `leads` | Leads |
| `completed` | Completed |

### Priority (`--priority=`)

`low` · `medium` · `high` · `urgent`

---

## Examples

**Create a high-priority task in the Taaleem section:**
```bash
node asana-cli.js task create --name="Review API docs" --project=focused-tasks --assignee=me --due=2026-04-15 --priority=high --section=taaleem
```

**Search for tasks assigned to Faisal:**
```bash
node asana-cli.js search --assignee=faisal --project=focused-tasks
```

**Mark a task as complete:**
```bash
node asana-cli.js task update 1234567890 --completed=true
```

**Add a comment to a task:**
```bash
node asana-cli.js task comment 1234567890 --text="Done — deployed to production."
```

---

## Antigravity AI Integration

This CLI is designed to be used by AI coding assistants via the **Skill** system. The skill file teaches the AI how to call the CLI on your behalf.

### Setup for any project

1. Copy the skill folder into your project:

```
your-project/
└── .agents/
    └── skills/
        └── asana-management/
            └── SKILL.md
```

2. Copy `SKILL.md` from this repo:

```bash
# From your project root
mkdir -p .agents/skills/asana-management
cp C:\Users\Gaming\Documents\Code-Repos\asana-cli\.agents\skills\asana-management\SKILL.md .agents/skills/asana-management/SKILL.md
```

3. That's it. The AI will now detect the skill and use the CLI automatically when you ask about tasks, assignments, or projects.

> **Note:** The skill references the CLI at its absolute path (`C:\Users\Gaming\Documents\Code-Repos\asana-cli\asana-cli.js`). If you cloned the repo to a different location, update the path in `SKILL.md`.

---

## Requirements

- **Node.js 18+** (uses native `fetch`, no dependencies)
- **Asana Personal Access Token** (free, from the developer console)

---

## File Structure

```
asana-cli/
├── asana-cli.js          # The CLI tool (single file, zero deps)
├── .env                  # Your credentials (git-ignored)
├── .env.example          # Template for new users
├── .gitignore            # Excludes node_modules/ and .env
├── README.md             # This file
└── .agents/
    └── skills/
        └── asana-management/
            └── SKILL.md  # AI skill definition
```
