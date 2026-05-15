#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SERVER_NAME = "project-ops-mcp-server";
const VERSION = "0.1.0";
const MAX_DOC_BYTES = 512 * 1024;

type ResponseFormat = "markdown" | "json";
type TaskStatus = "backlog" | "ready" | "doing" | "blocked" | "review" | "done" | "archived";
type DocArea = "requirements" | "product" | "plans" | "decisions" | "learnings" | "project-rules" | "verification" | "all";

interface ProjectTask {
  id: string;
  title: string;
  status: TaskStatus;
  plan?: string;
  requirements?: string[];
  verification?: string[];
  owner?: string;
  notes?: string;
  lastRun?: string;
  updatedAt: string;
}

interface TasksFile {
  tasks: ProjectTask[];
}

interface DocRecord {
  area: DocArea;
  path: string;
  relative_path: string;
  title: string;
  excerpt?: string;
}

const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");
const TaskStatusSchema = z.enum(["backlog", "ready", "doing", "blocked", "review", "done", "archived"]);
const DocAreaSchema = z.enum(["requirements", "product", "plans", "decisions", "learnings", "project-rules", "verification", "all"]);

function resolveProjectDir(projectDir?: string): string {
  return path.resolve(projectDir || process.cwd());
}

function opsDir(projectDir: string): string {
  return path.join(resolveProjectDir(projectDir), ".project-ops");
}

function now(): string {
  return new Date().toISOString();
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "plan";
}

async function ensureInsideOps(projectDir: string, candidatePath: string): Promise<string> {
  const root = opsDir(projectDir);
  const rootReal = existsSync(root) ? await realpath(root) : path.resolve(root);
  const resolved = path.resolve(candidatePath);
  const parent = path.dirname(resolved);
  const parentReal = existsSync(parent) ? await realpath(parent) : path.resolve(parent);
  const relativeParent = path.relative(rootReal, parentReal);
  if (relativeParent.startsWith("..") || path.isAbsolute(relativeParent)) {
    throw new Error("Refusing to access a path outside .project-ops.");
  }
  return resolved;
}

async function readText(filePath: string): Promise<string | undefined> {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile() || fileStat.size > MAX_DOC_BYTES) return undefined;
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

async function writeIfMissing(filePath: string, content: string): Promise<boolean> {
  if (existsSync(filePath)) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
  return true;
}

function defaultProjectJson(projectDir: string, projectName?: string): string {
  const name = projectName || path.basename(resolveProjectDir(projectDir));
  return JSON.stringify(
    {
      name,
      description: "",
      defaultAgent: "codex",
      createdAt: now(),
      contextPolicy: {
        loadRequirements: true,
        loadProductDocs: true,
        loadDecisions: true,
        loadLearnings: true,
        loadProjectRules: true,
        loadVerification: true
      }
    },
    null,
    2
  ) + "\n";
}

function defaultTasksJson(): string {
  return JSON.stringify({ tasks: [] }, null, 2) + "\n";
}

function defaultVerificationJson(): string {
  return JSON.stringify(
    {
      frontend: ["npm run lint", "npm run build"],
      backend: [],
      test: [],
      smoke: []
    },
    null,
    2
  ) + "\n";
}

async function initProjectOps(projectDir: string, projectName?: string) {
  const root = opsDir(projectDir);
  const created: string[] = [];
  await mkdir(root, { recursive: true });

  for (const dir of ["requirements", "product", "plans"]) {
    const full = path.join(root, dir);
    if (!existsSync(full)) created.push(path.relative(resolveProjectDir(projectDir), full));
    await mkdir(full, { recursive: true });
  }

  const files: Array<[string, string]> = [
    ["project.json", defaultProjectJson(projectDir, projectName)],
    ["tasks.json", defaultTasksJson()],
    ["decisions.md", "# Decisions\n\n"],
    ["learnings.md", "# Learnings\n\n"],
    ["project-rules.md", "# Project Rules\n\n"],
    ["verification.json", defaultVerificationJson()],
    ["requirements/README.md", "# Requirements\n\nAdd requirement documents here.\n"],
    ["product/README.md", "# Product Notes\n\nAdd product notes, PRDs, user flows, and constraints here.\n"],
    ["plans/README.md", "# Plans\n\nGenerated and hand-written task plans live here.\n"]
  ];

  for (const [relative, content] of files) {
    const didCreate = await writeIfMissing(path.join(root, relative), content);
    if (didCreate) created.push(path.join(".project-ops", relative));
  }

  return { project_dir: resolveProjectDir(projectDir), ops_dir: root, created };
}

