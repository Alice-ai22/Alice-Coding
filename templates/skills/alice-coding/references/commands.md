# Alice Coding Commands

Use these commands from any target project with `--cwd <project>`, or use `vibe exec` directly with a task file.

## Fast Path: Task File Execution

Default rule: when `--cwd` is omitted, the task file's parent directory is the working directory.

Run the dry-run form before real execution when the command will start an autonomous agent. Inspect the printed `agent-runner` command and confirm the generated plan path, `--cwd`, `--agent`, and `--mode` are correct.

`vibe exec` is the task-file fast path. It creates a plan under the target project's `.project-ops/plans/` and then calls `agent-runner <agent> <plan.md> --cwd <project>`. Use `agent-runner` directly when a plan file already exists.

```bash
vibe start <project-folder> web-app
vibe task-template list
vibe task-template default <task-file.md>
vibe task-template web-app <task-file.md>
vibe task-template skill-improve <task-file.md>
vibe check-task <task-file.md>
vibe exec <task-file.md> --agent codex --mode workspace --dry-run
vibe exec <task-file.md> --agent codex --mode workspace
vibe exec <task-file.md> --cwd <project> --agent codex --mode workspace
vibe report --last-run --cwd <project>
```

Use this when the user creates a folder, places a task file inside it, and wants AI to create or modify the project in that same folder.

Use `vibe start <project-folder> [template]` when the user has chosen a folder but has not created `task.md` yet. It creates the folder, a starter task file, and `.project-ops/`.

Use `vibe check-task` before real execution. It returns a 100-point task quality score, missing sections, warning signals, and concrete suggestions.

## Skill Maintenance

```bash
vibe skill doctor alice-coding
vibe skill sync alice-coding
```

Use `doctor` to compare `templates/skills/<name>` with the installed skill under `~/.codex/skills/<name>`. Use `sync` after reviewing local template changes and confirming they are safe to install.

## Inspect

```bash
vibe status --cwd <project>
vibe task list --cwd <project>
vibe task next --cwd <project>
vibe refs list --cwd <project>
```

## Initialize and Ingest

```bash
vibe init --cwd <project>
vibe bootstrap --cwd <project> --fix
vibe ingest <file> --type requirements --cwd <project>
vibe ingest <file> --type product --cwd <project>
vibe index --cwd <project>
```

## Plan and Tasks

```bash
vibe task create TASK-001 "Title" --goal "Goal" --cwd <project>
vibe plan TASK-001 "Title" --goal "Goal" --cwd <project>
vibe issue TASK-001 --cwd <project>
vibe pr TASK-001 --cwd <project>
```

## Closed-Loop Execution

```bash
vibe run TASK-001 --agent codex --mode read-only --cwd <project> --dry-run
vibe run TASK-001 --agent codex --mode workspace --cwd <project>
vibe run TASK-001 --agent claude --mode workspace --cwd <project>
agent-runner codex <plan.md> --cwd <project>
agent-runner claude <plan.md> --cwd <project>
```

Use `read-only` for inspection, `workspace` for normal project edits, and `full-auto` only when the user explicitly wants broad autonomous execution.

## Review and Learning

```bash
vibe review TASK-001 --agent claude --cwd <project>
vibe report --last-run --cwd <project>
vibe learn TASK-001 --cwd <project>
vibe task done TASK-001 --cwd <project>
```

## References

```bash
vibe refs search "query" --cwd <project>
vibe refs fetch <owner/repo> --cwd <project>
vibe refs add <owner/repo> --cwd <project>
vibe refs context --cwd <project>
```
