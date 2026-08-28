# 路由与 Mock 联动规范

## 优先级：P1（推荐实践）

## 适用场景

新建业务页面时。

## 规则描述

项目使用**动态路由**：菜单数据由后端接口 `/spd-api/sys/menu` 返回，前端根据菜单动态注册路由。

本地开发时，通过 `apps/newrepo/src/bootstrap.ts` 中的 `import '#/mock/demoData'` 引入 Mock 数据，拦截菜单接口返回静态菜单树。

### 新建页面时的联动步骤

1. 在 `apps/newrepo/src/views/modules/spd/views/` 下创建页面目录和 `index.vue`
2. 在 `apps/newrepo/src/mock/demoData.ts` 的 `/spd-api/sys/menu` 接口 Mock 数据中添加对应菜单项

### 菜单 Mock 数据格式

```typescript
{
  id: 'spd.web.{module}.{page}',   // 唯一标识
  text: '页面中文名',               // 菜单显示文本
  label: '页面中文名',              // 同 text
  path: '/{pagePath}',             // 路由路径
  url: '{pagePath}',               // 同 path（不含前导斜杠）
  component: 'modules/spd/views/{rootMenu}/{subMenu}/{page}/index', // 组件路径
  icon: 'carbon:workspace',        // 图标
  keepAlive: true,                 // 是否缓存
  children: [],                    // 子菜单
}
```

### 关键说明

- `component` 字段值对应 `apps/newrepo/src/views/` 下的相对路径（不含 `.vue` 后缀）
- 若注释掉 bootstrap.ts 中的 `import '#/mock/demoData'`，则连接真实后端菜单接口
- 生产环境不加载 Mock，菜单完全由后端控制

## 注意事项

- 新建页面后**必须**同步更新 Mock 菜单数据，否则本地开发时无法看到新页面
- 菜单 id 命名遵循 `spd.web.{模块}.{页面}` 格式
- 路由 path 使用小驼峰或短横线命名
