# Git 提交信息规范

## 优先级：P0（必须遵守）

## 适用场景

生成 git commit message 时。

## 规则描述

- 使用**中文**编写提交信息
- 遵循 Conventional Commits 格式（项目已配置 commitlint）
- 格式：`<type>(<scope>): <subject>`

## type 可选值

| type | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复缺陷 |
| docs | 文档变更 |
| style | 代码格式（不影响逻辑） |
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| build | 构建/依赖变更 |
| ci | CI 配置变更 |
| chore | 其他杂项 |
| revert | 回滚 |

## 示例

```
feat(采购模块): 新增采购计划列表页面
fix(用户管理): 修复部门下拉框依赖机构联动失效问题
refactor(表格组件): 抽取通用操作列配置为独立函数
docs(开发指南): 补充 Mock 数据添加流程说明
```

## 注意事项

- subject 不超过 50 个字符
- scope 使用模块/功能的中文名称
- 项目使用 `czg` 进行交互式提交（`pnpm commit`）
- Git hooks 由 Lefthook 管理，commit-msg 阶段会自动执行 commitlint 校验
