# 常用工作流

## 任务书快速闭环

Alice Coding 的默认入口是任务书，且不要求固定文件夹。

```bash
mkdir -p ~/Projects/my-app
$EDITOR ~/Projects/my-app/task.md
vibe exec ~/Projects/my-app/task.md --agent codex --mode workspace --dry-run
vibe exec ~/Projects/my-app/task.md --agent codex --mode workspace
```

默认规则：如果没有传 `--cwd`，`vibe exec` 会把任务书所在目录作为工作目录。适合“新建一个文件夹，把任务书放进去，让 Agent 在这个文件夹里创建项目”的场景。

如果任务书在别处：

```bash
vibe exec ~/Desktop/task.md --cwd ~/Projects/my-app --agent codex --mode workspace
```

## 结构化项目闭环

```bash
vibe bootstrap --cwd . --fix
vibe ingest ./requirements.md --type requirements --cwd .
vibe task create TASK-001 "实现功能" --goal "根据需求完成实现" --cwd .
vibe run TASK-001 --agent claude --mode workspace --cwd .
vibe review --last-run --strict --diff --cwd .
vibe learn --last-run --cwd .
```

这条流程适合长期项目：先初始化项目记忆，再导入需求，创建任务，启动 Agent，最后审查和沉淀经验。

## 添加 GitHub 参考项目

```bash
vibe refs search "nextjs dashboard shadcn" --language TypeScript --min-stars 1000 --cwd .
vibe refs add https://github.com/shadcn-ui/ui --why "参考组件组合和设计系统组织方式" --cwd .
vibe refs context --cwd .
```

参考项目会登记到 `.project-ops/references/`。Agent 可以读取这些参考上下文，但不应该盲目复制外部代码。

## 只读模式

```bash
vibe run TASK-001 --agent claude --mode read-only --cwd .
```

适合让 Agent 先阅读项目、分析风险、生成建议，而不修改文件。

## 工作区编辑模式

```bash
vibe exec ./task.md --agent codex --mode workspace
vibe run TASK-001 --agent claude --mode workspace --cwd .
```

适合常规开发任务。Agent 可以在项目工作区内修改文件。

## Full Auto 模式

```bash
vibe run TASK-001 --agent codex --mode full-auto --cwd .
```

适合你已经信任当前任务边界，并希望 Agent 更主动地完成执行闭环的情况。涉及删除、部署、上传、密钥、外部代码复制等高风险动作时，仍建议保留人工审批。

## 归档历史运行记录

```bash
vibe archive --cwd . --keep 10 --older-than-days 14
```

这会把旧的 `.agent-runs/` 记录移动到 `.agent-runs-archive/`，避免项目目录长期堆积太多运行日志。

## 推荐节奏

```text
最快路径：
  task.md -> exec dry-run -> exec -> verify -> summary

中大型任务：
  requirements -> product notes -> references -> plan -> dry-run -> run -> review -> learn

高风险任务：
  read-only -> 人工确认 -> workspace -> review -> 手动合并
```
