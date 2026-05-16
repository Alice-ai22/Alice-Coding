# Alice Coding v0.1.0

Alice Coding is a local-first AI coding workflow toolkit for Codex, Claude Code, and MCP-based project context.

Highlights:

- Start from a task file with `vibe exec <task-file.md>`.
- Create task files with `vibe task-template` and check them with `vibe check-task`.
- By default, the task file's parent directory is the Agent working directory.
- Use built-in templates for default tasks, web apps, bugfixes, docs, releases, and completion reports.
- Install or adapt the reusable Alice Coding skill template from `templates/skills/alice-coding`.
- Keep project memory, plans, verification, references, and learnings under `.project-ops/`.
- Launch Codex or Claude Code through `agent-runner`.
- Use MCP servers for skills, project context, verification selection, and GitHub references.

This is an early public version focused on making local Agent workflows repeatable, inspectable, and easier to explain.
