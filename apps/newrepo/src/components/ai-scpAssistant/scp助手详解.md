# SCP 智能助手模块说明

## 📁 文件目录结构

```
0805scp机器人/
├── index.html                          # 主框架页面入口
├── index.js                            # 主框架 JavaScript 逻辑
├── ai-chat.js                          # AI 聊天功能前端逻辑
├── knowledge-base.html                 # 知识库文档列表页面
├── knowledge-base.js                   # 知识库页面 JavaScript 逻辑
├── knowledge-base-detail.html          # 知识库文档详情页面
├── AIChatActionController接口文档.md   # 后端接口文档
└── scp助手.md                          # 本说明文档
```

---

## 🔗 文件之间的调用关系

### 1. 入口流程

```
index.html（主框架页面）
  └─ 加载 index.js（初始化整个系统）
       └─ 在初始化末尾检查 initAIChat 函数
            └─ 调用 ai-chat.js 中的 initAIChat()
                 └─ 初始化 AI 聊天窗口
```

### 2. AI 聊天功能

```
index.html（包含 AI 聊天窗口 HTML 结构）
  └─ 引入 ai-chat.js
       ├─ toggleAIChat()       - 打开/关闭聊天窗口
       ├─ sendAIMsg()          - 发送消息到后端
       ├─ appendAIMsg()        - 显示普通文本消息
       ├─ appendAIHtml()       - 显示富文本消息
       ├─ appendAITable()      - 显示数据表格结果
       ├─ exportToExcel()      - 导出表格到 Excel
       ├─ showAITyping()       - 显示"正在输入"动画
       └─ clearAIChat()        - 清空会话历史
```

### 3. 知识库管理功能

```
knowledge-base.html（知识库列表页面）
  └─ 引入 knowledge-base.js
       ├─ 上传文档（Word/PDF）
       ├─ 查看文档列表
       ├─ 审核文档
       ├─ 删除文档
       └─ 跳转到详情页

knowledge-base-detail.html（知识库文档详情页面）
  └─ 展示文档拆分后的知识片段
       └─ 调用接口获取拆分后的 chunk 列表
```

---

## 🧩 整体功能架构

### 一、主框架功能（index.js）

| 功能模块        | 说明                                              |
| --------------- | ------------------------------------------------- |
| **菜单管理**    | 一级菜单切换（平铺/下拉两种模式）、左侧菜单联动   |
| **Tab 页签**    | 新增/关闭页签、右键菜单（关闭/关闭其他/关闭全部） |
| **用户管理**    | 登录、登出、修改密码、切换机构                    |
| **消息提醒**    | 轮询获取未读消息（60秒一次），右下角弹窗提示      |
| **系统设置**    | 全屏切换、皮肤切换、页面刷新提示                  |
| **iframe 管理** | 多层嵌套 iframe 通信、路由 hash 监听              |

### 二、AI 聊天功能（ai-chat.js）

| 功能模块         | 说明                                           |
| ---------------- | ---------------------------------------------- |
| **对话交互**     | 输入问题、发送消息、接收 AI 回复、回车快捷发送 |
| **多种回复类型** | 普通文本、富文本（HTML）、数据表格、知识库图文 |
| **历史记录**     | 前端维护对话历史，支持清空会话                 |
| **表格导出**     | 查询结果可导出为 Excel 文件                    |
| **图片预览**     | 点击图片放大查看，点击关闭                     |
| **状态提示**     | 加载中动画、发送按钮防抖、错误提示             |

### 三、知识库管理功能

| 功能模块      | 说明                               |
| ------------- | ---------------------------------- |
| **文档上传**  | 支持 Word(.docx) 和 PDF(.pdf) 格式 |
| **自动拆分**  | Word 按标题拆分、PDF 按页拆分      |
| **文档列表**  | 分页查询、按类型/关键词搜索        |
| **审核/删除** | 对上传的文档进行审核或删除操作     |
| **详情查看**  | 查看拆分后的知识片段、图片、表格   |

---

## 🔌 使用的后端接口清单

### AI 聊天相关

| 序号 | 接口 URL | 说明 | 请求方式 | 代码位置 |
| --- | --- | --- | --- | --- |
| 1 | `aIChatAction/chat.do` | AI 聊天（非流式） | POST | ai-chat.js:63 |
| 2 | `aIChatAction/chatStream.do` | AI 聊天（流式 SSE） | GET/POST | **仅在接口文档中定义，代码未使用** |
| 3 | `aIChatAction/clearChatHistory.do` | 清空会话历史 | GET/POST | **接口文档中定义，代码未直接调用** |
| 4 | `aIChatAction/exportExcel.do` | 导出表格为 Excel | POST | ai-chat.js:269 |
| 5 | `aIChatAction/loadImage.do` | 加载图片 | GET | ai-chat.js:349（normalizeImageUrl 函数中拼接） |

### 知识库相关

| 序号 | 接口 URL | 说明 | 请求方式 | 代码位置 |
| --- | --- | --- | --- | --- |
| 6 | `aIChatAction/uploadKnowledge.do` | 上传知识库文档 | POST (multipart) | knowledge-base.js:51 |
| 7 | `aIChatAction/listDocuments.do` | 知识库文档列表 | GET/POST | knowledge-base.js:94 |
| 8 | `aIChatAction/auditDocument.do` | 审核文档 | POST | knowledge-base.js:187 |
| 9 | `aIChatAction/deleteDocument.do` | 删除文档 | POST | knowledge-base.js:205 |
| 10 | `aIChatAction/listChunks.do` | 获取文档拆分后的知识片段 | POST | knowledge-base-detail.html:139 |

### 主框架相关

| 序号 | 接口 URL | 说明 | 请求方式 | 代码位置 |
| --- | --- | --- | --- | --- |
| 11 | `initAction/logout.do` | 用户登出 | GET | index.js:91 |
| 12 | `userBaseHandleAction/updatePassword.do` | 修改密码 | POST | index.js:130, 181 |
| 13 | `userBaseHandleAction/getCurrentUser.do` | 获取当前用户信息 | POST | index.js:719 |
| 14 | `userBaseHandleAction/putCurrentOrg.do` | 切换当前机构 | POST | index.js:734 |
| 15 | `userTipsAction/pcTips.do` | 获取未读消息 | POST | index.js:203 |
| 16 | `userTipsAction/readTips.do` | 标记消息已读 | POST | index.js:286 |

---

## ⚠️ 技术栈差异提醒

本模块基于 **Layui + jQuery** 开发，与当前项目的 **Vue3 + Vben + Ant Design Vue** 技术栈存在较大差异。

**如需迁移到当前项目，建议：**

1. 使用 Vue3 组件重写 AI 聊天窗口
2. 使用 Vben 的 useVbenModal 实现弹窗交互
3. 使用 Ant Design Vue 的 Upload、Table 等组件替代 Layui 组件
4. 参考接口文档重新对接后端接口
5. 移除 jQuery 依赖，使用原生 fetch 或 axios
