# 任务书工作流

Alice Coding 的默认入口是任务书。用户可以自由选择文件夹，不需要把任务放进固定 inbox。

## 默认规则

**任务书所在目录就是项目工作目录。**

```text
新建文件夹 -> 放入 task.md -> 把 task.md 交给 AI -> AI 在这个文件夹里工作
```

例如：

```text
/Users/me/Projects/todo-app/task.md
```

默认工作目录是：

```text
/Users/me/Projects/todo-app
```

如果该目录是空的，Agent 可以在里面创建新项目。如果该目录已经是一个项目，Agent 应该读取现有结构、遵循项目约定，并保留无关改动。

## CLI 用法

```bash
vibe exec /path/to/project/task.md --agent codex --mode workspace
```

建议先 dry-run：

```bash
vibe exec /path/to/project/task.md --agent codex --mode workspace --dry-run
```

如果任务书和项目目录不在一起，显式指定 `--cwd`：

```bash
vibe exec /path/to/task.md --cwd /path/to/project --agent codex --mode workspace
```

`vibe exec` 会把任务书转换成 `.project-ops/plans/exec-*.md`，然后调用 `agent-runner` 在目标目录中执行。

## 对话用法

用户可以直接告诉 AI：

```text
请用 Alice Coding 执行这个任务书：/path/to/project/task.md
```

如果没有额外说明，AI 应默认在 `/path/to/project` 中工作。

如果用户只粘贴任务内容，没有给文件路径或工作目录，AI 应提醒用户：

```text
请把任务书保存到希望 AI 工作的项目文件夹中，或直接告诉我目标工作目录。
```

## 推荐任务书格式

```markdown
# Build a todo app

## Goal
Create a small local web app for managing todos.

## Requirements
- Add, complete, edit, and delete todos.
- Persist data locally.
- Keep the UI usable on mobile and desktop.

## Acceptance Criteria
- The app runs locally.
- Core todo actions work.
- A relevant build, test, or smoke check passes.
```

## 执行边界

- 只在解析出的工作目录中创建或修改项目文件。
- 如果项目已有 `.project-ops/`，先读取项目记忆、任务、规则、验证策略和历史经验。
- 如果没有 `.project-ops/`，也可以直接执行任务；需要长期沉淀时再运行 `vibe bootstrap --cwd . --fix`。
- 执行完成前应运行最小相关验证；无法验证时要说明原因。
