# 格式化与 Lint 规范

## 优先级：P0（必须遵守）

## 适用场景

所有代码文件的编写和修改。

## 规则描述

生成的代码必须符合以下工具的检查标准：

| 工具 | 用途 | 配置来源 |
|------|------|----------|
| Prettier | 代码格式化 | `@vben/prettier-config` |
| ESLint 9 | 代码质量检查（flat config） | `@vben/eslint-config` |
| Stylelint | 样式检查 | `@vben/stylelint-config` |
| cspell | 拼写检查 | `cspell.json` |

### 关键格式化规则

- 缩进：**2 空格**
- 换行符：**LF**（`\n`）
- 文件末尾：插入空行
- 引号：单引号
- 分号：有分号
- 尾逗号：all

### 执行命令

```bash
# 格式化
pnpm format

# Lint 检查
pnpm lint

# 类型检查
pnpm check:type

# 拼写检查
pnpm check:cspell
```

## 注意事项

- 生成代码时直接遵循以上规则，避免产生 lint 错误
- Vue SFC 中 `<script>`、`<template>`、`<style>` 块之间保留空行
- import 语句按 ESLint perfectionist 插件规则排序（外部包 → 内部包 → 相对路径）
- 不使用 `var`，优先使用 `const`，必要时用 `let`
