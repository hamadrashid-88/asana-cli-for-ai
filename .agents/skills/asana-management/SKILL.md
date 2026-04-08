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

All output is **JSON**. Parse it to present clean results to the user.

## Quick Reference

### Common Commands

| Action | Command |
|---|---|
| List my tasks | `node <cli> my-tasks` |
| Get task details | `node <cli> task get <GID>` |
| Create a task | `node <cli> task create --name="..." --project=focused-tasks --assignee=me --due=YYYY-MM-DD --priority=high --section=taaleem` |
| Update a task | `node <cli> task update <GID> --completed=true` |
| Delete a task | `node <cli> task delete <GID>` |
| Add comment | `node <cli> task comment <GID> --text="..."` |
| Create subtask | `node <cli> task subtask <GID> --name="..." --assignee=faisal` |
| Move to section | `node <cli> task move <GID> --section=taaleem` |
| List projects | `node <cli> project list` |
| List sections | `node <cli> project sections <PROJECT_GID>` |
| List project tasks | `node <cli> project tasks <PROJECT_GID>` |
| Search tasks | `node <cli> search --text="keyword"` |
| List users | `node <cli> users` |
| Show aliases | `node <cli> aliases` |

### Team Member Aliases

Use these names instead of GIDs for `--assignee`:

| Alias | Name | GID |
|---|---|---|
| `me` / `hamad` | Hamad Rashid | 1206442081160871 |
| `faisal` | Faisal Ashraf | 1136056094711861 |
| `khusro` | Khusro Khan | 1206458674826901 |
| `riaz` | Riaz Ali Khan | 1156170635901123 |
| `levie` | Levie Nacional | 383307722278343 |

### Project Shortcuts

| Shortcut | Project |
|---|---|
| `focused-tasks` | Focused Tasks |
| `group-admin` | Group Admin |
| `cloud-services` | Cloud Services Management AWS |

### Section Shortcuts (Focused Tasks)

| Shortcut | Section |
|---|---|
| `taaleem` | Taaleem |
| `ens` | ENS |
| `proptera` | Proptera |
| `dental-id` | Dental ID |
| `garden-5` | Garden 5 |
| `cogeter` | Cogeter |
| `leads` | Leads |
| `completed` | Completed |

### Priority Levels

Use `--priority=` with: `low`, `medium`, `high`, `urgent`

## Auto-Run Policy

Per user rules:
- **Safe to auto-run** (read-only): `my-tasks`, `task get`, `task subtasks`, `task stories`, `project list`, `project sections`, `project tasks`, `search`, `users`, `aliases`, `workspaces`
- **Requires approval** (writes): `task create`, `task update`, `task delete`, `task comment`, `task subtask`, `task move`, `task add-project`, `task deps`, `section create`

## Workflow Examples

### Create a task with priority in a section
```
node <cli> task create --name="Follow up with client" --project=focused-tasks --assignee=me --due=2026-04-10 --priority=high --section=taaleem
```

### Bulk operations
Run multiple read commands with `SafeToAutoRun: true`, then write commands sequentially with approval.

### Error handling
If a command returns `{"error": ...}`, check:
1. Is the GID correct? Use `search` or `project tasks` to find it.
2. Is the assignee alias valid? Use `aliases` to check.
3. Is the token valid? The error message will indicate auth issues.
