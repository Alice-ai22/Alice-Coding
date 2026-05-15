# skills-mcp-server

Local, read-only MCP server that indexes skills installed for Codex and Claude Code.

It scans `SKILL.md` files under common local roots, parses frontmatter metadata, and exposes tools to list, search, and read skills without modifying any files.

## Install

```bash
npm install
npm run build
```

## Run

```bash
node dist/index.js
```

## Tools

- `skills_roots`: show active scan roots and whether each exists.
- `skills_list`: list indexed skills with pagination.
- `skills_search`: search skill names, descriptions, source labels, and paths.
- `skills_read`: read one skill by `id`, exact `name`, or allowed `path`.

## Default Roots

The server scans these roots when they exist:

- `~/.codex/skills`
- `~/.codex/plugins/cache`
- `~/.codex/vendor_imports/skills`
- `~/.claude/skills`
- `~/.claude/plugins`
- `~/.cc-switch/skills`

Temporary Codex folders such as `~/.codex/.tmp` are intentionally excluded by default to reduce duplicates and stale plugin copies.

## Configuration

Override roots with `SKILLS_MCP_ROOTS` using `:` separated absolute paths:

```bash
SKILLS_MCP_ROOTS="$HOME/.codex/skills:$HOME/.claude/plugins" node dist/index.js
```

Include normally skipped paths by setting `SKILLS_MCP_INCLUDE_TMP=1`.

## Codex / Claude Code

Point your MCP client at the built server with stdio:

```json
{
  "mcpServers": {
    "skills": {
      "command": "node",
      "args": ["/absolute/path/to/alice-coding/mcp/skills-mcp-server/dist/index.js"]
    }
  }
}
```

For Claude Code, you can also add it with the CLI if available:

```bash
claude mcp add skills -- node /absolute/path/to/alice-coding/mcp/skills-mcp-server/dist/index.js
```
