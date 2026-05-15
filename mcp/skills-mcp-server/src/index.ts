#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SERVER_NAME = "skills-mcp-server";
const VERSION = "0.1.0";
const MAX_FILE_BYTES = 512 * 1024;

type ResponseFormat = "markdown" | "json";

type SkillSource = "codex" | "claude" | "shared" | "custom";

interface SkillRecord {
  id: string;
  name: string;
  description: string;
  path: string;
  relativePath: string;
  root: string;
  source: SkillSource;
  plugin?: string;
}

interface SkillSummary {
  id: string;
  name: string;
  description: string;
  source: SkillSource;
  plugin?: string;
  path: string;
  relative_path: string;
  root: string;
}

interface RootInfo {
  root: string;
  source: SkillSource;
  exists: boolean;
}

const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");

function homePath(...segments: string[]): string {
  return path.join(os.homedir(), ...segments);
}

function configuredRoots(): RootInfo[] {
  const fromEnv = process.env.SKILLS_MCP_ROOTS?.trim();
  if (fromEnv) {
    return fromEnv
      .split(path.delimiter)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => ({
        root: path.resolve(entry.replace(/^~(?=$|\/)/, os.homedir())),
        source: sourceForPath(entry)
      }))
      .map((info) => ({ ...info, exists: existsSync(info.root) }));
  }

  const defaults: Array<Omit<RootInfo, "exists">> = [
    { root: homePath(".codex", "skills"), source: "codex" },
    { root: homePath(".codex", "plugins", "cache"), source: "codex" },
    { root: homePath(".codex", "vendor_imports", "skills"), source: "codex" },
    { root: homePath(".claude", "skills"), source: "claude" },
    { root: homePath(".claude", "plugins"), source: "claude" },
    { root: homePath(".cc-switch", "skills"), source: "shared" }
  ];

  return defaults.map((info) => ({ ...info, exists: existsSync(info.root) }));
}

function sourceForPath(inputPath: string): SkillSource {
  if (inputPath.includes(".claude")) return "claude";
  if (inputPath.includes(".codex")) return "codex";
  if (inputPath.includes(".cc-switch")) return "shared";
  return "custom";
}

function shouldSkipDirectory(dirPath: string): boolean {
  if (process.env.SKILLS_MCP_INCLUDE_TMP === "1") return false;
  const normalized = dirPath.split(path.sep).join("/");
  return normalized.includes("/.codex/.tmp/");
}

async function findSkillFiles(root: string): Promise<string[]> {
  const found: string[] = [];

  async function walk(dir: string): Promise<void> {
    if (shouldSkipDirectory(dir)) return;

    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === "SKILL.md") {
        found.push(fullPath);
      }
    }
  }

  await walk(root);
  return found;
}

function parseFrontmatter(markdown: string): { name?: string; description?: string } {
  if (!markdown.startsWith("---\n")) return {};
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) return {};

  const metadata: Record<string, string> = {};
  for (const line of markdown.slice(4, end).split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    metadata[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }

  return {
    name: metadata.name,
    description: metadata.description
  };
}

function pluginName(relativePath: string): string | undefined {
  const parts = relativePath.split(path.sep).filter(Boolean);
  const skillsIndex = parts.lastIndexOf("skills");
  if (skillsIndex > 0) return parts[skillsIndex - 1];
  if (parts.length > 2) return parts[0];
  return undefined;
}

function skillId(source: SkillSource, skillPath: string): string {
  const base = path.basename(path.dirname(skillPath)).toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  const hash = createHash("sha1").update(skillPath).digest("hex").slice(0, 10);
  return `${source}:${base}:${hash}`;
}