async function listFilesRecursive(dir: string, extensions = [".md", ".json"]): Promise<string[]> {
  const files: string[] = [];
  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && extensions.includes(path.extname(entry.name))) files.push(full);
    }
  }
  await walk(dir);
  return files;
}

function areaPath(projectDir: string, area: DocArea): string {
  const root = opsDir(projectDir);
  if (area === "requirements") return path.join(root, "requirements");
  if (area === "product") return path.join(root, "product");
  if (area === "plans") return path.join(root, "plans");
  if (area === "decisions") return path.join(root, "decisions.md");
  if (area === "learnings") return path.join(root, "learnings.md");
  if (area === "project-rules") return path.join(root, "project-rules.md");
  if (area === "verification") return path.join(root, "verification.json");
  return root;
}

async function collectDocs(projectDir: string, area: DocArea): Promise<DocRecord[]> {
  const root = opsDir(projectDir);
  if (!existsSync(root)) return [];

  const areas: DocArea[] = area === "all"
    ? ["requirements", "product", "plans", "decisions", "learnings", "project-rules", "verification"]
    : [area];

  const docs: DocRecord[] = [];
  for (const currentArea of areas) {
    const target = areaPath(projectDir, currentArea);
    const targetStat = await stat(target).catch(() => undefined);
    if (!targetStat) continue;

    const files = targetStat.isDirectory() ? await listFilesRecursive(target) : [target];
    for (const file of files) {
      const text = await readText(file);
      if (text === undefined) continue;
      const firstHeader = text.split("\n").find((line) => line.startsWith("#"));
      docs.push({
        area: currentArea,
        path: file,
        relative_path: path.relative(root, file),
        title: firstHeader?.replace(/^#+\s*/, "").trim() || path.basename(file),
        excerpt: text.slice(0, 500)
      });
    }
  }
  return docs;
}

function matches(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

async function readTasks(projectDir: string): Promise<TasksFile> {
  const text = await readText(path.join(opsDir(projectDir), "tasks.json"));
  if (!text) return { tasks: [] };
  try {
    const parsed = JSON.parse(text) as TasksFile;
    if (!Array.isArray(parsed.tasks)) return { tasks: [] };
    return parsed;
  } catch {
    return { tasks: [] };
  }
}

async function writeTasks(projectDir: string, tasksFile: TasksFile): Promise<void> {
  const filePath = await ensureInsideOps(projectDir, path.join(opsDir(projectDir), "tasks.json"));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(tasksFile, null, 2) + "\n");
}

function asText(output: unknown, format: ResponseFormat, markdown: string): string {
  return format === "json" ? JSON.stringify(output, null, 2) : markdown;
}

const server = new McpServer({ name: SERVER_NAME, version: VERSION });

server.registerTool(
  "project_ops_init",
  {
    title: "Initialize Project Ops",
    description: "Create a project-local .project-ops skeleton for Alice Coding. Writes only inside .project-ops.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      project_name: z.string().optional().describe("Optional project display name."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, project_name, response_format }) => {
    const output = await initProjectOps(resolveProjectDir(project_dir), project_name);
    const markdown = [`# Project Ops Initialized`, "", `Project: ${output.project_dir}`, `Ops: ${output.ops_dir}`, "", "Created:", ...output.created.map((item) => `- ${item}`)].join("\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_status",
  {
    title: "Project Ops Status",
    description: "Inspect whether a project has .project-ops files and summarize counts. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, response_format }) => {
    const project = resolveProjectDir(project_dir);
    const root = opsDir(project);
    const docs = await collectDocs(project, "all");
    const tasks = await readTasks(project);
    const output = {
      project_dir: project,
      ops_dir: root,
      exists: existsSync(root),
      doc_count: docs.length,
      task_count: tasks.tasks.length,
      docs: docs.map(({ excerpt: _excerpt, ...doc }) => doc)
    };
    const markdown = [`# Project Ops Status`, "", `Exists: ${output.exists}`, `Docs: ${output.doc_count}`, `Tasks: ${output.task_count}`, `Ops: ${root}`].join("\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_search_docs",
  {
    title: "Search Project Ops Docs",
    description: "Search requirements, product docs, plans, decisions, learnings, project rules, and verification files. Read-only.",
    inputSchema: {
      query: z.string().min(1).max(200).describe("Case-insensitive search text."),
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      area: DocAreaSchema.default("all").describe("Area to search."),
      limit: z.number().int().min(1).max(50).default(10).describe("Maximum results."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ query, project_dir, area, limit, response_format }) => {
    const docs = await collectDocs(resolveProjectDir(project_dir), area);
    const results = docs.filter((doc) => matches(`${doc.title}\n${doc.relative_path}\n${doc.excerpt ?? ""}`, query)).slice(0, limit);
    const output = { query, count: results.length, results };
    const markdown = [`# Project Ops Search: ${query}`, "", ...results.flatMap((doc) => [`## ${doc.title}`, `- Area: ${doc.area}`, `- Path: ${doc.relative_path}`, doc.excerpt ? `\n${doc.excerpt}` : ""])].join("\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_read_doc",
  {
    title: "Read Project Ops Doc",
    description: "Read a document under .project-ops by relative path or area. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      relative_path: z.string().optional().describe("Path relative to .project-ops, e.g. plans/TASK-001.md."),
      area: DocAreaSchema.optional().describe("Fallback area file or directory to read when relative_path is omitted."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, relative_path, area, response_format }) => {
    const project = resolveProjectDir(project_dir);
    const root = opsDir(project);
    const target = relative_path ? path.join(root, relative_path) : area ? areaPath(project, area) : root;
    const safeTarget = await ensureInsideOps(project, target);
    const targetStat = await stat(safeTarget).catch(() => undefined);
    if (!targetStat) return { isError: true, content: [{ type: "text", text: `Not found: ${path.relative(root, safeTarget)}` }] };
    const docs = targetStat.isDirectory()
      ? await collectDocs(project, (area ?? "all") as DocArea)
      : [{ area: area ?? "all", path: safeTarget, relative_path: path.relative(root, safeTarget), title: path.basename(safeTarget), excerpt: await readText(safeTarget) }];
    const output = { project_dir: project, docs };
    const markdown = docs.map((doc) => `# ${doc.relative_path}\n\n${doc.excerpt ?? ""}`).join("\n\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_list_tasks",
  {
    title: "List Project Tasks",
    description: "List tasks from .project-ops/tasks.json. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      status: TaskStatusSchema.optional().describe("Optional task status filter."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, status, response_format }) => {
    const tasksFile = await readTasks(resolveProjectDir(project_dir));
    const tasks = status ? tasksFile.tasks.filter((task) => task.status === status) : tasksFile.tasks;
    const output = { count: tasks.length, tasks };
    const markdown = [`# Tasks`, "", ...tasks.map((task) => `- ${task.id} [${task.status}] ${task.title}`)].join("\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_update_task_status",
  {
    title: "Update Project Task Status",
    description: "Create or update a task in .project-ops/tasks.json. Writes only inside .project-ops.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      id: z.string().min(1).max(80).describe("Task id, e.g. TASK-001."),
      title: z.string().min(1).max(200).optional().describe("Task title, required when creating a new task."),
      status: TaskStatusSchema.describe("New task status."),
      plan: z.string().optional().describe("Plan path relative to .project-ops or project root."),
      notes: z.string().max(2000).optional().describe("Short task notes."),
      last_run: z.string().optional().describe("Last agent run directory or identifier."),
      owner: z.string().optional().describe("Agent or human owner."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, id, title, status, plan, notes, last_run, owner, response_format }) => {
    const project = resolveProjectDir(project_dir);
    await initProjectOps(project);
    const tasksFile = await readTasks(project);
    let task = tasksFile.tasks.find((item) => item.id === id);
    if (!task) {
      task = { id, title: title || id, status, updatedAt: now() };
      tasksFile.tasks.push(task);
    }
    task.title = title || task.title;
    task.status = status;
    if (plan !== undefined) task.plan = plan;
    if (notes !== undefined) task.notes = notes;
    if (last_run !== undefined) task.lastRun = last_run;
    if (owner !== undefined) task.owner = owner;
    task.updatedAt = now();
    await writeTasks(project, tasksFile);
    const output = { task };
    const markdown = `# Task Updated\n\n- ${task.id} [${task.status}] ${task.title}`;
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_create_plan",
  {
    title: "Create Project Plan",
    description: "Create a structured plan markdown file under .project-ops/plans and optionally upsert a task. Writes only inside .project-ops.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      task_id: z.string().optional().describe("Optional task id, e.g. TASK-001."),
      title: z.string().min(1).max(200).describe("Plan title."),
      goal: z.string().min(1).max(4000).describe("Goal section."),
      scope: z.string().max(4000).default("").describe("Scope section."),
      verification: z.string().max(4000).default("").describe("Verification section."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
  },
  async ({ project_dir, task_id, title, goal, scope, verification, response_format }) => {
    const project = resolveProjectDir(project_dir);
    await initProjectOps(project);
    const filename = `${task_id ? `${slug(task_id)}-` : ""}${slug(title)}.md`;
    const filePath = await ensureInsideOps(project, path.join(opsDir(project), "plans", filename));
    const content = [
      `# ${task_id ? `${task_id}: ` : ""}${title}`,
      "",
      "## Goal",
      "",
      goal,
      "",
      "## Scope",
      "",
      scope || "- To be refined.",
      "",
      "## Verification",
      "",
      verification || "- Run the smallest relevant verification from `.project-ops/verification.json`.",
      "",
      "## Definition of Done",
      "",
      "- Relevant files are updated.",
      "- Relevant verification passes or limitations are documented.",
      "- Task status and learnings are updated when appropriate.",
      ""
    ].join("\n");
    await writeFile(filePath, content);
    if (task_id) {
      const tasksFile = await readTasks(project);
      let task = tasksFile.tasks.find((item) => item.id === task_id);
      if (!task) {
        task = { id: task_id, title, status: "ready", plan: path.relative(opsDir(project), filePath), updatedAt: now() };
        tasksFile.tasks.push(task);
      } else {
        task.title = title;
        task.plan = path.relative(opsDir(project), filePath);
        task.updatedAt = now();
      }
      await writeTasks(project, tasksFile);
    }
    const output = { path: filePath, relative_path: path.relative(opsDir(project), filePath), content };
    const markdown = `# Plan Created\n\n${output.relative_path}`;
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_get_context_bundle",
  {
    title: "Get Project Context Bundle",
    description: "Return a concise bundle of project config, task, matching docs, decisions, learnings, rules, and verification. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      task_id: z.string().optional().describe("Task id to include."),
      query: z.string().optional().describe("Optional query for relevant docs."),
      doc_limit: z.number().int().min(1).max(30).default(12).describe("Maximum docs to include."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, task_id, query, doc_limit, response_format }) => {
    const project = resolveProjectDir(project_dir);
    const root = opsDir(project);
    const projectJson = await readText(path.join(root, "project.json"));
    const tasks = await readTasks(project);
    const task = task_id ? tasks.tasks.find((item) => item.id === task_id) : undefined;
    const docs = await collectDocs(project, "all");
    const relevantDocs = (query ? docs.filter((doc) => matches(`${doc.title}\n${doc.relative_path}\n${doc.excerpt ?? ""}`, query)) : docs).slice(0, doc_limit);
    const verification = await readText(path.join(root, "verification.json"));
    const output = {
      project_dir: project,
      project: projectJson ? JSON.parse(projectJson) : null,
      task,
      relevant_docs: relevantDocs,
      verification: verification ? JSON.parse(verification) : null
    };
    const markdown = [
      "# Project Context Bundle",
      "",
      task ? `Task: ${task.id} [${task.status}] ${task.title}` : "Task: none selected",
      "",
      "## Relevant Docs",
      "",
      ...relevantDocs.map((doc) => `### ${doc.relative_path}\n\n${doc.excerpt ?? ""}`)
    ].join("\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "project_ops_append_learning",
  {
    title: "Append Project Learning",
    description: "Append a structured learning to .project-ops/learnings.md. Writes only inside .project-ops.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      title: z.string().min(1).max(200).describe("Learning title."),
      body: z.string().min(1).max(6000).describe("What was learned."),
      task_id: z.string().optional().describe("Related task id."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
  },
  async ({ project_dir, title, body, task_id, response_format }) => {
    const project = resolveProjectDir(project_dir);
    await initProjectOps(project);
    const filePath = await ensureInsideOps(project, path.join(opsDir(project), "learnings.md"));
    const existing = (await readText(filePath)) ?? "# Learnings\n\n";
    const entry = [`## ${title}`, "", `- Date: ${now()}`, task_id ? `- Task: ${task_id}` : undefined, "", body, ""].filter(Boolean).join("\n");
    await writeFile(filePath, `${existing.trimEnd()}\n\n${entry}`);
    const output = { path: filePath, title, task_id };
    const markdown = `# Learning Appended\n\n${title}`;
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
