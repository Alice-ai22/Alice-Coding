---
name: alice-coding
description: Use when working with Alice Coding, vibe CLI, agent-runner, project-ops, verification, reference MCP, local AI coding workflows, task files, project memory, Codex/Claude Code closed-loop execution, or the Alice Coding repository.
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

## Workflow Decision Tree

1. If the user provides a task file path, resolve it first.
2. If no explicit `--cwd` or working directory is provided, use the task file's parent directory as the working directory.
3. If the working directory contains `.project-ops/`, gather project context before changing code. Prefer project-ops MCP tools when available; otherwise inspect `.project-ops/` files directly.
4. If the user asks for closed-loop execution from a task file, prefer `vibe exec <task-file> --agent codex --mode workspace`.
5. If the user asks for a task-id workflow, use `vibe status`, `vibe task`, `vibe plan`, and `vibe run` as appropriate.
6. If code, docs, config, or workflow behavior changes, choose the smallest relevant verification and record or summarize the result.
7. If the work creates reusable workflow knowledge, append it to project learnings when a project task context exists.

## Command Use

Fast path from a task file:

```bash
vibe check-task <task-file.md>
vibe exec <task-file.md> --agent codex --mode workspace --dry-run
vibe exec <task-file.md> --agent codex --mode workspace
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

## Verification

Before claiming completion, verify the changed surface:

- `vibe exec` behavior: run a dry-run smoke check with a temporary task file.
- CLI or MCP code: run the package's build/test/smoke command when available.
- Docs/templates: check commands, path accuracy, and public/private boundary.
- Workflow tasks: run dry-run previews before real closed-loop execution when appropriate.

Keep verification small but real. Report what ran and what was not run.
