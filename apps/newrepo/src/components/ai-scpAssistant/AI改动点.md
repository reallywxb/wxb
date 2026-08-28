# AI 助手改动点记录

## 📁 一、改动文件清单

### 1. 需要修改的主要文件

#### a) `mockData.ts`

- 删除了所有 SSE 流式相关代码（`fetchSSE`、`getResponse` 流式逻辑）
- 改为标准 fetch 请求 `/spd-api/aIChatAction/chat.do`
- 请求头改为 `application/x-www-form-urlencoded` 表单格式
- 参数简化为 `{ msg: inputValue }`，移除 `history/validate/type` 参数
- 直接返回 `await res.json()`，不再返回 Response 对象

#### b) `tdChatArea.vue`

- 删除 `fetchSSE` 函数（约 130 行流式解析代码）
- 删除 `isStreamLoad`、`modelType` 状态变量
- 删除 `SvgMaterialSymbolsStopCircleOutline` 停止图标导入
- 删除 `deepClone` 工具函数导入
- 重写 `handleData` 函数，改为 `await mockResponse.getResponse()` 同步请求
- 新增 `#content` 插槽模板，根据 `replyType` 区分 5 种渲染方式
- 新增 Ant Design Table、Button、message 导入
- 新增 `AiScreenshotList` 组件、`exportToExcel`、`normalizeHtmlImages` 导入
- 移除模板中的停止按钮、模型选择下拉（已注释）、`isStreamLoad` 相关判断
- 新增样式：`.ai-rich-content`、`.ai-table-wrapper`、`.ai-table-toolbar`、`.ai-knowledge-wrapper`

#### c) `antdxChatArea.vue`

- 删除 `XRequest` 对象创建（`baseURL: '/ai/chat'`）
- 删除 `useAccessStore` 导入（不再需要 accessToken 校验）
- 删除 `AI_MODEL_CHECK_URL` 导入
- 删除 `currentWholeMsg`、`handleSuccess`、AbortController 等流式相关变量
- 删除 `exampleRequest.value.create` 及 SSE 流式回调逻辑（`onUpdate`、`onStream`）
- 删除所有注释掉的 `transformMessage`、`transformStream` 代码
- 重写 `useXAgent` 的 `request` 函数，改为 fetch 请求 `/spd-api/aIChatAction/chat.do`
- 删除 `onSubmit` 中的 `validate`、`type` 参数
- 简化 `onCancel` 函数（非流式无法中途停止）
- 新增 `normalizeHtmlImages` 导入，处理富文本图片地址
- 新增 AbortController 支持，实现前端主动取消请求
- 新增 `handleClearMsg` 函数，调用 `/aIChatAction/clearChatHistory.do` 接口
- 新增知识库截图 HTML 拼接逻辑，兼容 `result.screenshots` 渲染
- 修复 `Bubble.List` placeholder 项缺少 `role` 属性导致的空白问题
- 修复 `clearChatHistory.do` 和 `stopChat` 接口未解析响应体的问题
- 新增截图列表样式：`.ai-screenshot-list`、`.ai-screenshot-item` 等

### 2. 需要新增文件

#### a) `utils/image.ts`

- `normalizeImageUrl()`: 规范化图片 URL，兼容三种格式
- `normalizeHtmlImages()`: 替换富文本 HTML 中所有图片 src

#### b) `utils/export.ts`

- `exportToExcel()`: 通过隐藏表单 POST 提交到后端导出接口

#### c) `AiScreenshotList.vue`

- 截图列表组件，渲染知识库相关截图，支持点击预览

---

## 🔧 二、为什么这么修改

### 1. 接口切换需求

- 原接口 `/ai/chat` 走独立代理 `aiProxyUrl`，使用 SSE 流式通信
- 新需求切换到主代理 `proxyUrl`，请求后端非流式接口 `/aIChatAction/chat.do`
- 参考 Layui 旧版实现，保持传参格式一致（表单格式）

### 2. 功能对齐需求

- 原 Vue3 版本只支持纯文本/Markdown 渲染
- 需要支持 Layui 版的 4 种回复类型：
  - `sql_query` → 表格渲染 + 导出 Excel
  - `chat_html` → 富文本 HTML 渲染
  - `from_knowledge_base` + `content_html` → 知识库富文本 + 截图
  - `from_knowledge_base`（无 html）→ 知识库纯文本 + 截图
  - 默认 → 纯文本

### 3. 代码简化

- 移除流式代码（`ReadableStream`、`TextDecoder`、buffer 缓冲等）降低复杂度
- 移除不再需要的 `modelType` 切换（dify/deepseek/coze）
- 移除停止按钮（非流式接口无法中途停止）

### 4. 请求控制优化

- 添加 AbortController 支持，需要通过后端接口中断请求，或前端主动取消进行中的请求
- 完善错误处理，区分用户取消和真实网络错误

---

## ⚠️ 三、潜在风险

### 1. 体验降级风险

- 非流式接口需等待后端完整生成后才返回
- 用户会看到较长时间的 loading 空白（可能 5~30 秒）
- 建议：增加"正在思考中..."过渡提示，或要求后端开启流式接口

### 2. 上下文记忆缺失

- 不再传递 `history` 参数，后端无法基于历史对话做上下文理解
- 如果后端依赖 `history` 参数，可能导致多轮对话效果异常
- 建议：确认后端是否支持无 history 的单轮对话模式

