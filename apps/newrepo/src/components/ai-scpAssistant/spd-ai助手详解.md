# 当前 Vue3 项目 AI 助手实现说明

## 📁 文件目录结构

```
aiAssistant/
├── index.vue                  # 入口组件（悬浮/顶部按钮 + 抽屉弹窗）
├── tdChatArea.vue             # TDesign 聊天面板（主用）
├── antdxChatArea.vue          # Ant Design X 聊天面板（备用）
├── mockData.ts                # 开发期 Mock SSE 服务
├── recordBtn.vue              # 语音输入组件（长按录音）
└── use-draggable.ts           # 悬浮窗拖拽 Hook
```

---

## 🔄 整体架构流程

```
basic.vue（主布局）
  └─ 挂载 <AiAssistant> 组件
       └─ index.vue
            ├─ 悬浮按钮（fixed）/ 顶部菜单按钮（header）
            ├─ 点击打开 useVbenDrawer 抽屉
            └─ 抽屉内渲染聊天面板
                 ├─ tdChatArea.vue（TDesign 组件，默认）
                 └─ antdxChatArea.vue（Ant Design X 组件，可切换）
```

---

## 🧩 核心组件功能

### 一、入口组件（index.vue）

| 功能 | 说明 |
| --- | --- |
| **两种展示模式** | `positionType: fixed`（右下角悬浮） / `header`（顶部菜单按钮） |
| **拖拽功能** | 悬浮模式下支持拖拽，使用 `use-draggable.ts` Hook |
| **抽屉弹窗** | 使用 `useVbenDrawer`，宽度 600px，无底部按钮 |
| **组件切换** | 通过 `chatAreaType` prop 切换 TDesign / AntDX 聊天面板 |
| **刷新问候语** | 抽屉打开时调用子组件 `refreshTimePeriod()` 更新时段问候 |

### 二、TDesign 聊天面板（tdChatArea.vue）

| 功能             | 说明                                                   |
| ---------------- | ------------------------------------------------------ |
| **基础组件**     | `@tdesign-vue-next/chat` 的 `<TChat>`、`<TChatSender>` |
| **SSE 流式解析** | 支持 `dify` / `deepseek` / `coze` 三种模型格式         |
| **消息列表**     | `chatList` 数组，倒序渲染（`unshift`）                 |
| **打字机效果**   | 逐字追加到最新消息的 `content` 字段                    |
| **停止响应**     | 调用 `abortController.abort()` 中断 `ReadableStream`   |
| **清空历史**     | 确认弹窗后清空 `chatList`                              |
| **消息操作**     | 每条消息支持复制按钮                                   |
| **时段问候**     | 根据当前时间显示"早上好/中午好/下午好/晚上好"          |

### 三、Ant Design X 聊天面板（antdxChatArea.vue）

| 功能 | 说明 |
| --- | --- |
| **基础组件** | `ant-design-x-vue` 的 `Bubble.List`、`Sender`、`useXAgent`、`useXChat` |
| **Markdown 渲染** | 使用 `markdown-it` 渲染 AI 回复 |
| **快捷提示词** | 支持预设 Prompts 快捷发送 |
| **附件上传** | 支持文件上传功能 |

### 四、语音输入组件（recordBtn.vue）

| 功能           | 说明                                  |
| -------------- | ------------------------------------- |
| **长按录音**   | 自定义指令 `vLongpress` 监听长按事件  |
| **音频采集**   | 使用 `MediaRecorder` API 录制音频     |
| **时长校验**   | 最短 1 秒，最长 60 秒                 |
| **语音转文字** | 上传至 `/transcribe` 接口，回填输入框 |

### 五、Mock 服务（mockData.ts）

| 功能                   | 说明                             |
| ---------------------- | -------------------------------- |
| **MockSSEResponse 类** | 模拟 SSE 流式返回                |
| **调用接口**           | 请求 `/ai/chat` 接口获取真实响应 |
| **流式模拟**           | 逐字推送数据，模拟打字机效果     |

### 六、拖拽 Hook（use-draggable.ts）

| 功能         | 说明                                       |
| ------------ | ------------------------------------------ |
| **鼠标事件** | `mousedown` / `mousemove` / `mouseup`      |
| **边界限制** | 限制拖拽范围在可视区域内                   |
| **事件区分** | 区分 `click` 和 `drag`，避免拖拽误触发点击 |

---

## 🔌 使用的后端接口

| 序号 | 接口 URL      | 说明                | 请求方式 | 使用文件      |
| ---- | ------------- | ------------------- | -------- | ------------- |
| 1    | `/ai/chat`    | AI 对话（SSE 流式） | POST     | mockData.ts   |
| 2    | `/transcribe` | 语音转文字          | POST     | recordBtn.vue |

---

## 📊 与旧版（Layui）对比

| 维度         | 旧版（0805scp机器人）      | 新版（aiAssistant）              |
| ------------ | -------------------------- | -------------------------------- |
| **技术栈**   | jQuery + Layui + 原生 DOM  | Vue3 + TS + Vben + TDesign/AntDX |
| **后端路由** | `../aIChatAction/*.do`     | `/ai/chat`（网关代理）           |
| **通信方式** | 同步 AJAX（`$.ajax`）      | SSE 流式（`ReadableStream`）     |
| **状态管理** | 全局变量 `aiChatHistory[]` | Vue `ref/reactive`               |
| **语音输入** | 无                         | `recordBtn.vue`（长按录音）      |
| **模型支持** | 单一                       | dify / deepseek / coze 可切换    |
| **拖拽功能** | 无                         | `use-draggable.ts`               |

---

## 🔧 SSE 流式解析逻辑（tdChatArea.vue）

```
用户输入 → inputEnter()
  ├─ 添加用户消息到 chatList
  ├─ 添加空 AI 消息占位
  └─ handleData(inputValue)
       ├─ 创建 MockSSEResponse
       └─ fetchSSE(fetchFn, callbacks)
            ├─ reader.read() 获取 Stream
            ├─ decoder.decode() 解码
            ├─ 根据 modelType 解析不同格式
            │    ├─ dify: workflow_finished 判断结束
            │    ├─ deepseek: choices[0].delta.content
            │    └─ coze: reasoning_content
            └─ success callback → 逐字追加到 lastItem.content
```

---

## ⚙️ 全局集成

| 集成点 | 文件 | 说明 |
| --- | --- | --- |
| **主布局** | `src/layouts/basic.vue` | 在 `header-right-110` 挂载 `<AiAssistant>` |
| **新手引导** | `src/components/guideViews/globalGuide.ts` | 第 5 步引导用户点击 AI 助手 |
| **配置项** | 支持切换悬浮/顶部展示、TDesign/AntDX 组件 |
