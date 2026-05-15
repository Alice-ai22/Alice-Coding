# Node Web 项目配方

## 建议验证

- `npm run lint`
- `npm run build`
- 如果存在测试：`npm test`

## 常见上下文

- `package.json`
- 框架配置文件
- 路由或应用入口
- `.project-ops/verification.json`

## 建议流程

```bash
vibe bootstrap --cwd . --fix
vibe ingest ./requirements.md --type requirements --cwd .
vibe task create TASK-001 "实现页面" --goal "根据需求完成页面" --cwd .
vibe run TASK-001 --agent claude --mode workspace --cwd .
```