### 3. 代理路由风险

- 依赖 `/spd-api` 代理正确转发到 `proxyUrl` (192.168.30.121:32081)
- 如果 `vite.config.mts` 中 `/spd-api` rewrite 规则有问题，请求会 404
- 图片地址 `/spd-api/aIChatAction/loadImage.do` 同样依赖此代理
- 导出接口 `/spd-api/aIChatAction/exportExcel.do` 也依赖此代理

### 4. 表格渲染兼容性

- 使用 Ant Design Vue 的 Table 组件
- 需确认 `ant-design-vue` 版本是否支持当前 API
- `columns` 映射逻辑假设 `result.columns` 是字符串数组

### 5. 图片预览 API

- 使用 `Image.preview()` 静态方法
- 需确认 Ant Design Vue 版本是否支持此 API（v4.0+ 才支持）
- 如果不支持，需改用自定义图片预览方案

### 6. XSS 安全风险

- 使用 `v-html` 渲染富文本，如果后端返回恶意 HTML 可能导致 XSS
- 建议：增加 DOMPurify 等 HTML 消毒库处理 `content_html`

---

## ❌ 四、潜在报错点

### 1. 编译时报错

- 如果 `ant-design-vue` 未正确引入 Table 组件，会报 "Failed to resolve component: Table"
- 如果 `Image.preview` API 不存在，会报 "Image.preview is not a function"
- 如果 `AiScreenshotList.vue` 中 `import utils/image` 路径错误，会报模块找不到

### 2. 运行时报错

- 后端返回 JSON 格式不符合预期（如缺少 `success` 字段），可能导致 `lastItem` 赋值异常
- `result.columns.map` 如果 `columns` 不是数组，会报 "columns.map is not a function"
- `exportToExcel` 如果 `data` 或 `columns` 为空数组，导出文件可能为空
- 网络断开时 fetch 会抛出 TypeError，但已在 catch 中处理

### 3. 样式相关

- `:deep(img)` 选择器需确认 Vue 3 scoped 样式是否正常工作
- 富文本中 img 可能不受 scoped 样式限制，需全局样式兜底

### 4. 类型相关

- `chatList` 的类型定义为 `TdChatItemMeta[]`，但实际 push 的对象包含 `tableData` 等额外字段
- TypeScript 可能报类型不兼容警告，建议使用 `any` 或扩展接口定义

---

## ✅ 五、验证建议

### 1. 联调前确认

- 后端 `/aIChatAction/chat.do` 是否支持表单格式请求
- 后端是否必须传 `history` 参数
- `vite.config.mts` 中 `/spd-api` 代理是否正确配置

### 2. 功能测试

- 发送普通文本，验证 text 类型渲染
- 发送 SQL 查询，验证 table 类型 + 导出按钮
- 发送知识库问题，验证 knowledge-rich/text 类型 + 截图
- 发送富文本问题，验证 html 类型渲染
- 点击图片验证预览功能
- 点击导出按钮验证 Excel 下载
- 测试取消请求功能（AbortController）
- 测试清空历史消息功能

### 3. 边界测试

- 后端返回空数据时是否正常
- 网络断开时是否有错误提示
- 连续快速发送多次请求是否会有竞态问题
- 清空对话后重新发送是否正常

---

## 📊 六、改动前后对比

| 维度 | 改动前 | 改动后 |
| --- | --- | --- |
| **请求接口** | `/ai/chat` | `/spd-api/aIChatAction/chat.do` |
| **通信方式** | SSE 流式（逐字推送） | 非流式 JSON（等待完整响应） |
| **请求格式** | `application/json` | `application/x-www-form-urlencoded` |
| **请求参数** | `{ messages, validate, type }` | `{ msg }` |
| **回复类型** | 纯文本/Markdown | 纯文本、SQL表格、富文本、知识库图文 |
| **图片处理** | 无 | `normalizeImageUrl` + `normalizeHtmlImages` |
| **表格导出** | 无 | `exportToExcel` 通过表单提交 |
| **截图展示** | 无 | 知识库回复支持截图列表 |
| **请求取消** | `abortController.abort()` 中断 ReadableStream | `AbortController` + `signal` 取消 fetch |
| **清空历史** | 仅前端清空数组 | 调用 `/clearChatHistory.do` 接口 + 前端清空 |

---

## 📝 七、已实现的改动点

### tdChatArea.vue

- [x] SSE 流式改为非流式 JSON 请求
- [x] 支持 5 种回复类型渲染（text、html、table、knowledge-rich、knowledge-text）
- [x] 表格渲染 + 导出 Excel 功能
- [x] 知识库截图列表展示
- [x] 图片地址规范化处理
- [x] 移除流式相关代码和停止按钮

### antdxChatArea.vue

- [x] SSE 流式改为非流式 JSON 请求
- [x] 支持 4 种回复类型渲染（sql_query、chat_html、knowledge、chat）
- [x] 表格渲染 + 导出 Excel 功能
- [x] 知识库截图 HTML 拼接展示
- [x] 图片地址规范化处理
- [x] AbortController 请求取消支持
- [x] 清空历史消息接口调用
- [x] 修复 Bubble.List placeholder 空白问题
- [x] 修复接口响应未解析问题

### 工具函数

- [x] `utils/image.ts` - 图片地址规范化
- [x] `utils/export.ts` - 表格导出功能
- [x] `AiScreenshotList.vue` - 截图列表组件
