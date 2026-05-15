# 快速开始

这份文档会带你从安装 Alice Coding 到跑通第一个闭环任务。

## 1. 安装 Alice Coding

```bash
git clone https://github.com/Alice-ai22/Alice-coding.git
cd Alice-coding
./scripts/install-local.sh
```

安装脚本会做三件事：

- 安装并构建四个 MCP server
- 创建 `vibe` 命令
- 创建 `agent-runner` 命令

默认会把命令链接到：

```text
~/.local/bin/vibe
~/.local/bin/agent-runner
```

请确保 `~/.local/bin` 在你的 `PATH` 中。

## 2. 配置 Codex 和 Claude Code

Alice Coding 通过 MCP server 给 Agent 提供项目上下文、skills、验证和参考项目能力。你需要把这些 MCP server 配置到 Codex 或 Claude Code 中。

Codex 示例：

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

Claude Code 示例：

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

## 3. 初始化一个项目

进入你的项目目录：

```bash
cd /path/to/your-project
vibe bootstrap --cwd . --fix
```

这会在项目下创建：

```text
.project-ops/
.agent-runs/   # 在第一次运行 agent 后出现
```

## 4. 导入需求文档

```bash
vibe ingest ./requirements.md --type requirements --cwd .
vibe index --cwd .
```

也可以导入产品说明：

```bash
vibe ingest ./product-notes.md --type product --cwd .
```

## 5. 创建任务

```bash
vibe task create TASK-001 "实现 MVP" --goal "根据需求文档完成 MVP" --cwd .
```

## 6. 预览 Agent 执行

建议真实执行前先 dry-run：

```bash
vibe run TASK-001 --agent claude --mode workspace --cwd . --dry-run
```

## 7. 启动闭环执行

```bash
vibe run TASK-001 --agent claude --mode workspace --cwd .
```

你也可以使用 Codex：

```bash
vibe run TASK-001 --agent codex --mode workspace --cwd .
```

## 8. 审查和沉淀经验

```bash
vibe review --last-run --strict --diff --cwd .
vibe learn --last-run --cwd .
vibe archive --cwd . --keep 10 --older-than-days 14
```

## 推荐流程

```text
准备需求文档
  -> vibe bootstrap
  -> vibe ingest
  -> vibe task create
  -> vibe run --dry-run
  -> vibe run
  -> vibe review
  -> vibe learn
```
