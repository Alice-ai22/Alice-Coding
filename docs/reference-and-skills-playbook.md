# Reference and Skills Playbook

Alice Coding works best when agents do not rely only on the current chat. A strong run usually combines four inputs:

- local project context
- relevant skills
- high-quality reference projects
- small verification checks

This playbook explains how to use those inputs without turning outside examples into unreviewed copied code.

## When To Use It

Use this workflow when a task asks for:

- UI or product quality improvements
- architecture planning
- workflow automation
- desktop or web app polish
- integrating a third-party repository as inspiration
- improving an agent's behavior over repeated runs

For small one-line fixes, use the direct task-file workflow instead.

## Operating Loop

```text
task.md
  -> skills_search / skills_read
  -> project_ops_get_context_bundle
  -> reference_search_github / reference_add
  -> implementation
  -> verification_select / verification_record
  -> report / learn
```

The order matters because references and skills should shape the plan before implementation begins.

## Skills First

Start by asking the skills MCP server for the smallest relevant set of skills:

```text
skills_search("frontend design")
skills_search("macOS app")
skills_search("browser testing")
skills_read("<best-match>")
```

Prefer one to three skills. Too many skills can make the agent overfit to generic advice instead of the current project.

Good skill choices usually answer one of these questions:

- What workflow should the agent follow?
- What design or engineering standard should guide the work?
- What verification should prove the result?

## Reference Projects

Use the reference MCP server when local skills are not enough or when product quality depends on learning from a mature project:

```bash
vibe refs search "nextjs dashboard workflow" --language TypeScript --min-stars 1000 --cwd .
vibe refs add https://github.com/example/project --why "Reference dashboard navigation and component hierarchy" --cwd .
vibe refs context --cwd .
```

Reference projects should be used for:

- product structure
- interaction patterns
- naming and information architecture
- testing strategy
- documentation structure
- integration boundaries

They should not be used for blindly copying source files.

## Public Safety Rules

Before using an external repository as more than inspiration, check:

- license compatibility
- whether copied code is actually needed
- whether the repository depends on private APIs or reverse-engineered endpoints
- whether the feature belongs in the public repo or only in a local/private project
- whether secrets, cookies, tokens, or local machine paths would leak into docs

If the reference touches platform automation, scraping, login flows, or unofficial APIs, document it as an optional integration boundary rather than a default core dependency.

## Product Quality Checklist

For UI and workflow work, ask the agent to compare the project against high-quality references in these areas:

- navigation clarity
- first-screen usefulness
- repeated-action ergonomics
- empty states
- loading and failure states
- copy density
- keyboard and command access
- visual hierarchy
- responsive behavior
- verification with real browser screenshots or smoke checks

This keeps "make it beautiful" grounded in actual product behavior.

## Example Task File Section

Add a section like this to a task file when reference-driven work is important:

```markdown
## Reference And Skills Expectations

- Search for 1-3 relevant local skills before planning.
- Use GitHub references only for product patterns, architecture, or risk assessment.
- Do not copy external source code without license review.
- Keep implementation scoped to the existing project architecture.
- Verify with the smallest relevant build, test, lint, or browser smoke check.
```

## What To Record

After the run, record:

- which skills were used
- which references were consulted
- what was adopted
- what was intentionally avoided
- which verification command passed

For projects with `.project-ops/`, use:

```bash
vibe learn --last-run --cwd .
vibe report --last-run --cwd .
```

This turns one good run into reusable project memory.
