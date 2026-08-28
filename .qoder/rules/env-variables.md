# 环境变量使用规范

## 优先级：P1（推荐实践）

## 适用场景

在代码中读取配置、涉及环境相关逻辑时。

## 规则描述

### 关键环境变量

| 变量 | 定义文件 | 含义 | 当前值 |
|------|----------|------|--------|
| `VITE_APP_TITLE` | `.env` | 应用标题 | 药品供应链精细化管理平台 |
| `VITE_APP_NAMESPACE` | `.env` | 缓存/store 命名空间前缀 | vben-web-play |
| `VITE_BASE` | `.env` | 路由 base 路径 | spd |
| `VITE_INSTITUTION_APPELLATION` | `.env` | 机构显示名称 | 医院 |
| `VITE_CHOOSE_INSTITUTION` | `.env` | 登录时是否选择机构（login/inner/false） | false |
| `VITE_HAS_WAREHOUSE_INFO` | `.env` | 是否启用仓库信息 | false |
| `VITE_WEBSOCKET_ENABLE` | `.env` | 是否开启 WebSocket | true |
| `VITE_PORT` | `.env.development` | 开发服务端口 | 5556 |
| `VITE_GLOB_API_URL` | `.env.development/.env.production` | API 代理前缀 | /spd-api |
| `VITE_NITRO_MOCK` | `.env.development` | 是否启用 Nitro Mock | false |
| `VITE_DEVTOOLS` | `.env.development` | 是否打开 DevTools | false |
| `VITE_INJECT_APP_LOADING` | 两者 | 是否注入全局 loading | true |
| `VITE_COMPRESS` | `.env.production` | 打包压缩方式（none/brotli/gzip） | none |
| `VITE_PWA` | `.env.production` | 是否启用 PWA | false |
| `VITE_ARCHIVER` | `.env.production` | 是否生成 dist.zip | false |

### 使用方式

```typescript
// 在代码中通过 import.meta.env 访问
const apiURL = import.meta.env.VITE_GLOB_API_URL; // '/spd-api'
const appTitle = import.meta.env.VITE_APP_TITLE;
const institutionName = import.meta.env.VITE_INSTITUTION_APPELLATION; // '医院'
```

### 约束

- **不在代码中硬编码**应用标题、API 前缀、机构名称等可配置值
- 涉及机构名称显示时统一使用 `VITE_INSTITUTION_APPELLATION`
- API 前缀统一读取 `VITE_GLOB_API_URL`
- 新增环境变量须在 `.env` 中添加注释说明

## 注意事项

- `.env` 为所有环境共享的基础配置
- `.env.development` 仅在开发环境生效
- `.env.production` 仅在生产构建时生效
- 环境变量文件位于 `apps/newrepo/` 目录下
