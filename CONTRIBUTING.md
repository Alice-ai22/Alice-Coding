# 贡献指南

感谢你愿意改进 Alice Coding。

## 设计原则

- 本地优先：项目记忆默认保存在用户自己的项目目录。
- 可读优先：尽量使用 Markdown、JSON 等可检查文件，而不是隐藏状态。
- 可追踪：Agent 的执行过程应该能被回看、审查和复盘。
- 验证优先：完成任务前应该有明确的验证策略。
- 安全优先：不要鼓励用户上传私有项目上下文或盲目复制外部代码。

## 本地开发

```bash
./scripts/install-local.sh
vibe doctor --cwd .
```

每个 MCP server 都是 `mcp/` 下的独立 TypeScript 包：

```bash
cd mcp/project-ops-mcp-server
npm install
npm run build
```

## 提交 PR

请在 PR 中说明：

- 改了什么
- 为什么需要这个改动
- 如何验证
- 是否涉及安全、隐私、权限或外部网络访问

请不要提交真实项目的 `.project-ops/`、`.agent-runs/`、录屏、导出文件或任何密钥。
