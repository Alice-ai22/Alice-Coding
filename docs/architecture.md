# 架构说明

Alice Coding 分为三层：项目层、工具层、Agent 层。

## 1. 项目层

每个目标项目都拥有自己的任务书、上下文和运行记录。

最小形态可以只有一个任务书：

```text
task.md
```

当使用 `vibe exec task.md` 且没有传 `--cwd` 时，任务书所在目录就是项目工作目录。

长期项目可以拥有完整上下文：

```text
.project-ops/
.agent-runs/
```

`.project-ops/` 保存需求、产品说明、任务、计划、规则、决策、验证矩阵、参考项目和经验沉淀。

`.agent-runs/` 保存每次 Agent 执行的 prompt、日志、输出和总结。

这样做的好处是：Alice Coding 的通用工具和每个项目的私有数据分开存储。

## 2. 工具层

Alice Coding 仓库提供这些工具：

- `vibe`：面向用户的主工作流 CLI，可从任务书或任务 ID 启动执行。
- `agent-runner`：从计划文件启动 Codex / Claude Code 执行任务。
- `skills` MCP：搜索和读取本地 skills。
- `project-ops` MCP：读取和维护项目记忆。
- `verification` MCP：选择和记录验证命令。
- `reference` MCP：搜索和登记 GitHub 参考项目。

`vibe exec` 会把任务书转换成 `.project-ops/plans/exec-*.md`，再调用 `agent-runner`。

## 3. Agent 层

Codex 或 Claude Code 会读取计划文件和项目上下文，然后执行任务：

```text
task.md
  -> vibe exec
  -> generated plan.md
  -> agent-runner
  -> Codex / Claude Code
  -> MCP context
  -> file edits
  -> verification
  -> .agent-runs/
```

Agent 不是凭空猜测，而是在一个结构化环境中工作。

## MCP 分工

- Skills MCP：让 Agent 主动发现可用技能。
- Project Ops MCP：让 Agent 读取项目需求、任务、规则和经验。
- Verification MCP：让 Agent 知道完成后应该跑哪些检查。
- Reference MCP：让 Agent 能把 GitHub 优质项目作为上下文参考。

## 设计边界

Alice Coding 不试图替代开发者。它的目标是让 Agent 更有结构地执行任务，而人类仍然负责方向、边界、审批、审查和最终质量。
