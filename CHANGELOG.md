# Changelog

## v0.1.0

Initial public release.

### Added

- `vibe exec <task-file.md>` for task-file-driven closed-loop execution.
- Default rule: when `--cwd` is omitted, `vibe exec` uses the task file's parent directory as the working directory.
- Local-first project memory under `.project-ops/`.
- `vibe` CLI for init, bootstrap, ingest, task, plan, run, exec, review, learn, refs, rules, sync, update, and archive.
- `agent-runner` for launching Codex or Claude Code from generated plans.
- MCP servers for skills, project ops, verification, and GitHub references.
- Documentation for task-file workflows, quickstart, architecture, configuration, MCP servers, and common workflows.
