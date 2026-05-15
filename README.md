# Alice Coding

> 一个本地优先的 AI 编程工作流套件，让 Codex、Claude Code 和 MCP 工具从“一问一答”进入“读取上下文、执行任务、验证结果、沉淀经验”的闭环开发模式。

Alice Coding 不是单个提示词，也不是单个 MCP。它是一套面向 AI Agent 编程的本地工作流，把项目记忆、技能检索、任务计划、执行器、验证策略、GitHub 参考项目和运行记录整合到一起。

核心流程：

```text
需求文档 -> 项目记忆 -> 任务计划 -> Agent 执行 -> 验证检查 -> 经验沉淀
```

## 项目定位

Alice Coding 希望解决一个很现实的问题：AI 编程工具越来越强，但项目上下文经常散落在聊天记录、文档、终端、手动提示词和个人规则里。每次开始任务，都要重新解释需求、重新提醒使用哪些工具、重新粘贴报错、重新总结经验。

Alice Coding 的目标是给每个项目一个可读、可维护、可复用的本地工作环境，让 Agent 能够：

- 自动检索并读取相关 skills
- 读取项目需求、产品说明、任务状态和历史决策
- 根据计划文件进入闭环执行
- 调用 Codex 或 Claude Code 作为本地执行 Agent
- 选择并记录最小有效验证命令
- 登记 GitHub 优质项目作为参考，而不是盲目复制代码
- 保存每次运行日志、总结和可复用经验

## 一句话介绍

Alice Coding 是一套本地 AI 编程工作流：让 Codex / Claude Code 能围绕项目记忆执行计划、调用 skills、跑验证、记录结果，而不是只在聊天框里临时回答问题。

## 它能做什么

- 把需求文档、产品说明、任务计划和经验沉淀统一放进 `.project-ops/`。
- 用 `vibe` 命令完成初始化、导入、任务、运行、审查、学习和归档。
- 用 `agent-runner` 启动 Codex 或 Claude Code 执行闭环任务。
- 通过 MCP 让 Agent 主动读取 skills、项目上下文、验证策略和参考项目。
- 把每次运行记录保存到 `.agent-runs/`，方便复盘。

## 它不能做什么

- 它不是新的模型，也不替代 Codex 或 Claude Code。
- 它不是云端项目管理平台，默认不上传你的项目记忆。
- 它不能保证 Agent 永远正确完成任务，仍然需要人工审查。
- 它不会自动授权复制第三方开源代码，外部项目只作为参考上下文。

## 适合谁

- 正在使用 Codex / Claude Code / 终端 Agent 的开发者
- 想把 AI 编程从“聊天辅助”升级成“项目工作流”的人
- 希望项目上下文长期沉淀在本地的人
- 想搭建 MCP + skills + verification + agent runner 组合工作流的人
- 想让 AI 更有结构地读需求、改代码、跑测试、修复问题的人

## 核心组件

- `cli/vibe-cli`：主工作流 CLI，负责初始化项目、导入文档、创建任务、运行 Agent、审查、沉淀经验、管理参考项目和归档记录。
- `cli/agent-runner`：从计划文件启动 Codex 或 Claude Code 的非交互执行模式。
- `mcp/skills-mcp-server`：统一索引本地 Codex / Claude Code skills。
- `mcp/project-ops-mcp-server`：管理项目需求、产品说明、计划、任务、决策、规则、验证和经验。
- `mcp/verification-mcp-server`：根据任务和项目选择最小有效验证命令，并记录结果。
- `mcp/reference-mcp-server`：搜索并登记 GitHub 参考项目。
- `templates/`：计划模板、项目记忆模板、Agent 规则模板。
- `docs/`：安装、配置、架构、MCP 和工作流说明。

## 快速开始

```bash
git clone https://github.com/Alice-ai22/Alice-coding.git
cd Alice-coding
./scripts/install-local.sh
```

进入任意项目目录：

```bash
vibe bootstrap --cwd . --fix
vibe ingest ./requirements.md --type requirements --cwd .
vibe task create TASK-001 "实现 MVP" --goal "根据需求文档完成 MVP" --cwd .
vibe run TASK-001 --agent claude --mode workspace --cwd . --dry-run
vibe run TASK-001 --agent claude --mode workspace --cwd .
```

更多说明见：

- [快速开始](docs/quickstart.md)
- [架构说明](docs/architecture.md)
- [配置说明](docs/configuration.md)
- [MCP Servers](docs/mcp-servers.md)
- [项目作用说明](docs/project-purpose.md)
- [常用工作流](docs/workflows.md)
- [路线图](ROADMAP.md)
- [开源发布检查清单](OPEN_SOURCE_CHECKLIST.md)

## 项目记忆

Alice Coding 会把项目自己的上下文保存在目标项目中：

```text
.project-ops/
  requirements/
  product/
  plans/
  references/
  tasks.json
  verification.json
  decisions.md
  learnings.md
  project-rules.md

.agent-runs/
```

这意味着 Alice Coding 仓库本身只保存通用工具和模板；每个项目的私有需求、运行记录和经验都保存在对应项目目录里。

## 安全边界

Alice Coding 是本地优先设计，不要求把项目记忆上传到云端。`reference` MCP 只把 GitHub 项目作为参考资料登记，不代表自动复制第三方代码。使用外部代码前，请自行检查 license 和安全风险。

发布公开项目或 fork 前，请阅读 [SECURITY.md](SECURITY.md)。

## 当前版本

当前版本：`v0.1.0`

这是一个早期但可用的公开版本，重点是让本地 Agent 工作流变得可重复、可检查、可沉淀。

## License

MIT. See [LICENSE](LICENSE).
