# Alice Coding Agent 规则

- 当任务可能受益于某个 skill 时，优先使用已配置的 `skills` MCP，不要等待用户手动指定 skill 名称。
- 如果项目存在 `.project-ops/`，开工前使用 `project-ops` MCP 读取需求、计划、任务、规则、决策、验证和经验。
- 声称完成前使用 `verification` MCP 选择并执行最小有效验证。
- 当外部 GitHub 参考项目有帮助时，使用 `reference` MCP；但不要盲目复制第三方代码。
- 当用户提供计划文件并要求闭环执行时，优先使用 `agent-runner` 或 `vibe run`。
- 适当更新任务状态，并记录可复用经验。
- 执行破坏性操作、外部上传、部署、密钥变更或复制外部代码前，必须先询问用户。
