# 项目作用说明

Alice Coding 的作用可以用一句话概括：

> 给 AI 编程 Agent 一个任务书驱动的本地项目操作层，让它不再只是在聊天框里回答问题，而是能在指定文件夹里读取上下文、执行任务、验证结果并沉淀经验。

## 它解决什么问题

AI 编程工具本身已经很强，但真实项目里经常遇到这些问题：

- 用户想做一个软件，却还要先解释项目应该放在哪里、怎么开始。
- 需求文档和产品说明散落在不同地方。
- 每次对话都要重新解释项目背景。
- skills 需要人工手动提醒使用。
- Agent 做完后经常只说“应该可以”，但没有明确验证。
- 报错、修复过程和经验没有沉淀。
- GitHub 优质项目可以参考，但缺少安全的登记和使用方式。

Alice Coding 把这些问题整理成一个本地工作流。

## 它具体做什么

Alice Coding 提供：

- 任务书执行：用 `vibe exec <task-file.md>` 从任意任务书启动闭环执行。
- 任务书模板：用 `vibe task-template` 生成不同场景的任务书。
- 任务书检查：用 `vibe check-task` 在执行前检查目标、要求、验收标准和验证方式。
- 默认工作目录：未显式指定 `--cwd` 时，任务书所在目录就是 Agent 工作目录。
- 项目记忆：用 `.project-ops/` 保存需求、产品说明、任务、规则、决策和经验。
- 闭环执行：用 `agent-runner` 把计划文件交给 Codex 或 Claude Code 执行。
- 工作流入口：用 `vibe` 管理初始化、导入、任务、运行、审查、学习和归档。
- skills 检索：通过 `skills` MCP 让 Agent 主动发现相关技能。
- 验证策略：通过 `verification` MCP 选择和记录最小有效验证。
- 参考项目：通过 `reference` MCP 搜索和登记 GitHub 参考项目。

## 它不是什么

Alice Coding 不是：

- 不是新的大模型。
- 不是替代 Codex 或 Claude Code 的工具。
- 不是云端项目管理平台。
- 不是自动复制开源代码的工具。
- 不是完全无人监督的自动开发系统。

它更像是 Codex、Claude Code 和 MCP 之间的一层本地协作协议。

## 推荐使用方式

最快路径：

1. 新建一个项目文件夹。
2. 用 `vibe task-template default ./task.md` 生成任务书。
3. 用 `vibe check-task ./task.md` 检查任务书质量。
4. 运行 `vibe exec ./task.md --agent codex --mode workspace --dry-run`。
5. 确认后运行 `vibe exec ./task.md --agent codex --mode workspace`。

长期项目：

1. 用 `vibe bootstrap` 初始化项目记忆。
2. 用 `vibe ingest` 导入需求。
3. 用 `vibe task create` 创建任务。
4. 用 `vibe run --dry-run` 预览执行。
5. 用 `vibe run` 启动 Agent。
6. 用 `vibe review` 审查结果。
7. 用 `vibe learn` 沉淀经验。

## 设计原则

- 本地优先：项目上下文默认保存在本地。
- 任务书优先：先让用户能从一个文件自然开始。
- 可读优先：尽量使用 Markdown 和 JSON。
- 可验证：任务完成要有验证记录。
- 可复盘：每次执行要有运行记录。
- 有边界：高风险动作需要人类确认。
