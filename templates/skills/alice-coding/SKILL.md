---
name: alice-coding
description: Use when working with Alice Coding, vibe CLI, agent-runner, project-ops, verification, reference MCP, local AI coding workflows, task files, project memory, Codex/Claude Code closed-loop execution, local skill installation, or the Alice Coding repository.
---

# Alice Coding

## Purpose

Use this skill to operate Alice Coding's local-first AI coding workflow. Alice Coding coordinates task files, project memory, planning, skills, MCP tools, verification, references, agent execution, run logs, and learnings.

Core loop:

```text
task file -> working directory -> context -> plan -> agent execution -> verification -> summary/learnings
```

## Primary User Flow

Default rule: **the task file's parent directory is the working directory**.

If the user gives a task file path and no explicit working directory, work in the folder containing that task file.

If the user gives both a task file and a working directory, use the explicit working directory.

If the user only pastes task content with no file path and no working directory, ask them to either save the task into the folder where AI should work or provide a target working directory.

For the task-file execution pattern, read `references/task-file-workflow.md`. For command examples, read `references/commands.md`.

## Path Boundary

Keep these roots separate:

- Source repository or kit template root: the Alice Coding checkout containing `cli/`, `mcp/`, `templates/`, and docs.
- Installed Codex skill root: usually `~/.codex/skills/alice-coding`.
- Target project root: the folder where the user's task should be executed.

When a task mentions Alice Coding itself, resolve the intended root from the user's path, the task file path, or an explicit instruction before editing. Do not switch between source templates, installed skills, and target projects by memory or similarity.

## Workflow Decision Tree

1. If the user provides a task file path, resolve it first.
2. If no explicit `--cwd` or working directory is provided, use the task file's parent directory as the working directory.
3. If the task targets Alice Coding itself, identify whether it targets the source repository, an installed skill, or a target project.
4. If the working directory contains `.project-ops/`, gather project context before changing code. Prefer project-ops MCP tools when available; otherwise inspect `.project-ops/` files directly.
5. If the user has a task idea but no task file, suggest `vibe task-template <name> <task-file.md>` and have them fill it in.
6. If the user wants a new product folder and has not created a task file yet, suggest `vibe start <folder> [template]` to create `task.md` and `.project-ops/` together.
7. If the user provides a task file, run `vibe check-task <task-file>` before execution unless the user explicitly asks for inspection only or the file is clearly not meant to execute.
8. Before real closed-loop execution, run `vibe exec <task-file> --agent <agent> --mode <mode> --dry-run` and inspect the generated command, working directory, plan path, risk assessment, and execution mode.
9. If the dry-run is reasonable and the user requested execution, run `vibe exec <task-file> --agent codex --mode workspace` for normal local edits. Use `read-only` for review-only tasks and reserve `full-auto` for explicit broad autonomy.
10. After an agent run, use `vibe report --last-run --cwd <project>` when the user needs a standard completion report.
11. If the user asks for a task-id workflow, use `vibe status`, `vibe task`, `vibe plan`, and `vibe run` as appropriate.
12. If code, docs, config, or workflow behavior changes, choose the smallest relevant verification and record or summarize the result.
13. If the work creates reusable workflow knowledge, append it to project learnings when a project task context exists.

## Command Use

Fast path from a task file:

```bash
vibe task-template list
vibe start <project-folder> web-app
vibe task-template default <task-file.md>
vibe check-task <task-file.md>
vibe exec <task-file.md> --agent codex --mode workspace --dry-run
vibe exec <task-file.md> --agent codex --mode workspace
vibe report --last-run --cwd <project-folder>
```

Create a task file from a template:

```bash
vibe task-template list
vibe task-template default ./task.md
vibe task-template web-app ./task.md
```

Explicit working directory:

```bash
vibe exec <task-file.md> --cwd <project> --agent codex --mode workspace
```

Read `references/commands.md` for common command families.

## MCP Guidance

When MCP tools are available, prefer them over manual file reading for:

- skills search/read
- project context bundles, docs, tasks, decisions, learnings
- verification command selection and recording
- GitHub reference search/fetch/add

If MCP tools are unavailable, use the same workflow by reading files and running CLI commands directly. Do not block on MCP availability.

Read `references/mcp.md` for tool intent and fallback behavior.

## Dry-Run Gate

Use dry-run output as a gate before starting an autonomous run. Confirm that:

- `--cwd` is either explicit or equals the task file's parent directory.
- The generated plan is under the intended project's `.project-ops/plans/`.
- The task quality score and risk assessment are acceptable for the requested mode.
- The selected mode matches the requested risk level.
- The command will call the intended `agent-runner` entrypoint.

## Verification

Before claiming completion, verify the changed surface:

- `vibe exec` behavior: run a dry-run smoke check with a temporary task file.
- CLI or MCP code: run the package's build/test/smoke command when available.
- Docs/templates: check commands, path accuracy, and public/private boundary.
- Workflow tasks: run dry-run previews before real closed-loop execution when appropriate.

Keep verification small but real. Report what ran and what was not run.

Minimum useful verification examples:

- Task file or workflow docs: `vibe check-task <task-file>` and `vibe exec <task-file> --agent codex --mode workspace --dry-run`.
- `vibe` or `agent-runner` JavaScript: `node --check <entrypoint>` plus the narrow command smoke check touched by the change.
- MCP TypeScript servers: the package build command, or `npm run build` inside the changed MCP package.
- Markdown-only skill/reference edits: review headings, command examples, public/private boundaries, and any referenced paths.

## Recording Results

When `.project-ops/` exists, prefer project-ops and verification MCP tools to record task status, verification results, and reusable learnings. If the task has no stable task id, summarize the checks in the final response and only append learnings when they are generally reusable.

Do not write secrets, private tokens, or machine-specific credentials into project docs, run logs, skill references, or learnings.
