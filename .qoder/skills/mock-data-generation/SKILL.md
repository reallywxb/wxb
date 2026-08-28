---
name: 'mock-data-generation'
description: '为新接口生成 Mock 数据。当用户要求为新增接口添加模拟数据或更新菜单 Mock 时调用。'
---

# Mock 数据生成

## 功能概述

为项目中新增的接口添加 Mock 数据，确保前端开发时无需依赖后端即可调试。

## 适用场景

- 用户新增了 API 接口，需要配套的 Mock 数据
- 用户新建了页面，需要在菜单 Mock 中注册路由
- 用户需要修改现有 Mock 数据的结构或内容

## 输入

- 接口路径（如 `/spd-api/user/list`）
- 请求方式（GET/POST）
- 响应数据结构（字段名、类型、示例值）
- 是否需要分页

## 执行步骤

### 1. 添加接口 Mock 数据

1. 打开文件：`apps/newrepo/src/mock/demoData.ts`
2. 按照接口路径和请求方式，添加对应 Mock 数据结构
3. 确保数据格式与接口定义的响应结构完全一致
4. 添加必要的注释说明

### 2. 更新菜单 Mock 数据（如需新页面）

1. 在同一文件中找到 `/spd-api/sys/menu` 接口的 Mock 数据
2. 添加对应菜单项：

```typescript
{
  id: 'spd.web.{module}.{page}',
  text: '页面中文名',
  label: '页面中文名',
  path: '/{pagePath}',
  url: '{pagePath}',
  component: 'modules/spd/views/{rootMenu}/{subMenu}/{page}/index',
  icon: 'carbon:workspace',
  keepAlive: true,
  children: [],
}
```

### 3. 数据格式要求

```typescript
// 分页列表接口响应格式
{
  code: 200,
  message: 'success',
  data: {
    total: 100,
    list: [ /* 数据数组 */ ],
  },
}

// SPD 业务接口响应格式（records/rows）
{
  success: true,
  msg: '',
  records: [ /* 数据数组 */ ],
  total: 100,
}
```

## 注意事项

- Mock 数据结构**必须**与接口定义的响应结构完全一致
- 包含必要的中文注释说明（接口功能、参数、返回值）
- 分页数据应模拟合理的 total 和列表长度
- SPD 业务接口注意区分 `records` 和 `rows` 字段
- 菜单 `component` 字段对应 `apps/newrepo/src/views/` 下的相对路径（不含 `.vue`）

## 验证方式

- 启动开发服务后，页面能正常加载 Mock 数据
- 菜单中能看到新添加的页面入口
- 表格分页、搜索功能正常响应
