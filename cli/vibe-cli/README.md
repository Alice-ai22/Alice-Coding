# vibe CLI

`vibe` 是 Alice Coding 的主工作流命令。

它可以从任务书直接启动闭环执行，也可以和 `project-ops-mcp-server` 通信来管理项目上下文，并在需要执行任务时调用 `agent-runner`。

## 最快入口：任务书执行

```bash
vibe exec ./task.md --agent codex --mode workspace
```

默认规则：如果没有传 `--cwd`，`vibe exec` 会把任务书所在目录作为工作目录。

```bash
# 在 ~/Projects/my-app 中工作，因为 task.md 在这个目录里
vibe exec ~/Projects/my-app/task.md --agent codex --mode workspace

# 任务书在别处时，显式指定项目目录
vibe exec ~/Desktop/task.md --cwd ~/Projects/my-app --agent codex --mode workspace

# 只预览，不启动 Agent
vibe exec ~/Projects/my-app/task.md --agent codex --mode workspace --dry-run
```

`vibe exec` 会生成 `.project-ops/plans/exec-*.md`，再调用 `agent-runner`。

## 常用命令

```bash
vibe init --cwd .
vibe bootstrap --cwd . --fix
vibe status --cwd .
vibe ingest ./prd.md --type requirements --cwd .
vibe index --cwd .
vibe task create TASK-001 "实现登录流程" --goal "根据需求完成登录功能" --cwd .
vibe task list --cwd .
vibe rules propose "每次 build 前先运行 lint" --cwd .
vibe rules accept RULE-001 --cwd .
vibe plan TASK-001 "实现登录流程" --goal "完成登录功能" --cwd .
vibe run TASK-001 --agent codex --cwd .
vibe run TASK-001 --agent codex --mode workspace --cwd .
vibe exec ./task.md --agent codex --mode workspace
vibe exec ./task.md --agent codex --mode workspace --dry-run
vibe run TASK-001 --agent claude --cwd . --max-turns 30
vibe review TASK-001 --agent claude --cwd . --dry-run
vibe review --last-run --strict --diff --cwd . --dry-run
vibe learn TASK-001 --cwd .
vibe issue TASK-001 --cwd .
vibe pr TASK-001 --cwd .
vibe sync
vibe update
vibe archive --cwd . --keep 10 --older-than-days 14
vibe doctor --cwd .
```

## 创建的文件

`vibe init` 会创建：

```text
.project-ops/
  project.json
  requirements/
  product/
  plans/
  tasks.json
  decisions.md
  learnings.md
  project-rules.md
  verification.json
```

## 命令说明

- `vibe exec`：从任意任务书启动闭环执行；未传 `--cwd` 时默认使用任务书所在目录。
- `vibe bootstrap --fix`：检查本地 Alice Coding 工具链，并在缺失时初始化 `.project-ops/`。
- `vibe ingest`：把需求、产品说明或计划文档复制到 `.project-ops/` 并刷新索引。
- `vibe task`：创建、列出、查看下一个任务或标记任务完成。
- `vibe run`：根据任务 ID 找到计划文件，并调用 `agent-runner`。
- `vibe review`：基于上一次运行创建审查任务。
- `vibe learn`：把可复用经验追加到 `.project-ops/learnings.md`。
- `vibe rules`：管理候选长期规则。
- `vibe refs`：搜索、添加、列出和读取 GitHub 参考项目。
- `vibe issue` / `vibe pr`：生成本地 issue / PR 草稿。
- `vibe sync`：同步 Alice Coding 源码到本地缓存。
- `vibe update`：当源码是 git 仓库时拉取更新并同步缓存。
- `vibe archive`：把旧的 `.agent-runs/` 运行记录移动到 `.agent-runs-archive/`。
