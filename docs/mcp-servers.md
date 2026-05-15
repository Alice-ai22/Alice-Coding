# MCP Servers

Alice Coding 内置四个 MCP server，它们负责把本地项目上下文和工具能力暴露给 Codex、Claude Code 或其他支持 MCP 的 Agent。

## skills-mcp-server

索引本地 skills，帮助 Agent 自动发现和读取相关技能。

主要工具：

- `skills_roots`
- `skills_list`
- `skills_search`
- `skills_read`

适用场景：

- 前端开发
- 文档、PDF、PPT、表格
- 浏览器自动化
- MCP 开发
- 部署、测试、设计、研究写作等专业任务

## project-ops-mcp-server

读取和维护项目本地记忆，所有数据默认保存在 `.project-ops/` 下。

主要工具：

- `project_ops_init`
- `project_ops_status`
- `project_ops_get_context_bundle`
- `project_ops_search_docs`
- `project_ops_read_doc`
- `project_ops_list_tasks`
- `project_ops_update_task_status`
- `project_ops_append_learning`

适用场景：

- 读取需求文档
- 同步任务状态
- 查找产品说明
- 生成或执行开发计划
- 记录经验沉淀

## verification-mcp-server

选择和记录验证命令，让 Agent 不只是说“应该完成了”，而是能说明“跑了哪些检查，结果如何”。

主要工具：

- `verification_matrix`
- `verification_select`
- `verification_record`

常见验证包括：

- build
- test
- lint
- smoke check

## reference-mcp-server

搜索 GitHub 并把优质项目登记为当前项目的参考资料。

主要工具：

- `reference_search_github`
- `reference_fetch_github`
- `reference_add`
- `reference_list`
- `reference_context`

注意：reference MCP 的设计目的是“参考和学习”，不是自动复制第三方代码。使用外部代码前，请检查对应仓库 license。