async function scanSkills(): Promise<SkillRecord[]> {
  const roots = configuredRoots().filter((root) => root.exists);
  const byRealPath = new Map<string, SkillRecord>();

  for (const rootInfo of roots) {
    const rootReal = await realpath(rootInfo.root).catch(() => rootInfo.root);
    const files = await findSkillFiles(rootReal);

    for (const file of files) {
      const realFile = await realpath(file).catch(() => file);
      if (byRealPath.has(realFile)) continue;

      const fileStat = await stat(realFile).catch(() => undefined);
      if (!fileStat?.isFile() || fileStat.size > MAX_FILE_BYTES) continue;

      const markdown = await readFile(realFile, "utf8").catch(() => "");
      const metadata = parseFrontmatter(markdown);
      const fallbackName = path.basename(path.dirname(realFile));
      const relativePath = path.relative(rootReal, realFile);

      byRealPath.set(realFile, {
        id: skillId(rootInfo.source, realFile),
        name: metadata.name || fallbackName,
        description: metadata.description || "",
        path: realFile,
        relativePath,
        root: rootReal,
        source: rootInfo.source,
        plugin: pluginName(relativePath)
      });
    }
  }

  return [...byRealPath.values()].sort((a, b) =>
    `${a.source}:${a.name}:${a.path}`.localeCompare(`${b.source}:${b.name}:${b.path}`)
  );
}

function paginate<T>(items: T[], limit: number, offset: number) {
  const page = items.slice(offset, offset + limit);
  return {
    total_count: items.length,
    count: page.length,
    offset,
    items: page,
    has_more: offset + page.length < items.length,
    next_offset: offset + page.length < items.length ? offset + page.length : null
  };
}

function formatSkillList(result: ReturnType<typeof paginate<SkillSummary>>, title: string, format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(result, null, 2);

  const lines = [
    `# ${title}`,
    "",
    `Total: ${result.total_count}; showing ${result.count} from offset ${result.offset}.`,
    ""
  ];

  for (const skill of result.items) {
    lines.push(`## ${skill.name}`);
    lines.push(`- ID: ${skill.id}`);
    lines.push(`- Source: ${skill.source}${skill.plugin ? ` / ${skill.plugin}` : ""}`);
    if (skill.description) lines.push(`- Description: ${skill.description}`);
    lines.push(`- Path: ${skill.path}`);
    lines.push("");
  }

  if (result.has_more) lines.push(`Next offset: ${result.next_offset}`);
  return lines.join("\n");
}

function skillSummary(skill: SkillRecord): SkillSummary {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    source: skill.source,
    plugin: skill.plugin,
    path: skill.path,
    relative_path: skill.relativePath,
    root: skill.root
  };
}

function matchesQuery(skill: SkillRecord, query: string): boolean {
  const normalized = query.toLowerCase();
  return [
    skill.id,
    skill.name,
    skill.description,
    skill.source,
    skill.plugin ?? "",
    skill.path,
    skill.relativePath
  ].some((value) => value.toLowerCase().includes(normalized));
}

async function assertAllowedPath(candidate: string): Promise<string> {
  const resolved = await realpath(path.resolve(candidate));
  const roots = configuredRoots().filter((root) => root.exists);

  for (const root of roots) {
    const rootReal = await realpath(root.root).catch(() => root.root);
    const relative = path.relative(rootReal, resolved);
    if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) return resolved;
    if (relative === "") return resolved;
  }

  throw new Error("Path is outside configured skill roots. Add it to SKILLS_MCP_ROOTS if you want this server to expose it.");
}

async function resolveSkill(identifier: string, skills: SkillRecord[]): Promise<SkillRecord> {
  const byId = skills.find((skill) => skill.id === identifier);
  if (byId) return byId;

  const byName = skills.filter((skill) => skill.name === identifier || path.basename(path.dirname(skill.path)) === identifier);
  if (byName.length === 1) return byName[0];
  if (byName.length > 1) {
    throw new Error(`Multiple skills match "${identifier}". Use one of these ids: ${byName.map((skill) => skill.id).join(", ")}`);
  }

  if (identifier.includes(path.sep) || identifier.endsWith("SKILL.md")) {
    const safePath = await assertAllowedPath(identifier);
    const byPath = skills.find((skill) => skill.path === safePath);
    if (byPath) return byPath;
  }

  throw new Error(`No skill found for "${identifier}". Use skills_search first, then pass an exact id to skills_read.`);
}

