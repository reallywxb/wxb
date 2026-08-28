---
name: 'code-quality-check'
description: '代码质量检查技能。在代码修改完成后、提交前执行全面的代码质量检查流程。'
---

# 代码质量检查

## 功能概述

在代码修改完成后执行全面的质量检查，确保代码符合项目规范。

## 适用场景

- 代码修改完成后、git 提交前
- 用户要求检查代码质量
- CI 流程中的标准化检查步骤

## 执行步骤

### 1. ESLint + Stylelint 检查

```powershell
pnpm lint
```

检查内容：代码风格、未使用变量、import 排序、Vue 模板规范等。

### 2. Prettier 格式化

```powershell
pnpm format
```

自动格式化所有代码文件。

### 3. TypeScript 类型检查

```powershell
pnpm check:type
```

通过 Turborepo 对所有子包执行 `vue-tsc --noEmit` 类型检查。

### 4. 拼写检查

```powershell
pnpm check:cspell
```

检查 `.ts` 文件和 `README.md` 中的英文拼写。

### 5. 循环依赖检查（可选）

```powershell
pnpm check:circular
```

### 6. 依赖检查（可选）

```powershell
pnpm check:dep
```

## 快速全量检查

```powershell
pnpm check
```

等价于依次执行：`check:circular` → `check:dep` → `check:type` → `check:cspell`

## 注意事项

- 在 PowerShell 中多条命令用分号 `;` 分隔，**不用 `&&`**
- 如果 lint 报错，优先修复 error 级别问题，warning 可酌情处理
- 类型检查失败时注意是否为第三方库类型缺失（可添加 `// @ts-expect-error`）
- 拼写检查可通过 `cspell.json` 的 `words` 字段添加项目专有词汇

## 验证方式

- 所有检查命令退出码为 0
- 无 ESLint error 级别报错
- TypeScript 编译无错误
