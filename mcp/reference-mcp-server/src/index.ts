#!/usr/bin/env node

import { Buffer } from "node:buffer";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SERVER_NAME = "reference-mcp-server";
const VERSION = "0.1.0";

type ResponseFormat = "markdown" | "json";

interface ReferenceItem {
  id: string;
  url: string;
  full_name?: string;
  name?: string;
  description?: string;
  stars?: number;
  language?: string | null;
  license?: string | null;
  why?: string;
  risks?: string[];
  addedAt: string;
}

const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");

function projectDir(input?: string): string {
  return path.resolve(input || process.cwd());
}

function refsDir(project: string): string {
  return path.join(project, ".project-ops", "references");
}

function refsIndex(project: string): string {
  return path.join(refsDir(project), "reference-index.json");
}

function now(): string {
  return new Date().toISOString();
}

function idFromUrl(url: string): string {
  const match = url.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/#?]+?)(?:\.git)?(?:[/?#].*)?$/);
  if (!match?.groups) return url.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return `${match.groups.owner}-${match.groups.repo}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

function parseGithubUrl(urlOrFullName: string): { owner: string; repo: string } {
  const trimmed = urlOrFullName.trim().replace(/\.git$/, "");
  const urlMatch = trimmed.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/#?]+)/);
  if (urlMatch?.groups) return { owner: urlMatch.groups.owner, repo: urlMatch.groups.repo };
  const fullName = trimmed.match(/^(?<owner>[^/\s]+)\/(?<repo>[^/\s]+)$/);
  if (fullName?.groups) return { owner: fullName.groups.owner, repo: fullName.groups.repo };
  throw new Error("Expected GitHub URL or owner/repo.");
}

async function githubJson(url: string): Promise<any> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "vibe-reference-mcp"
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status} ${response.statusText}`);
  return response.json();
}

async function readReferences(project: string): Promise<ReferenceItem[]> {
  try {
    const parsed = JSON.parse(await readFile(refsIndex(project), "utf8"));
    return Array.isArray(parsed.references) ? parsed.references : [];
  } catch {
    return [];
  }
}

async function writeReferences(project: string, references: ReferenceItem[]): Promise<void> {
  await mkdir(refsDir(project), { recursive: true });
  await writeFile(refsIndex(project), JSON.stringify({ references }, null, 2) + "\n");
}

function asText(output: unknown, format: ResponseFormat, markdown: string): string {
  return format === "json" ? JSON.stringify(output, null, 2) : markdown;
}

function summarizeRepo(repo: any) {
  return {
    full_name: repo.full_name,
    url: repo.html_url,
    description: repo.description ?? "",
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    language: repo.language ?? null,
    license: repo.license?.spdx_id ?? repo.license?.name ?? null,
    updated_at: repo.updated_at,
    topics: repo.topics ?? []
  };
}

const server = new McpServer({ name: SERVER_NAME, version: VERSION });

server.registerTool(
  "reference_search_github",
  {
    title: "Search GitHub References",
    description: "Search public GitHub repositories for potential project references. Read-only; does not clone or install.",
    inputSchema: {
      query: z.string().min(1).max(200).describe("GitHub repository search query."),
      language: z.string().optional().describe("Optional language filter, e.g. TypeScript."),
      min_stars: z.number().int().min(0).default(100).describe("Minimum star count."),
      limit: z.number().int().min(1).max(20).default(5).describe("Maximum results."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  async ({ query, language, min_stars, limit, response_format }) => {
    const q = [`${query}`, `stars:>=${min_stars}`];
    if (language) q.push(`language:${language}`);
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q.join(" "))}&sort=stars&order=desc&per_page=${limit}`;
    try {
      const data = await githubJson(url);
      const results = (data.items ?? []).slice(0, limit).map(summarizeRepo);
      const output = { query, count: results.length, results };
      const markdown = ["# GitHub Reference Search", "", ...results.map((repo: any) => `## ${repo.full_name}\n- URL: ${repo.url}\n- Stars: ${repo.stars}\n- Language: ${repo.language ?? "unknown"}\n- License: ${repo.license ?? "unknown"}\n- Description: ${repo.description}`)].join("\n\n");
      return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown GitHub search error.";
      return { isError: true, content: [{ type: "text", text: `Error: ${message}` }] };
    }
  }
);

