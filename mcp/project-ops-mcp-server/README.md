# project-ops-mcp-server

Local MCP server for Alice Coding project context.

It manages a project-local `.project-ops/` directory containing requirements, product notes, plans, task state, decisions, learnings, project rules, and verification commands.

## Install

```bash
npm install
npm run build
```

## MCP Tools

- `project_ops_init`: create `.project-ops` skeleton.
- `project_ops_status`: inspect project ops files.
- `project_ops_search_docs`: search requirements, product docs, plans, decisions, learnings, and rules.
- `project_ops_read_doc`: read one doc under `.project-ops`.
- `project_ops_list_tasks`: list tasks from `tasks.json`.
- `project_ops_update_task_status`: update or create a task.
- `project_ops_create_plan`: create a structured plan file.
- `project_ops_get_context_bundle`: return task, docs, rules, decisions, learnings, and verification in one bundle.
- `project_ops_append_learning`: append a structured learning after a run.

## Default Project Layout

```text
.project-ops/
  project.json
  requirements/
  product/
  plans/
  tasks.json
  decisions.md
  learnings.md
  project-rules.md
  verification.json
```

All write tools only write inside `.project-ops/` for the selected project.
