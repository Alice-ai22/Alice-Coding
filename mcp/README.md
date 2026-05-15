# MCP Servers

Alice Coding 包含四个本地 stdio MCP server：

- `skills-mcp-server`
- `project-ops-mcp-server`
- `verification-mcp-server`
- `reference-mcp-server`

每个 server 都可以独立安装、构建和运行：

```bash
cd mcp/<server-name>
npm install
npm run build
node dist/index.js
```

这些 MCP server 的作用是把本地项目上下文、skills、验证策略和参考项目能力提供给 Codex、Claude Code 或其他支持 MCP 的 Agent。
