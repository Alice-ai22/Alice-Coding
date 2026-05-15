# 开源发布检查清单

发布 Alice Coding 到公开 GitHub 仓库前，建议逐项检查。

## 必做

- [ ] 确认没有包含真实项目的私有 `.project-ops/`。
- [ ] 确认没有包含真实 `.agent-runs/` 日志。
- [ ] 确认没有包含截图、录屏、导出视频、密钥或私有文档。
- [ ] 搜索本机绝对路径。
- [ ] 搜索 token、secret、password、api key 等敏感词。
- [ ] 确认 license。
- [ ] 创建 GitHub 仓库。
- [ ] 添加 GitHub remote。
- [ ] 提交并推送第一版公开代码。

## 建议搜索

```bash
rg -n "/Users/|token|secret|password|api_key|apikey|cookie|private" .
find . -name .DS_Store -o -name node_modules -o -name dist -o -name .agent-runs
```

## 首次推送

```bash
git remote add origin git@github.com:Alice-ai22/Alice-coding.git
git add .
git commit -m "Initial open source release"
git branch -M main
git push -u origin main
```
