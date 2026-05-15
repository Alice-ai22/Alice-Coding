# 配置说明

Alice Coding 主要依赖本地命令和 MCP server 路径。

## 环境变量

### `vibe`

- `VIBE_NODE_BIN`：Node 可执行文件，默认 `node`。
- `VIBE_PROJECT_OPS_SERVER`：project-ops MCP server 路径。
- `VIBE_VERIFICATION_SERVER`：verification MCP server 路径。
- `VIBE_REFERENCE_SERVER`：reference MCP server 路径。
- `VIBE_SKILLS_SERVER`：skills MCP server 路径。
- `VIBE_AGENT_RUNNER`：agent-runner 路径。
- `VIBE_CODEX_CONFIG`：Codex 配置文件路径。
- `VIBE_CLAUDE_MCP_CONFIG`：Claude Code MCP 配置文件路径。
- `VIBE_KIT_SOURCE`：Alice Coding 源码路径。
- `VIBE_KIT_CACHE`：本地缓存路径。

### `agent-runner`

- `AGENT_RUNNER_CODEX_BIN`：Codex CLI，可执行文件默认 `codex`。
- `AGENT_RUNNER_CLAUDE_BIN`：Claude Code CLI，可执行文件默认 `claude`。
- `AGENT_RUNNER_CLAUDE_MCP`：Claude Code MCP 配置路径。

## Codex MCP 示例

```toml
[mcp_servers.skills]
command = "node"
args = ["/absolute/path/to/Alice-coding/mcp/skills-mcp-server/dist/index.js"]

[mcp_servers.project-ops]
command = "node"
args = ["/absolute/path/to/Alice-coding/mcp/project-ops-mcp-server/dist/index.js"]

[mcp_servers.verification]
command = "node"
args = ["/absolute/path/to/Alice-coding/mcp/verification-mcp-server/dist/index.js"]

[mcp_servers.reference]
command = "node"
args = ["/absolute/path/to/Alice-coding/mcp/reference-mcp-server/dist/index.js"]
```

## Claude Code MCP 示例

```json
{
  "mcpServers": {
    "skills": {
      "command": "node",
      "args": ["/absolute/path/to/Alice-coding/mcp/skills-mcp-server/dist/index.js"]
    },
    "project-ops": {
      "command": "node",
      "args": ["/absolute/path/to/Alice-coding/mcp/project-ops-mcp-server/dist/index.js"]
    },
    "verification": {
      "command": "node",
      "args": ["/absolute/path/to/Alice-coding/mcp/verification-mcp-server/dist/index.js"]
    },
    "reference": {
      "command": "node",
      "args": ["/absolute/path/to/Alice-coding/mcp/reference-mcp-server/dist/index.js"]
    }
  }
}
```

## 路径原则

公开仓库中不写死任何个人本机路径。你可以通过环境变量覆盖默认路径，也可以把 Alice Coding 安装在任意目录。
