# Task File Workflow

Alice Coding is task-file driven:

```text
create a folder -> add task.md -> give task.md to AI -> AI works in that folder
```

Rules:

- If the user provides a task file and no working directory, use the task file's parent directory.
- If the user provides both, use the explicit working directory.
- If the directory is empty, create the project there.
- If the directory already contains a project, follow its existing stack and preserve unrelated changes.
- If `.project-ops/` exists, read it before editing.
- If the task file is vague, use `vibe check-task` or ask only for missing critical information.

Execution flow:

```bash
vibe check-task <task-file.md>
vibe exec <task-file.md> --agent codex --mode workspace --dry-run
vibe exec <task-file.md> --agent codex --mode workspace
```

Treat the dry-run as the checkpoint before launching a real agent. Check that the working directory is the task file's parent directory unless `--cwd` was explicit, the generated plan is written under the intended `.project-ops/plans/`, and the selected mode matches the user's requested risk level.

Use `read-only` for inspection, review, and reporting tasks. Use `workspace` for normal local project edits. Use `full-auto` only when the user explicitly asks for broad autonomous execution.

After execution, run the smallest meaningful verification for the changed surface and summarize or record the result. If `.project-ops/` exists and the task produced durable workflow knowledge, append a concise learning; avoid recording secrets, tokens, or private account details.
