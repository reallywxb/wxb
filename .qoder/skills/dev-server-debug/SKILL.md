---
name: 'dev-server-debug'
description: '开发服务启动与调试技能。帮助用户启动开发环境、配置代理和进行浏览器调试。'
---

# 开发服务启动与调试

## 功能概述

帮助用户快速启动项目开发环境，配置 API 代理，进行浏览器调试。

## 适用场景

- 用户需要启动开发环境
- 用户需要切换后端代理地址
- 用户遇到页面无法访问、接口报错等问题需要排查

## 可用应用

| 应用 | 启动命令 | 端口 | 说明 |
|------|----------|------|------|
| newrepo（主应用） | `pnpm build:newrepo` 或进入目录 `pnpm dev` | 5556 | SPD 药品管理主前端 |
| playground | `pnpm dev:play` | 5555 | 框架功能演示 |
| docs | `pnpm dev:docs` | 5173（默认） | VitePress 文档站 |
| backend-mock | 进入目录 `pnpm start` | 3000（默认） | Nitro Mock 后端 |

## 执行步骤

### 1. 启动主应用开发服务

```powershell
# 方式一：交互式选择
pnpm dev

# 方式二：直接启动 newrepo
cd apps/newrepo; pnpm dev
```

### 2. 代理配置

主应用的 API 代理在 `apps/newrepo/vite.config.mts` 中配置：

```typescript
server: {
  proxy: {
    '/spd-api': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/spd-api/, '/'),
      target: 'http://192.168.30.121:32081', // 后端地址
      ws: true,
    },
  },
}
```

切换后端环境时修改 `target` 值即可。

### 3. Mock 模式

- **本地 Mock**：`bootstrap.ts` 中 `import '#/mock/demoData'` 已启用，会拦截菜单等接口
- **Nitro Mock**：设置 `.env.development` 中 `VITE_NITRO_MOCK=true`

### 4. 浏览器调试

- 访问地址：`http://localhost:5556/spd/`（注意 base 路径为 `/spd/`）
- Vue DevTools：设置 `VITE_DEVTOOLS=true` 启用

## 常见问题排查

| 问题 | 排查方向 |
|------|----------|
| 页面空白 | 检查 base 路径是否为 `/spd/`，Mock 菜单数据是否正确 |
| 接口 404 | 检查 vite proxy 配置，确认后端服务是否启动 |
| 接口 401 | Token 过期或 Cookie 未正确传递，检查 `cookiePathRewrite` |
| 菜单不显示 | 检查 `demoData.ts` 中菜单 Mock 数据格式 |
| 样式异常 | 确认 TailwindCSS 和 Ant Design Vue 样式正确引入 |

## 注意事项

- 主应用 base 路径为 `/spd/`，访问时不能省略
- 开发端口为 5556（定义在 `.env.development` 的 `VITE_PORT`）
- PowerShell 中切换目录用 `cd`，多命令用 `;` 分隔
- 修改 `vite.config.mts` 后需重启开发服务

## 验证方式

- 浏览器能正常访问 `http://localhost:5556/spd/`
- 登录页面正常渲染
- 菜单和路由正常加载
