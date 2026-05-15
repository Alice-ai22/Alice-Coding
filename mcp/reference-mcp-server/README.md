# reference-mcp-server

Local MCP server for finding and recording external reference projects.

Tools:

- `reference_search_github`: search public GitHub repositories.
- `reference_fetch_github`: fetch README/package metadata for one repo.
- `reference_add`: register a reference in `.project-ops/references/reference-index.json`.
- `reference_list`: list registered references.
- `reference_context`: return reference context for agents.

It does not clone repositories or install dependencies. Use references for inspiration and architecture review, not blind copying.