const server = new McpServer({
  name: SERVER_NAME,
  version: VERSION
});

server.registerTool(
  "skills_roots",
  {
    title: "Show Skill Scan Roots",
    description: "Show the configured local directories scanned for SKILL.md files. This is read-only.",
    inputSchema: {
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ response_format }) => {
    const roots = configuredRoots();
    const output = { roots };
    const text =
      response_format === "json"
        ? JSON.stringify(output, null, 2)
        : ["# Skill Roots", "", ...roots.map((root) => `- ${root.exists ? "ok" : "missing"} ${root.source}: ${root.root}`)].join("\n");

    return {
      content: [{ type: "text", text }],
      structuredContent: output
    };
  }
);

server.registerTool(
  "skills_list",
  {
    title: "List Skills",
    description: "List indexed Codex and Claude Code skills with pagination. Use this before reading a skill when you need broad discovery.",
    inputSchema: {
      source: z.enum(["codex", "claude", "shared", "custom", "all"]).default("all").describe("Filter by source."),
      limit: z.number().int().min(1).max(100).default(25).describe("Maximum skills to return."),
      offset: z.number().int().min(0).default(0).describe("Pagination offset."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ source, limit, offset, response_format }) => {
    const skills = (await scanSkills()).filter((skill) => source === "all" || skill.source === source);
    const result = paginate(skills.map(skillSummary), limit, offset);
    return {
      content: [{ type: "text", text: formatSkillList(result, "Skills", response_format) }],
      structuredContent: result
    };
  }
);

server.registerTool(
  "skills_search",
  {
    title: "Search Skills",
    description: "Search installed skills by name, description, source, plugin label, or path. This is read-only and returns matching skill ids for skills_read.",
    inputSchema: {
      query: z.string().min(1).max(200).describe("Case-insensitive search text."),
      source: z.enum(["codex", "claude", "shared", "custom", "all"]).default("all").describe("Filter by source."),
      limit: z.number().int().min(1).max(100).default(25).describe("Maximum skills to return."),
      offset: z.number().int().min(0).default(0).describe("Pagination offset."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ query, source, limit, offset, response_format }) => {
    const skills = (await scanSkills()).filter((skill) => (source === "all" || skill.source === source) && matchesQuery(skill, query));
    const result = paginate(skills.map(skillSummary), limit, offset);
    return {
      content: [{ type: "text", text: formatSkillList(result, `Skill Search: ${query}`, response_format) }],
      structuredContent: result
    };
  }
);

server.registerTool(
  "skills_read",
  {
    title: "Read Skill",
    description: "Read a single SKILL.md by exact id, unique name, or path under configured roots. Use ids returned by skills_list or skills_search for best results.",
    inputSchema: {
      identifier: z.string().min(1).max(1000).describe("Skill id, exact unique skill name, or SKILL.md path under a configured root."),
      include_content: z.boolean().default(true).describe("When false, return metadata only."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ identifier, include_content, response_format }) => {
    try {
      const skills = await scanSkills();
      const skill = await resolveSkill(identifier, skills);
      const markdown = include_content ? await readFile(skill.path, "utf8") : undefined;
      const output = {
        skill: skillSummary(skill),
        content: markdown
      };

      const text =
        response_format === "json"
          ? JSON.stringify(output, null, 2)
          : [
              `# ${skill.name}`,
              "",
              skill.description ? `${skill.description}\n` : "",
              `- ID: ${skill.id}`,
              `- Source: ${skill.source}${skill.plugin ? ` / ${skill.plugin}` : ""}`,
              `- Path: ${skill.path}`,
              "",
              include_content ? "## SKILL.md\n" : "",
              include_content ? markdown : ""
            ].join("\n");

      return {
        content: [{ type: "text", text }],
        structuredContent: output
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error while reading skill.";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }]
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
