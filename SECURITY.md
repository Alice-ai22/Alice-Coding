# 安全说明

Alice Coding 是本地优先的工作流套件。最重要的安全原则是：不要把私有项目记忆、Agent 运行日志、密钥、录屏、截图或个人配置直接发布到公开仓库。

## 不要提交

- API keys、tokens、cookies、SSH keys 或服务凭证。
- 未脱敏的 `.project-ops/` 内容。
- 真实项目的 `.agent-runs/` 日志。
- 私有截图、录屏、音频、转录稿或导出视频。
- 含有个人路径、密钥或私有服务地址的 MCP 配置文件。
- 私有产品需求、客户数据、内部文档或聊天记录。

## 推荐忽略

使用 Alice Coding 的项目通常建议忽略：

```gitignore
.agent-runs/
.agent-runs-archive/
.env
.env.*
recordings/
exports/
```

只有当你确认 `.project-ops/` 中的内容可以公开，并且确实希望把项目上下文一起发布时，才应该提交它。

## 外部参考项目

`reference` MCP 的用途是登记外部仓库作为上下文参考。它不应该被理解为自动复制第三方代码的许可。使用外部代码前，请检查 license、来源可信度和安全风险。

## 反馈安全问题

如果你发现安全问题，请优先使用 GitHub private security advisory 或私下联系维护者。不要在公开 issue 中粘贴密钥、私有日志或敏感项目内容。
