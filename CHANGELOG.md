# Changelog

## Unreleased

### Added

- `agent-runner` now supports `--skip-git-repo-check` for Codex and adds it automatically when `--cwd` is not inside a Git worktree.
- `vibe skill doctor <name>` to compare source skill templates with installed Codex skills.
- `vibe skill sync <name>` to sync `templates/skills/<name>` into the local Codex skills directory.
- `skill-improve` task template for improving and verifying skills.
- Alice Coding skill references for task-file execution, command usage, and MCP fallback behavior.

### Changed

- Documentation now explains non-Git task folders, skill maintenance, and the `skill-improve` workflow.

## v0.1.0

Initial public release.

### Added

- `vibe exec <task-file.md>` for task-file-driven closed-loop execution.
- `vibe task-template` for creating task files from built-in templates.
- `vibe check-task` for checking task file readiness before execution.
- Default rule: when `--cwd` is omitted, `vibe exec` uses the task file's parent directory as the working directory.
- Built-in templates for default tasks, web apps, bugfixes, docs, releases, and completion reports.
- A reusable Alice Coding skill template under `templates/skills/alice-coding`.
- Local-first project memory under `.project-ops/`.
- `vibe` CLI for init, bootstrap, ingest, task, task-template, check-task, plan, run, exec, review, learn, refs, rules, sync, update, and archive.
- `agent-runner` for launching Codex or Claude Code from generated plans.
- MCP servers for skills, project ops, verification, and GitHub references.
- Documentation for task-file workflows, quickstart, architecture, configuration, MCP servers, and common workflows.
