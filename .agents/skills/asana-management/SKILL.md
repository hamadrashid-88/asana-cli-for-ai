---
name: asana-management
description: Manage Asana tasks, projects, and team assignments via the Asana CLI tool. Use when the user asks about tasks, projects, assignments, or anything Asana-related.
---

# Asana Management Skill

Manage Asana tasks, projects, sections, and team assignments using the Asana CLI tool.

## CLI Location

```
node C:\Users\Gaming\Documents\Code-Repos\asana-cli\asana-cli.js <command> [options]
```

> **Note:** Update the path above if the CLI is cloned to a different location.

All output is **JSON**. Parse it to present clean results to the user.

## Discovery-First Workflow

The CLI supports optional shortcuts via `config.json`, but you should always **discover dynamically** when you don't know a GID:

1. **Find users:** `node <cli> users` → returns names, emails, and GIDs
2. **Find projects:** `node <cli> project list` → returns project names and GIDs
3. **Find sections:** `node <cli> project sections <PROJECT_GID>` → returns section names and GIDs
4. **Check shortcuts:** `node <cli> aliases` → shows any configured team/project/section aliases

Use GIDs directly when aliases aren't configured. The CLI accepts both aliases and raw GIDs everywhere.

## Quick Reference

### Common Commands

| Action | Command |
|---|---|
| List my tasks | `node <cli> my-tasks` |
| Get task details | `node <cli> task get <GID>` |
| Create a task | `node <cli> task create --name="..." --project=<GID> --assignee=me --due=YYYY-MM-DD --priority=<GID>` |
| Update a task | `node <cli> task update <GID> --completed=true` |
| Delete a task | `node <cli> task delete <GID>` |
| Add comment | `node <cli> task comment <GID> --text="..."` |
| Create subtask | `node <cli> task subtask <GID> --name="..." --assignee=<GID>` |
| Move to section | `node <cli> task move <GID> --section=<GID>` |
| List projects | `node <cli> project list` |
| List sections | `node <cli> project sections <PROJECT_GID>` |
| List project tasks | `node <cli> project tasks <PROJECT_GID>` |
| Search tasks | `node <cli> search --text="keyword"` |
| List users | `node <cli> users` |
| Show aliases | `node <cli> aliases` |

## Auto-Run Policy

- **Safe to auto-run** (read-only): `my-tasks`, `task get`, `task subtasks`, `task stories`, `project list`, `project sections`, `project tasks`, `search`, `users`, `aliases`, `workspaces`
- **Requires approval** (writes): `task create`, `task update`, `task delete`, `task comment`, `task subtask`, `task move`, `task add-project`, `task deps`, `section create`

## Workflow Examples

### First-time discovery
```bash
# 1. Find your workspace users
node <cli> users

# 2. List projects to get GIDs
node <cli> project list

# 3. List sections for a specific project
node <cli> project sections <PROJECT_GID>
```

### Create a task
```bash
node <cli> task create --name="Follow up with client" --project=<PROJECT_GID> --assignee=me --due=2026-04-10 --section=<SECTION_GID>
```

### Error handling
If a command returns `{"error": ...}`, check:
1. Is the GID correct? Use `search` or `project tasks` to find it.
2. Is the assignee correct? Use `users` to find GIDs, or `aliases` for shortcuts.
3. Is the token valid? The error message will indicate auth issues.
