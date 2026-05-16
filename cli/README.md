# CLI 工具

Alice Coding 包含两个主要命令行工具：

- `vibe`
- `agent-runner`

## `vibe`

主工作流入口，用于从任务书执行、初始化项目、导入文档、创建任务、启动 Agent、审查结果、记录经验和管理参考项目。

最快入口：

```bash
vibe exec ./task.md --agent codex --mode workspace
```

如果没有传 `--cwd`，`vibe exec` 默认把任务书所在目录作为工作目录。

结构化项目示例：

```bash
vibe bootstrap --cwd . --fix
vibe task create TASK-001 "实现登录流程" --goal "根据需求完成登录功能" --cwd .
vibe run TASK-001 --agent claude --mode workspace --cwd .
```

## `agent-runner`

底层执行器，用计划文件启动 Codex 或 Claude Code。

示例：

```bash
agent-runner claude ./plans/task.md --cwd /path/to/project
```

## 参考项目

`vibe` 包含 `vibe refs` 命令，用于安全地搜索和登记外部 GitHub 参考项目：

```bash
vibe refs search "nextjs dashboard shadcn" --language TypeScript --cwd .
vibe refs add https://github.com/shadcn-ui/ui --why "参考组件组合方式" --cwd .
vibe refs context --cwd .
```

## 默认安装入口

```text
~/.local/bin/vibe
~/.local/bin/agent-runner
```
