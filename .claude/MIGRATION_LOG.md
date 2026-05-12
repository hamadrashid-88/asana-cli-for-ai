# Migration Log — asana-cli
_Phase 2 executed: 2026-05-12_

## Pre-state
- 1 skill at `.agents/skills/asana-management/SKILL.md`
- No `AGENTS.md`, no `CLAUDE.md`, no `_docs/`

## Actions taken

### Skill renames / moves
- `.agents/skills/asana-management/` → `.claude/skills/asana-management/` (no content changes)
- `.agents/` directory removed (was empty after the move)

### Frontmatter
- `asana-management` already had a valid Claude Code frontmatter (`name: asana-management` matches dir, `description` present, no Antigravity-only fields). No edits needed.

### CLAUDE.md
- Created fresh root `CLAUDE.md` summarizing the CLI surface, env-var layout, the skill, and the read-safe vs. write-requires-approval policy.
- No AGENTS.md to merge.

### README.md updates
- Section "AI Agent Integration" — updated the example `mkdir -p .agents/...; cp` snippet to lead with `.claude/skills/...` for Claude Code users, with the `.agents/skills/` variant retained for Antigravity/Gemini consumers (this repo is itself a distributable, so back-compat matters).
- "File Structure" tree — replaced `.agents/` with `.claude/`.

### Path references in skill body
- `SKILL.md` references `node /path/to/asana-cli/asana-cli.js` (a generic placeholder, not a real path) — no change needed.

## Deletions
- None. Audit classified the single skill as `procedure` and recommended keeping it.

## Promotion to Phase 3
- Audit classified `asana-management` as **repo-specific** (tightly coupled to this CLI). It will **not** be promoted to `~/.claude/skills/`.

## Open items for your review
- **Distribution compatibility:** The README previously pointed downstream consumers at `.agents/skills/`. The repo's own product (a portable SKILL.md) is now distributed from `.claude/skills/`. Downstream Antigravity/Gemini users who run the documented `mkdir -p .agents/skills/...` snippet will need to either copy from the new path or you'll want to keep a mirror at `.agents/skills/`. Decision deferred to you. README currently shows both paths.
- **GitHub repo name vs. skill path:** README says `git clone https://github.com/hamadrashid-88/asana-cli-for-ai.git` but the local folder is `asana-cli`. Unchanged — informational only.
