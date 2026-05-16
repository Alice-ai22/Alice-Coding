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
