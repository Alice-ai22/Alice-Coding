# Alice Coding Commands

## Task File Fast Path

```bash
vibe task-template list
vibe task-template default ./task.md
vibe check-task ./task.md
vibe exec ./task.md --agent codex --mode workspace --dry-run
vibe exec ./task.md --agent codex --mode workspace
```

Default rule: if `--cwd` is omitted, `vibe exec` uses the task file's parent directory as the working directory.

## Explicit Working Directory

```bash
vibe exec /path/to/task.md --cwd /path/to/project --agent codex --mode workspace
```

## Structured Project Workflow

```bash
vibe bootstrap --cwd . --fix
vibe ingest ./requirements.md --type requirements --cwd .
vibe task create TASK-001 "Title" --goal "Goal" --cwd .
vibe run TASK-001 --agent codex --mode workspace --cwd . --dry-run
vibe run TASK-001 --agent codex --mode workspace --cwd .
vibe review --last-run --strict --diff --cwd .
vibe learn --last-run --cwd .
```

## References

```bash
vibe refs search "query" --cwd .
vibe refs add https://github.com/owner/repo --why "Why this reference matters" --cwd .
vibe refs context --cwd .
```
