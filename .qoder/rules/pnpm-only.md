# 包管理约束

## 优先级：P0（必须遵守）

## 适用场景

安装依赖、运行脚本、管理版本时。

## 规则描述

- 项目**强制使用 pnpm**（`preinstall: npx only-allow pnpm`）
- pnpm 版本 ≥ 9.12.0（当前 packageManager 指定 pnpm@10.10.0）
- Node.js 版本 ≥ 20.10.0
- 依赖版本通过 **pnpm catalog** 统一管理（定义在 `pnpm-workspace.yaml` 的 `catalog` 字段）
- Monorepo 任务编排使用 **Turborepo**

### 常用命令

```bash
# 安装依赖
pnpm install

# 添加依赖（使用 catalog 版本）
pnpm add <package> --filter <workspace-name>

# 运行开发服务
pnpm dev

# 构建
pnpm build
pnpm build:newrepo

# 清理缓存
pnpm clean
```

### 版本引用方式

在子包的 `package.json` 中：

```json
{
  "dependencies": {
    "vue": "catalog:",
    "@vben/utils": "workspace:*"
  }
}
```

- `catalog:` — 引用 pnpm-workspace.yaml 中 catalog 定义的版本
- `workspace:*` — 引用 monorepo 内部包

## 注意事项

- **绝不使用 npm 或 yarn**
- 新增依赖时优先检查 catalog 中是否已有定义
- 在 PowerShell 中执行多条命令时使用分号 `;` 分隔，不用 `&&`
