# Improve a Skill

## Goal

Improve a specific Alice Coding / Codex skill in the current task folder.

Goals:

- Make the skill trigger conditions, workflow, boundaries, and verification guidance clearer.
- Check that skill references are accurate, complete, and executable.
- Verify the improved skill with a dry-run or the smallest useful smoke check.

## Working Directory Rule

If no explicit `--cwd` is provided, use this task file's parent directory as the project working directory.

If the target is a source skill template, inspect:

```text
templates/skills/<skill-name>/SKILL.md
templates/skills/<skill-name>/references/
```

If the target is an installed Codex skill, inspect:

```text
~/.codex/skills/<skill-name>/SKILL.md
~/.codex/skills/<skill-name>/references/
```

To compare or sync a template with the installed skill, prefer:

```bash
vibe skill doctor <skill-name>
vibe skill sync <skill-name>
```

## Background

This task improves a skill that may be invoked by an AI coding agent. A good skill should make these things obvious:

- When to use it.
- What context to read first.
- Which files may be edited and which files are out of scope.
- Which verification should run.
- How to handle unavailable MCP tools, missing context, path ambiguity, or permission limits.

Target users / scenarios:

- Maintainers improving Alice Coding's local workflow.
- Users adapting Alice Coding skills to their own machine.
- Contributors validating a skill template before publishing it.

## Requirements

Please complete the following:

- Review the target skill's `SKILL.md`.
- Review the target skill's `references/`, `agents/`, or related template files.
- Check that the trigger description covers real usage without becoming too broad.
- Check that the workflow includes context loading, execution boundaries, dry-run, real execution, verification, and result recording.
- Check that path boundaries are clear enough to avoid editing the wrong source, installed skill, or target project.
- If you change an installed skill, consider whether the source template should also be updated.
- If you change a source template, run `vibe skill doctor <skill-name>` to check whether the installed skill should be synced.

## Boundaries

- Do not delete existing skills, references, or configuration files.
- Do not write secrets, tokens, account details, or private credentials.
- Do not modify project code unrelated to the target skill.
- Do not publish, push, deploy, or tag unless explicitly requested.
- Do not copy private machine paths into public docs unless the docs are explicitly local-only examples.

## Project Context

If the project contains `.project-ops/`, read relevant context first:

- `.project-ops/requirements/`
- `.project-ops/product/`
- `.project-ops/plans/`
- `.project-ops/tasks.json`
- `.project-ops/verification.json`
- `.project-ops/project-rules.md`
- `.project-ops/decisions.md`
- `.project-ops/learnings.md`

If `.project-ops/` does not exist, use the current project files and this task file.

Suggested files to inspect:

- `templates/skills/<skill-name>/SKILL.md`
- `templates/skills/<skill-name>/references/`
- `~/.codex/skills/<skill-name>/SKILL.md`
- `~/.codex/skills/<skill-name>/references/`

## Acceptance Criteria

The task is complete when:

- The target skill's usage scenarios, workflow, and boundaries are clearer.
- Reference files support realistic execution with accurate commands and paths.
- The relationship between source templates and installed skills is clear and checkable with `vibe skill doctor`.
- Any source-template change states whether installed skill sync is needed.
- The change is focused and does not edit unrelated files.

At minimum:

- Make at least one concrete improvement to the target skill or its references.
- Run the smallest useful verification.
- Report what is suitable for upstream or open-source sync.

## Verification

Choose the smallest useful verification for the change.

Prefer:

```bash
vibe skill doctor <skill-name>
vibe check-task <this-task-file.md>
node --check cli/vibe-cli/bin/vibe
node --check cli/agent-runner/bin/agent-runner
```

If the skill drives task-file execution, also run:

```bash
vibe exec <this-task-file.md> --agent codex --mode workspace --dry-run
```

If verification cannot run, explain why.

## Output

When finished, report:

- What changed.
- Which files were added or modified.
- Which verification commands ran.
- Verification results.
- What is suitable for upstream or open-source sync.
- Remaining risks, assumptions, or follow-up suggestions.
