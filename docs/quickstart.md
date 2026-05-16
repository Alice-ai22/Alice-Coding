# 快速开始

这份文档会带你从安装 Alice Coding 到跑通第一个任务书驱动的闭环任务。

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

## 2. 准备任务书

Alice Coding 不要求固定任务目录。默认规则是：**任务书所在目录就是工作目录**。

```bash
mkdir -p ~/Projects/todo-app
vibe task-template web-app ~/Projects/todo-app/task.md
$EDITOR ~/Projects/todo-app/task.md
```

示例任务书：

```markdown
# Build a todo app

## Goal
Create a small local web app for managing todos.

## Requirements
- Add, complete, edit, and delete todos.
- Persist data locally.
- Keep the UI usable on mobile and desktop.

## Acceptance Criteria
- The app runs locally.
- Core todo actions work.
- A relevant build, test, or smoke check passes.
```

## 3. 预览执行

填写任务书后，先检查它是否具备关键段落：

```bash
vibe check-task ~/Projects/todo-app/task.md
```

建议真实执行前先 dry-run：

```bash
vibe exec ~/Projects/todo-app/task.md --agent codex --mode workspace --dry-run
```

这会生成执行计划并展示将要调用的 `agent-runner` 命令，但不会真正启动 Agent。

如果 `~/Projects/todo-app` 还不是 Git 仓库，`agent-runner` 会自动给 Codex 加上 `--skip-git-repo-check`。

## 4. 启动闭环执行

```bash
vibe exec ~/Projects/todo-app/task.md --agent codex --mode workspace
```

因为任务书在 `~/Projects/todo-app/` 里，Agent 会默认在这个目录创建或修改项目。

如果任务书和项目目录不在一起，显式指定工作目录：

```bash
vibe exec ~/Desktop/task.md --cwd ~/Projects/todo-app --agent codex --mode workspace
```

## 5. 配置 Codex 和 Claude Code

Alice Coding 可以通过 MCP server 给 Agent 提供项目上下文、skills、验证和参考项目能力。你可以把这些 MCP server 配置到 Codex 或 Claude Code 中。

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

## 6. 结构化项目流程

如果你希望长期沉淀项目记忆，可以初始化 `.project-ops/`：

```bash
cd ~/Projects/todo-app
vibe bootstrap --cwd . --fix
vibe ingest ./requirements.md --type requirements --cwd .
vibe task create TASK-001 "实现 MVP" --goal "根据需求文档完成 MVP" --cwd .
vibe run TASK-001 --agent codex --mode workspace --cwd . --dry-run
vibe run TASK-001 --agent codex --mode workspace --cwd .
```

## 推荐流程

```text
最快路径：
  新建文件夹 -> task-template -> check-task -> vibe exec --dry-run -> vibe exec

长期项目：
  bootstrap -> ingest -> task create -> run --dry-run -> run -> review -> learn

Skill 维护：
  task-template skill-improve -> skill doctor -> 修改模板 -> skill sync
```
