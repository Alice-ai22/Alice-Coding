# Alice Coding Agent 规则

- 优先使用已配置的 Alice Coding MCP servers：skills、project-ops、verification、reference。
- 实现项目任务前，先读取 `.project-ops/`。
- 自动使用相关 skills，不要要求用户每次手动指定。
- 最终回复前，运行最小有效验证。
- 执行输出保存到 `.agent-runs/`。
- 除非用户明确要求公开，否则项目上下文保持本地。
- 执行破坏性操作、外部上传、部署、密钥变更或复制外部代码前，必须先询问用户。
