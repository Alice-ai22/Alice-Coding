# Alice Coding MCP Guidance

## skills

Use for searching and reading Codex/Claude skills before specialized work. Fallback: inspect local skill directories directly.

## project-ops

Use when `.project-ops/` exists or when the user mentions requirements, product docs, task status, plans, verification matrices, decisions, or learnings.

Preferred flow:

1. Get context bundle.
2. Search/read focused docs as needed.
3. Update task status after completion when a task id is known.
4. Append reusable learnings when useful.

Fallback: read `.project-ops/requirements`, `.project-ops/product`, `.project-ops/plans`, `tasks.json`, `verification.json`, `decisions.md`, `learnings.md`, and `project-rules.md` directly.

## verification

Use before test/build/lint/smoke checks. Select the smallest relevant command set, run it, then record the result when possible.

Fallback: infer from package scripts, README, CI, Makefile, or project conventions; summarize verification in the final response.

## reference

Use when local context is insufficient and high-quality GitHub examples would help. References are for patterns and risk assessment, not code copying. Check licenses before using external code.

Fallback: use web or GitHub search manually, then record useful references under `.project-ops/references/` if appropriate.