server.registerTool(
  "reference_fetch_github",
  {
    title: "Fetch GitHub Reference",
    description: "Fetch repository metadata plus README/package.json when available. Read-only; does not clone.",
    inputSchema: {
      repository: z.string().min(1).max(300).describe("GitHub URL or owner/repo."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  async ({ repository, response_format }) => {
    try {
      const { owner, repo } = parseGithubUrl(repository);
      const metadata = summarizeRepo(await githubJson(`https://api.github.com/repos/${owner}/${repo}`));
      let readme = "";
      let packageJson: unknown = undefined;
      try {
        const readmeData = await githubJson(`https://api.github.com/repos/${owner}/${repo}/readme`);
        readme = Buffer.from(readmeData.content ?? "", "base64").toString("utf8").slice(0, 5000);
      } catch {}
      try {
        const pkg = await githubJson(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`);
        packageJson = JSON.parse(Buffer.from(pkg.content ?? "", "base64").toString("utf8"));
      } catch {}
      const output = { repository: metadata, readme_excerpt: readme, package_json: packageJson };
      const markdown = [`# ${metadata.full_name}`, "", `URL: ${metadata.url}`, `Stars: ${metadata.stars}`, `License: ${metadata.license ?? "unknown"}`, "", "## README Excerpt", "", readme || "No README fetched."].join("\n");
      return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown GitHub fetch error.";
      return { isError: true, content: [{ type: "text", text: `Error: ${message}` }] };
    }
  }
);

server.registerTool(
  "reference_add",
  {
    title: "Add Project Reference",
    description: "Register an external reference project in .project-ops/references. Writes only project reference metadata.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      url: z.string().url().describe("Reference URL."),
      why: z.string().min(1).max(1000).describe("Why this reference is relevant."),
      full_name: z.string().optional().describe("Optional repository full name."),
      description: z.string().optional().describe("Optional description."),
      stars: z.number().int().optional().describe("Optional star count."),
      language: z.string().nullable().optional().describe("Optional language."),
      license: z.string().nullable().optional().describe("Optional license."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, url, why, full_name, description, stars, language, license, response_format }) => {
    const project = projectDir(project_dir);
    const references = await readReferences(project);
    const id = idFromUrl(url);
    const existing = references.find((item) => item.id === id || item.url === url);
    const item: ReferenceItem = {
      id,
      url,
      full_name,
      name: full_name?.split("/").pop(),
      description,
      stars,
      language,
      license,
      why,
      risks: license ? [] : ["License unknown; review before reusing code."],
      addedAt: existing?.addedAt ?? now()
    };
    if (existing) Object.assign(existing, item);
    else references.push(item);
    await writeReferences(project, references);
    const notePath = path.join(refsDir(project), `${id}.md`);
    await writeFile(notePath, [`# ${full_name ?? id}`, "", `URL: ${url}`, "", `Why: ${why}`, "", `License: ${license ?? "unknown"}`, "", "Do not copy code blindly; use as design/architecture reference only.", ""].join("\n"));
    const output = { reference: existing ?? item, note_path: notePath };
    return { content: [{ type: "text", text: asText(output, response_format, `# Reference Added\n\n${url}`) }], structuredContent: output };
  }
);

server.registerTool(
  "reference_list",
  {
    title: "List Project References",
    description: "List registered project references from .project-ops/references. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, response_format }) => {
    const project = projectDir(project_dir);
    const references = await readReferences(project);
    const output = { count: references.length, references };
    const markdown = ["# Project References", "", ...references.map((ref) => `- ${ref.id}: ${ref.url}\n  - Why: ${ref.why ?? ""}\n  - License: ${ref.license ?? "unknown"}`)].join("\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

server.registerTool(
  "reference_context",
  {
    title: "Get Reference Context",
    description: "Return registered references as compact context for implementation agents. Read-only.",
    inputSchema: {
      project_dir: z.string().optional().describe("Project directory. Defaults to server working directory."),
      query: z.string().optional().describe("Optional filter text."),
      response_format: ResponseFormatSchema.describe("Output format: markdown or json.")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ project_dir, query, response_format }) => {
    const project = projectDir(project_dir);
    const references = (await readReferences(project)).filter((ref) => {
      if (!query) return true;
      return `${ref.id} ${ref.url} ${ref.full_name ?? ""} ${ref.description ?? ""} ${ref.why ?? ""}`.toLowerCase().includes(query.toLowerCase());
    });
    const output = { references };
    const markdown = ["# Reference Context", "", "Use these for patterns and tradeoffs only. Do not copy code without license review.", "", ...references.map((ref) => `## ${ref.full_name ?? ref.id}\n- URL: ${ref.url}\n- Why: ${ref.why ?? ""}\n- License: ${ref.license ?? "unknown"}\n- Risks: ${(ref.risks ?? []).join("; ") || "None recorded"}`)].join("\n");
    return { content: [{ type: "text", text: asText(output, response_format, markdown) }], structuredContent: output };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
