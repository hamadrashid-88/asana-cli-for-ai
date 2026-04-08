#!/usr/bin/env node

/**
 * Asana CLI — AI-optimized command-line interface
 * Zero dependencies, uses native fetch + Node.js 18+
 * All output is JSON for machine parsing.
 *
 * Usage: node asana-cli.js <command> [subcommand] [options]
 */

const fs = require("fs");
const path = require("path");

// ─── Load .env ──────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const TOKEN = process.env.ASANA_ACCESS_TOKEN;
const WORKSPACE = process.env.ASANA_WORKSPACE_GID;
const BASE = "https://app.asana.com/api/1.0";

if (!TOKEN) {
  console.error(JSON.stringify({ error: "ASANA_ACCESS_TOKEN not set. Create a .env file." }));
  process.exit(1);
}

// ─── Load config.json (team aliases, project/section shortcuts) ─────────────
function loadConfig() {
  const configPath = path.join(__dirname, "config.json");
  if (!fs.existsSync(configPath)) {
    return { team: { me: "me" }, projects: {}, sections: {}, priorities: {}, customFields: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (err) {
    console.error(JSON.stringify({ error: `Failed to parse config.json: ${err.message}` }));
    process.exit(1);
  }
}

const CONFIG = loadConfig();
const TEAM = CONFIG.team || { me: "me" };
const SHORTCUTS = {
  projects: CONFIG.projects || {},
  sections: CONFIG.sections || {},
  priorities: CONFIG.priorities || {},
  customFields: CONFIG.customFields || {},
};

function resolveAssignee(input) {
  if (!input) return undefined;
  const lower = input.toLowerCase();
  return TEAM[lower] || input;
}

function resolveProject(input) {
  if (!input) return undefined;
  return SHORTCUTS.projects[input.toLowerCase()] || input;
}

function resolveSection(input) {
  if (!input) return undefined;
  return SHORTCUTS.sections[input.toLowerCase()] || input;
}

function resolvePriority(input) {
  if (!input) return undefined;
  return SHORTCUTS.priorities[input.toLowerCase()] || input;
}

// ─── API Helper ─────────────────────────────────────────────────────────────
async function api(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  const fetchOptions = { method: options.method || "GET", headers };
  if (options.body) fetchOptions.body = JSON.stringify(options.body);

  const res = await fetch(url, fetchOptions);
  const text = await res.text();

  if (!res.ok) {
    let errBody;
    try { errBody = JSON.parse(text); } catch { errBody = text; }
    return { error: true, status: res.status, message: errBody };
  }

  if (!text || text.trim() === "") return { data: null };
  return JSON.parse(text);
}

// ─── Argument Parser ────────────────────────────────────────────────────────
function parseArgs(args) {
  const flags = {};
  const positional = [];
  for (const arg of args) {
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        flags[arg.slice(2)] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

// ─── Output Helper ──────────────────────────────────────────────────────────
function out(data) {
  console.log(JSON.stringify(data, null, 2));
}

// ─── Commands ───────────────────────────────────────────────────────────────

// --- workspaces ---
async function cmdWorkspaces() {
  const res = await api("/workspaces");
  out(res.data || res);
}

// --- my-tasks ---
async function cmdMyTasks(flags) {
  const ws = flags.workspace || WORKSPACE;
  const optFields = flags.fields || "name,due_on,assignee_section.name,projects.name,completed,notes";
  const res = await api(`/users/me/user_task_list?workspace=${ws}&opt_fields=gid`);
  if (res.error) return out(res);

  const utlGid = res.data.gid;
  const completedSince = flags.all ? "" : "&completed_since=now";
  const tasks = await api(`/user_task_lists/${utlGid}/tasks?opt_fields=${optFields}${completedSince}`);
  out(tasks.data || tasks);
}

// --- task get <gid> ---
async function cmdTaskGet(gid, flags) {
  if (!gid) return out({ error: "Usage: task get <task_gid>" });
  const optFields = flags.fields || "name,notes,due_on,completed,assignee.name,projects.name,memberships.section.name,custom_fields,tags.name,parent.name,permalink_url";
  const res = await api(`/tasks/${gid}?opt_fields=${optFields}`);
  out(res.data || res);
}

// --- task create ---
async function cmdTaskCreate(flags) {
  if (!flags.name) return out({ error: "Usage: task create --name='...' --project=X [--assignee=me] [--due=YYYY-MM-DD] [--priority=high] [--notes='...']" });

  const projectId = resolveProject(flags.project);
  const body = {
    data: {
      name: flags.name,
      notes: flags.notes || "",
      assignee: resolveAssignee(flags.assignee),
      due_on: flags.due || null,
      workspace: WORKSPACE,
    },
  };

  if (projectId) body.data.projects = [projectId];

  // Custom fields (priority)
  const priority = resolvePriority(flags.priority);
  if (priority) {
    body.data.custom_fields = { [SHORTCUTS.customFields.priority]: priority };
  }

  const res = await api("/tasks", { method: "POST", body });
  const task = res.data || res;

  // Move to section if specified
  if (flags.section && task.gid) {
    const sectionId = resolveSection(flags.section);
    await api(`/sections/${sectionId}/addTask`, {
      method: "POST",
      body: { data: { task: task.gid } },
    });
    task._movedToSection = sectionId;
  }

  out(task);
}

// --- task update <gid> ---
async function cmdTaskUpdate(gid, flags) {
  if (!gid) return out({ error: "Usage: task update <task_gid> [--name='...'] [--completed=true] [--due=YYYY-MM-DD] [--assignee=X] [--notes='...']" });

  const body = { data: {} };
  if (flags.name) body.data.name = flags.name;
  if (flags.notes !== undefined) body.data.notes = flags.notes;
  if (flags.assignee) body.data.assignee = resolveAssignee(flags.assignee);
  if (flags.due) body.data.due_on = flags.due;
  if (flags.completed !== undefined) body.data.completed = flags.completed === "true" || flags.completed === true;

  const priority = resolvePriority(flags.priority);
  if (priority) {
    body.data.custom_fields = { [SHORTCUTS.customFields.priority]: priority };
  }

  const res = await api(`/tasks/${gid}`, { method: "PUT", body });
  out(res.data || res);
}

// --- task delete <gid> ---
async function cmdTaskDelete(gid) {
  if (!gid) return out({ error: "Usage: task delete <task_gid>" });
  const res = await api(`/tasks/${gid}`, { method: "DELETE" });
  out(res.data !== undefined ? { success: true, deleted: gid } : res);
}

// --- task comment <gid> ---
async function cmdTaskComment(gid, flags) {
  if (!gid || !flags.text) return out({ error: "Usage: task comment <task_gid> --text='...'" });
  const body = { data: { text: flags.text } };
  const res = await api(`/tasks/${gid}/stories`, { method: "POST", body });
  out(res.data || res);
}

// --- task subtask <gid> ---
async function cmdTaskSubtask(gid, flags) {
  if (!gid || !flags.name) return out({ error: "Usage: task subtask <parent_gid> --name='...' [--assignee=faisal] [--due=YYYY-MM-DD] [--notes='...']" });

  const body = {
    data: {
      name: flags.name,
      notes: flags.notes || "",
      assignee: resolveAssignee(flags.assignee),
      due_on: flags.due || null,
    },
  };

  const res = await api(`/tasks/${gid}/subtasks`, { method: "POST", body });
  out(res.data || res);
}

// --- task subtasks <gid> (list subtasks) ---
async function cmdTaskSubtasks(gid, flags) {
  if (!gid) return out({ error: "Usage: task subtasks <task_gid>" });
  const optFields = flags.fields || "name,completed,assignee.name,due_on";
  const res = await api(`/tasks/${gid}/subtasks?opt_fields=${optFields}`);
  out(res.data || res);
}

// --- task move <gid> ---
async function cmdTaskMove(gid, flags) {
  if (!gid || !flags.section) return out({ error: "Usage: task move <task_gid> --section=taaleem" });
  const sectionId = resolveSection(flags.section);
  const res = await api(`/sections/${sectionId}/addTask`, {
    method: "POST",
    body: { data: { task: gid } },
  });
  out(res.data !== undefined ? { success: true, task: gid, section: sectionId } : res);
}

// --- task stories <gid> ---
async function cmdTaskStories(gid, flags) {
  if (!gid) return out({ error: "Usage: task stories <task_gid>" });
  const optFields = flags.fields || "text,type,created_by.name,created_at,resource_subtype";
  const res = await api(`/tasks/${gid}/stories?opt_fields=${optFields}`);
  out(res.data || res);
}

// --- task add-project <gid> ---
async function cmdTaskAddProject(gid, flags) {
  if (!gid || !flags.project) return out({ error: "Usage: task add-project <task_gid> --project=focused-tasks [--section=taaleem]" });
  const body = {
    data: {
      project: resolveProject(flags.project),
    },
  };
  if (flags.section) body.data.section = resolveSection(flags.section);
  const res = await api(`/tasks/${gid}/addProject`, { method: "POST", body });
  out(res.data !== undefined ? { success: true, task: gid } : res);
}

// --- task deps <gid> ---
async function cmdTaskDeps(gid, flags) {
  if (!gid || !flags.on) return out({ error: "Usage: task deps <task_gid> --on=<dependency_gid1,gid2>" });
  const deps = flags.on.split(",");
  const body = { data: { dependencies: deps } };
  const res = await api(`/tasks/${gid}/addDependencies`, { method: "POST", body });
  out(res.data !== undefined ? { success: true, task: gid, dependencies: deps } : res);
}

// --- project list ---
async function cmdProjectList(flags) {
  const ws = flags.workspace || WORKSPACE;
  const optFields = flags.fields || "name,color,archived,current_status";
  const archived = flags.archived === "true" ? "&archived=true" : "&archived=false";
  const res = await api(`/projects?workspace=${ws}&opt_fields=${optFields}${archived}`);
  out(res.data || res);
}

// --- project get <gid> ---
async function cmdProjectGet(gid, flags) {
  if (!gid) return out({ error: "Usage: project get <project_gid>" });
  gid = resolveProject(gid);
  const optFields = flags.fields || "name,notes,color,archived,current_status,owner.name,team.name";
  const res = await api(`/projects/${gid}?opt_fields=${optFields}`);
  out(res.data || res);
}

// --- project sections <gid> ---
async function cmdProjectSections(gid, flags) {
  if (!gid) return out({ error: "Usage: project sections <project_gid>" });
  gid = resolveProject(gid);
  const res = await api(`/projects/${gid}/sections?opt_fields=name`);
  out(res.data || res);
}

// --- project tasks <gid> ---
async function cmdProjectTasks(gid, flags) {
  if (!gid) return out({ error: "Usage: project tasks <project_gid>" });
  gid = resolveProject(gid);
  const optFields = flags.fields || "name,completed,assignee.name,due_on,memberships.section.name";
  const completedSince = flags.all ? "" : "&completed_since=now";
  const res = await api(`/projects/${gid}/tasks?opt_fields=${optFields}${completedSince}`);
  out(res.data || res);
}

// --- section create ---
async function cmdSectionCreate(flags) {
  if (!flags.project || !flags.name) return out({ error: "Usage: section create --project=X --name='...'" });
  const projectId = resolveProject(flags.project);
  const body = { data: { name: flags.name } };
  const res = await api(`/projects/${projectId}/sections`, { method: "POST", body });
  out(res.data || res);
}

// --- search ---
async function cmdSearch(flags) {
  const ws = flags.workspace || WORKSPACE;
  const params = new URLSearchParams();
  if (flags.text) params.set("text", flags.text);
  if (flags.assignee) params.set("assignee.any", resolveAssignee(flags.assignee));
  if (flags.project) params.set("projects.any", resolveProject(flags.project));
  if (flags.section) params.set("sections.any", resolveSection(flags.section));
  if (flags.completed === "true") params.set("completed", "true");
  else if (flags.completed === "false" || !flags.completed) params.set("completed", "false");
  if (flags.due_before) params.set("due_on.before", flags.due_before);
  if (flags.due_after) params.set("due_on.after", flags.due_after);

  const optFields = flags.fields || "name,completed,assignee.name,due_on,projects.name";
  params.set("opt_fields", optFields);

  const res = await api(`/workspaces/${ws}/tasks/search?${params.toString()}`);
  out(res.data || res);
}

// --- users ---
async function cmdUsers(flags) {
  const ws = flags.workspace || WORKSPACE;
  const optFields = flags.fields || "name,email";
  const res = await api(`/workspaces/${ws}/users?opt_fields=${optFields}`);
  out(res.data || res);
}

// --- aliases (show team aliases) ---
function cmdAliases() {
  out({ team: TEAM, projects: SHORTCUTS.projects, sections: SHORTCUTS.sections, priorities: SHORTCUTS.priorities });
}

// --- setup (auto-generate config.json) ---
async function cmdSetup() {
  const ws = WORKSPACE;
  if (!ws) {
    return out({ error: "ASANA_WORKSPACE_GID not set in .env. Run 'workspaces' to find yours." });
  }

  const config = { team: { me: "me" }, projects: {}, sections: {}, priorities: {}, customFields: {} };

  // 1. Fetch users → build team aliases from first names
  const usersRes = await api(`/workspaces/${ws}/users?opt_fields=name,email`);
  if (usersRes.data) {
    const seen = new Set(["me"]);
    for (const user of usersRes.data) {
      const firstName = user.name.split(" ")[0].toLowerCase();
      const alias = seen.has(firstName) ? user.name.toLowerCase().replace(/\s+/g, "-") : firstName;
      if (!seen.has(alias)) {
        config.team[alias] = user.gid;
        seen.add(alias);
      }
    }
  }

  // 2. Fetch projects → build project aliases from slugified names
  const projRes = await api(`/projects?workspace=${ws}&opt_fields=name&archived=false`);
  if (projRes.data) {
    for (const proj of projRes.data) {
      const slug = proj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (slug) config.projects[slug] = proj.gid;
    }
  }

  // 3. Fetch sections for each project
  for (const [slug, gid] of Object.entries(config.projects)) {
    const secRes = await api(`/projects/${gid}/sections?opt_fields=name`);
    if (secRes.data) {
      for (const sec of secRes.data) {
        const secSlug = sec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (secSlug && secSlug !== "untitled-section" && !config.sections[secSlug]) {
          config.sections[secSlug] = sec.gid;
        }
      }
    }
  }

  // 4. Try to find priority custom field
  const cfRes = await api(`/workspaces/${ws}/custom_fields?opt_fields=name,enum_options.name,resource_subtype`);
  if (cfRes.data) {
    for (const cf of cfRes.data) {
      if (cf.name.toLowerCase() === "priority" && cf.enum_options) {
        config.customFields.priority = cf.gid;
        for (const opt of cf.enum_options) {
          const pSlug = opt.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          if (pSlug) config.priorities[pSlug] = opt.gid;
        }
        break;
      }
    }
  }

  // Write config.json
  const configPath = path.join(__dirname, "config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  out({
    success: true,
    message: "config.json generated successfully",
    summary: {
      team_members: Object.keys(config.team).length,
      projects: Object.keys(config.projects).length,
      sections: Object.keys(config.sections).length,
      priorities: Object.keys(config.priorities).length,
    },
    config,
  });
}

// --- help ---
function cmdHelp() {
  out({
    usage: "node asana-cli.js <command> [subcommand] [options]",
    commands: {
      setup: "Auto-generate config.json with team, project, and section aliases",
      "my-tasks": "List your incomplete tasks. Flags: --all, --fields, --workspace",
      "task get <gid>": "Get task details",
      "task create": "Create task. Flags: --name, --project, --assignee, --due, --priority, --section, --notes",
      "task update <gid>": "Update task. Flags: --name, --completed, --due, --assignee, --notes, --priority",
      "task delete <gid>": "Delete a task permanently",
      "task comment <gid>": "Add comment. Flags: --text",
      "task subtask <gid>": "Create subtask. Flags: --name, --assignee, --due, --notes",
      "task subtasks <gid>": "List subtasks of a task",
      "task move <gid>": "Move to section. Flags: --section",
      "task stories <gid>": "Get task comments/stories",
      "task add-project <gid>": "Add task to project. Flags: --project, --section",
      "task deps <gid>": "Set dependencies. Flags: --on=gid1,gid2",
      "project list": "List all projects. Flags: --archived, --fields",
      "project get <gid>": "Get project details",
      "project sections <gid>": "List sections in a project",
      "project tasks <gid>": "List tasks in a project. Flags: --all, --fields",
      "section create": "Create section. Flags: --project, --name",
      "search": "Search tasks. Flags: --text, --assignee, --project, --section, --completed, --due_before, --due_after",
      "users": "List workspace users",
      "aliases": "Show team member aliases, project/section shortcuts",
      workspaces: "List available workspaces",
    },
    aliases: {
      assignees: Object.keys(TEAM).join(", "),
      projects: Object.keys(SHORTCUTS.projects).join(", "),
      sections: Object.keys(SHORTCUTS.sections).join(", "),
      priorities: Object.keys(SHORTCUTS.priorities).join(", "),
    },
  });
}

// ─── Router ─────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) return cmdHelp();

  const { flags, positional } = parseArgs(args);
  const cmd = positional[0];
  const sub = positional[1];
  const arg3 = positional[2];

  try {
    switch (cmd) {
      case "help":
        return cmdHelp();
      case "setup":
        return await cmdSetup();
      case "workspaces":
        return await cmdWorkspaces();
      case "my-tasks":
        return await cmdMyTasks(flags);
      case "users":
        return await cmdUsers(flags);
      case "aliases":
        return cmdAliases();
      case "search":
        return await cmdSearch(flags);
      case "task":
        switch (sub) {
          case "get": return await cmdTaskGet(arg3, flags);
          case "create": return await cmdTaskCreate(flags);
          case "update": return await cmdTaskUpdate(arg3, flags);
          case "delete": return await cmdTaskDelete(arg3);
          case "comment": return await cmdTaskComment(arg3, flags);
          case "subtask": return await cmdTaskSubtask(arg3, flags);
          case "subtasks": return await cmdTaskSubtasks(arg3, flags);
          case "move": return await cmdTaskMove(arg3, flags);
          case "stories": return await cmdTaskStories(arg3, flags);
          case "add-project": return await cmdTaskAddProject(arg3, flags);
          case "deps": return await cmdTaskDeps(arg3, flags);
          default: return out({ error: `Unknown task subcommand: ${sub}. Run 'help' for usage.` });
        }
      case "project":
        switch (sub) {
          case "list": return await cmdProjectList(flags);
          case "get": return await cmdProjectGet(arg3, flags);
          case "sections": return await cmdProjectSections(arg3, flags);
          case "tasks": return await cmdProjectTasks(arg3, flags);
          default: return out({ error: `Unknown project subcommand: ${sub}. Run 'help' for usage.` });
        }
      case "section":
        switch (sub) {
          case "create": return await cmdSectionCreate(flags);
          default: return out({ error: `Unknown section subcommand: ${sub}. Run 'help' for usage.` });
        }
      default:
        return out({ error: `Unknown command: ${cmd}. Run 'help' for usage.` });
    }
  } catch (err) {
    out({ error: err.message, stack: err.stack });
    process.exit(1);
  }
}

main();
