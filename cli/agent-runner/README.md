# agent-runner

`agent-runner` 是 Alice Coding 的本地任务启动器，用于把一个 Markdown 计划文件交给 Codex CLI 或 Claude Code CLI 执行。

它会生成一个带有执行规则的 prompt，提醒 Agent 读取项目、使用 MCP、调用 skills、修改文件、运行验证并输出总结。

## 使用方式

```bash
agent-runner codex ./plans/my-task.md --cwd /path/to/project
agent-runner claude ./plans/my-task.md --cwd /path/to/project --max-turns 30
```

安全预览：

```bash
agent-runner codex ./plans/my-task.md --cwd . --dry-run
```

当目标文件夹还不是 Git 仓库时，Codex 通常会要求额外的 trust check。为了支持“新建文件夹 + task.md”的任务书工作流，`agent-runner` 会在非 Git 目录中自动给 Codex 加上 `--skip-git-repo-check`。你也可以显式传入：

```bash
agent-runner codex ./plans/my-task.md --cwd ./new-folder --skip-git-repo-check
```

## 运行记录

每次执行会创建：

```text
.agent-runs/<run-name>/
├── prompt.md
├── command.json
├── stdout.log
├── stderr.log
└── summary.md
```

这些文件用于复盘 Agent 做了什么、运行了什么命令、最后输出了什么总结。

## Prompt 约束

`agent-runner` 生成的 prompt 会要求 Agent：

- 先读取项目再修改文件
- 通过 `skills` MCP 查找相关技能
- 如果存在 `.project-ops/`，通过 `project-ops` MCP 读取项目上下文
- 根据任务需要修改文件
- 运行测试、构建、lint 或 smoke check
- 读取失败原因、修复问题并重新验证
- 保留用户无关改动
- 最后输出简洁总结

## 计划文件建议

计划文件可以是任意 Markdown，但建议包含：

- 目标
- 范围
- 需要检查的文件或模块
- 验证命令
- 非目标
- 风险边界
- 完成标准

参考：[examples/example-plan.md](examples/example-plan.md)。
