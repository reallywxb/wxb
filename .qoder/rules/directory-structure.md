# 目录结构约定

## 优先级：P0（必须遵守）

## 适用场景

新建页面、模块或文件时。

## 规则描述

### 业务页面目录结构

```
apps/newrepo/src/views/modules/spd/views/
└── {根菜单目录}/           # 对应一级菜单，语义化英文名
    └── {子菜单目录}/       # 对应二级菜单，语义化英文名
        └── {功能页面}/     # 具体功能页面
            ├── index.vue       # 页面主文件
            ├── api.ts          # 接口封装文件
            ├── formOptions.ts  # 表单配置（可选，复杂表单时拆分）
            └── components/     # 页面私有组件（可选）
```

### 示例

```
apps/newrepo/src/views/modules/spd/views/
└── purchase/               # 采购管理
    └── purchasePlan/       # 采购计划
        └── buyPlan/        # 购买计划
            ├── index.vue
            ├── api.ts
            └── formOptions.ts
```

### 命名规则

- 目录名使用**小驼峰**（camelCase）
- 页面主文件固定为 `index.vue`
- API 文件固定为 `api.ts`
- 表单配置文件为 `formOptions.ts`（当表单配置较复杂时从 index.vue 中拆出）

### 其他关键目录

| 路径 | 用途 |
|------|------|
| `apps/newrepo/src/api/` | 全局 API 请求封装（requestClient 等） |
| `apps/newrepo/src/mock/` | Mock 数据（demoData.ts） |
| `apps/newrepo/src/adapter/` | 组件适配器（chc-ui 等） |
| `apps/newrepo/src/components/` | 全局公共组件 |
| `apps/newrepo/src/locales/` | 国际化文件 |
| `apps/newrepo/src/router/` | 路由配置 |
| `apps/newrepo/src/store/` | 全局状态 |

## 注意事项

- 页面组件路径会被菜单 Mock 数据的 `component` 字段引用，格式为 `modules/spd/views/{路径}/index`
- 新建页面后须同步更新 Mock 菜单数据（参见 route-mock-sync 规则）
