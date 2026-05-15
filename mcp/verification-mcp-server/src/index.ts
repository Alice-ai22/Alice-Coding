#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SERVER_NAME = "verification-mcp-server";
const VERSION = "0.1.0";

type ResponseFormat = "markdown" | "json";
type VerificationMatrix = Record<string, string[]>;

const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");

function projectDir(input?: string): string {
  return path.resolve(input || process.cwd());
}

async function readJson(filePath: string): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return undefined;
  }
}

async function readMatrix(project: string): Promise<VerificationMatrix> {
  const fromOps = await readJson(path.join(project, ".project-ops", "verification.json"));
  if (fromOps && typeof fromOps === "object" && !Array.isArray(fromOps)) return fromOps as VerificationMatrix;

  const packageJson = await readJson(path.join(project, "package.json")) as { scripts?: Record<string, string> } | undefined;
  const scripts = packageJson?.scripts ?? {};
  const matrix: VerificationMatrix = {};
  if (scripts.lint) matrix.frontend = ["npm run lint"];
  if (scripts.build) matrix.build = ["npm run build"];
  if (scripts.test) matrix.test = ["npm test"];
  if (scripts["test:e2e"]) matrix.e2e = ["npm run test:e2e"];
  return matrix;
}

function scoreCategory(category: string, query: string, files: string[]): number {
  const haystack = `${category} ${query} ${files.join(" ")}`.toLowerCase();
  let score = 0;
  if (/(frontend|ui|react|vue|css|page|component|web|vite|next)/.test(haystack) && /(front|build|lint|e2e)/.test(category)) score += 4;
  if (/(backend|api|server|python|service|db|database)/.test(haystack) && /(back|test|api)/.test(category)) score += 4;
  if (/(test|bug|fix|regression)/.test(haystack) && /(test|smoke)/.test(category)) score += 3;
  if (/(doc|readme|markdown|content)/.test(haystack) && /(doc|smoke)/.test(category)) score += 3;
  if (category.includes("lint")) score += 1;
  if (category.includes("build")) score += 1;
  return score;
}

function selectCommands(matrix: VerificationMatrix, query = "", files: string[] = [], maxCommands = 5) {
  const ranked = Object.entries(matrix)
    .filter(([, commands]) => Array.isArray(commands) && commands.length > 0)
    .map(([category, commands]) => ({ category, commands, score: scoreCategory(category.toLowerCase(), query, files) }))
    .sort((a, b) => b.score - a.score || a.category.localeCompare(b.category));

  const selected = (ranked.some((item) => item.score > 0) ? ranked.filter((item) => item.score > 0) : ranked)
    .flatMap((item) => item.commands.map((command) => ({ category: item.category, command, reason: item.score > 0 ? "Matched task context" : "Default available verification" })))
    .slice(0, maxCommands);

  return selected;
}

function text(output: unknown, format: ResponseFormat, markdown: string): string {
  return format === "json" ? JSON.stringify(output, null, 2) : markdown;
}

const server = new McpServer({ name: SERVER_NAME, version: VERSION });

server.registerTool(
  "verification_matrix",
  {
    title: "Read Verification Matrix",
    description: "Read verification commands from .project-ops/verification.json or infer from package.json. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, response_format }) => {
    const project = projectDir(project_dir);
    const matrix = await readMatrix(project);
    const output = { project_dir: project, matrix };
    const markdown = ["# Verification Matrix", "", ...Object.entries(matrix).map(([key, commands]) => `## ${key}\n${commands.map((cmd) => `- ${cmd}`).join("\n")}`)].join("\n\n");
    return { content: [{ type: "text", text: text(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "verification_select",
  {
    title: "Select Verification Commands",
    description: "Select the smallest relevant verification commands for a task. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      task: z.string().optional().describe("Task title, id, or goal."),
      changed_files: z.array(z.string()).default([]).describe("Known changed or target files."),
      max_commands: z.number().int().min(1).max(20).default(5).describe("Maximum commands to return."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, task, changed_files, max_commands, response_format }) => {
    const project = projectDir(project_dir);
    const matrix = await readMatrix(project);
    const commands = selectCommands(matrix, task ?? "", changed_files, max_commands);
    const output = { project_dir: project, task, commands };
    const markdown = ["# Selected Verification", "", ...commands.map((item) => `- \`${item.command}\` (${item.category}): ${item.reason}`)].join("\n");
    return { content: [{ type: "text", text: text(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "verification_record",
  {
    title: "Record Verification Result",
    description: "Record verification commands and outcomes into .agent-runs/<run>/verification.md or .project-ops/verification-history.md.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      run_name: z.string().optional().describe("Optional .agent-runs run directory name."),
      summary: z.string().min(1).max(8000).describe("Verification summary and outcomes."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
  },
  async ({ project_dir, run_name, summary, response_format }) => {
    const project = projectDir(project_dir);
    const target = run_name
      ? path.join(project, ".agent-runs", run_name, "verification.md")
      : path.join(project, ".project-ops", "verification-history.md");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, `# Verification\n\n- Date: ${new Date().toISOString()}\n\n${summary}\n`);
    const output = { path: target };
    return { content: [{ type: "text", text: text(output, response_format, `# Verification Recorded\n\n${target}`) }], structuredContent: output };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
