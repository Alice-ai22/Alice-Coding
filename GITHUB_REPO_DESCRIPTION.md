# GitHub 仓库简介建议

## Description

```text
任务书驱动的本地 AI 编程工作流套件，让 Codex 和 Claude Code 在任务书所在文件夹或指定工作目录中执行、验证并沉淀经验。
```

## Topics

```text
ai-coding
ai-agent
codex
claude-code
mcp
agent-workflow
task-driven
local-first
developer-tools
automation
project-memory
```

## About

Alice Coding 是一个面向 AI Agent 编程的本地工作流套件。用户可以把任务书放进目标项目文件夹，然后通过 `vibe exec` 让 Agent 默认在该目录中读取上下文、生成计划、修改项目、运行验证并记录结果；也可以显式指定工作目录。长期项目还可以使用 `.project-ops/` 沉淀需求、任务、决策、参考项目和经验。
