# 修改后 AI 助手代码详解 - antdxChatArea.vue

这是一个基于 **Ant Design X** 组件库的 AI 智能助手聊天面板组件，实现了完整的对话交互功能。

---

## 一、依赖引入（1-51 行）

### 1. 类型定义（2-10 行）

```typescript
import type {
  AttachmentsProps,
  BubbleListProps,
  BubbleProps,
  PromptsProps,
} from 'ant-design-x-vue';
import type { VNode } from 'vue';
```

引入 Ant Design X 和 Vue 的 TypeScript 类型，用于**类型约束和 IDE 提示**。

---

### 2. Vue API（11 行）

```typescript
import { computed, h, onMounted, onUnmounted, ref } from 'vue';
```

| API           | 作用                               |
| ------------- | ---------------------------------- |
| `computed`    | 创建计算属性，依赖变化自动重新计算 |
| `h`           | 渲染函数，用 JS 创建虚拟 DOM 节点  |
| `onMounted`   | 组件挂载后执行的生命周期钩子       |
| `onUnmounted` | 组件卸载时执行，用于清理           |
| `ref`         | 创建响应式变量                     |

---

### 3. 图标（13-19 行）

```typescript
import { AntdClearOutlined, AntdCloudUploadOutlined, ... } from '@vben/chc-icons';
```

项目自定义图标库，提供清除、上传、省略号、火焰（热点）、分享等图标。

---

### 4. 用户信息（21 行）

```typescript
import { useUserStore } from '@vben/stores';
```

Vben 框架的状态管理，获取当前登录用户信息（头像、姓名等）。

---

### 5. UI 组件库（23-41 行）

```typescript
import { Avatar, Button, ... } from 'ant-design-vue';          // Ant Design Vue
import { Attachments, Bubble, Prompts, Sender, ... } from 'ant-design-x-vue'; // Ant Design X
import markdownit from 'markdown-it';                            // Markdown 解析器
```

**核心组件说明**：

| 组件          | 用途                                   |
| ------------- | -------------------------------------- |
| `Bubble`      | 聊天气泡组件，支持列表、头像、加载状态 |
| `Sender`      | 输入框组件，支持发送/取消/附件/语音    |
| `Prompts`     | 提示词快捷按钮                         |
| `Welcome`     | 欢迎页组件                             |
| `Attachments` | 附件上传组件                           |
| `useXAgent`   | AI 请求代理 Hook                       |
| `useXChat`    | 聊天状态管理 Hook                      |
| `markdownit`  | 将 Markdown 文本转为 HTML              |

---

### 6. 本地资源（44-50 行）

```typescript
import aiAssistantAvatar from '#/assets/images/aiAssistantNoBg.png?url';
import defaultAvatar from '#/assets/images/avatar.jpeg?url';
import { getTimePeriod } from '#/utils/util';
import RecordBtn from './recordBtn.vue';
import { exportToExcel } from './utils/export';
import { normalizeHtmlImages, normalizeImageUrl } from './utils/image';
```

| 引入                  | 用途                              |
| --------------------- | --------------------------------- |
| AI 助手头像           | 对话中 AI 的头像                  |
| 默认头像              | 用户无头像时的兜底头像            |
| `getTimePeriod`       | 获取时间段（早上/中午/下午/晚上） |
| `RecordBtn`           | 语音录音按钮组件                  |
| `exportToExcel`       | 导出 Excel 功能                   |
| `normalizeHtmlImages` | 规范化富文本中的图片 URL          |
| `normalizeImageUrl`   | 规范化单个图片 URL                |

---

## 二、样式定义（57-135 行）

```typescript
const styles = computed(() => { ... });
```

使用 `computed` 动态生成样式对象，依赖 `theme.useToken()` 获取主题 token（圆角、颜色、阴影等），**实现主题跟随**。

| 样式块        | 用途                       |
| ------------- | -------------------------- |
| `layout`      | 最外层容器，100% 宽高      |
| `chat`        | 聊天区域，flex 纵向布局    |
| `messages`    | 消息列表区域，自动滚动     |
| `sender`      | 输入框样式，带阴影         |
| `placeholder` | 占位区（无消息时的欢迎页） |

---

## 三、提示词配置（141-181 行）

### 占位提示词（`placeholderPromptsItems`）

```typescript
{
  label: renderTitle(🔥, '热点话题'),
  description: '你对什么感兴趣？',
  children: [
    { description: '系统里有什么新功能？' },
    { description: '系统有哪些基本功能？' },
    { description: '系统里和我的角色相关的功能？' },
  ],
}
```

当没有对话时展示的**快捷提问按钮**，用户点击即可直接发送。

---

## 四、角色配置（183-218 行）

```typescript
const roles: BubbleListProps['roles'] = {
  ai: { placement: 'start', avatar: h(Avatar, { src: aiAssistantAvatar }) },
  local: {
    placement: 'end',
    avatar: h(Avatar, { src: userStore.userInfo?.avatar }),
  },
  node: { placement: 'start' }, // 无头像，用于分割线等非消息节点
};
```

**三种角色**：

- **`ai`**：AI 助手，左侧显示，带 AI 头像
- **`local`**：用户，右侧显示，带用户头像
- **`node`**：普通节点，无头像（用于"清除历史消息"分割线）

---

## 五、Markdown 渲染器（219-227 行）

```typescript
const md = markdownit({ html: true, breaks: true });
const renderMarkdown = (content) =>
  h(Typography, {}, () => h('div', { innerHTML: md.render(content) }));
```

- `html: true` - 允许 HTML 标签
- `breaks: true` - 换行符转 `<br>`
- 最终通过 `innerHTML` 注入到 `Typography` 组件

---

## 六、状态变量（228-240 行）

```typescript
const headerOpen = ref(false); // 附件面板展开状态
const content = ref(''); // 输入框内容
const attachedFiles = ref([]); // 已上传文件列表
const agentRequestLoading = ref(false); // AI 请求加载中状态
const sqlTableData = ref(null); // SQL 查询结果（用于导出）
const currentAbortController = ref(null); // 请求取消控制器
```

---

## 七、核心请求逻辑（242-392 行）⭐

### 7.1 `useXAgent` - AI 请求代理

```typescript
const [agent] = useXAgent<string, { message: string }, string>({
  request: async ({ message }, { onUpdate, onSuccess, onError }) => { ... }
});
```

这是整个组件的**核心引擎**，负责发起 AI 请求并处理响应。

**请求流程**：

```
1. agentRequestLoading = true（显示 loading）
2. 创建 AbortController（支持取消）
3. onUpdate('')（触发 loading 气泡）
4. fetch('/spd-api/aIChatAction/chat.do', { method: 'POST', body: 'msg=xxx' })
5. 解析 JSON 响应
6. 根据 type 字段渲染不同类型
7. onSuccess([replyText])（标记成功）
8. 或 onError(error)（标记失败）
```

### 7.2 四种响应类型处理（276-346 行）

| type                  | 渲染方式                      | 示例         |
| --------------------- | ----------------------------- | ------------ |
| `sql_query`           | HTML 表格 + 导出按钮          | 数据查询结果 |
| `chat_html`           | 富文本 HTML（规范化图片 URL） | 含图片的回答 |
| `from_knowledge_base` | 富文本/纯文本 + 截图列表      | 知识库回答   |
| 默认                  | 纯文本                        | 普通问答     |

**SQL 表格渲染逻辑**（280-313 行）：

```
生成 HTML：
┌─────────────────────────────┐
│ 共 495 条数据    📊 导出Excel │  ← 工具栏
├─────┬─────┬─────┬───────────┤  ← 表头
│ 列1 │ 列2 │ 列3 │ ...       │
├─────┼─────┼─────┼───────────┤
│ 值1 │ 值2 │ 值3 │ ...       │  ← 数据行
└─────┴─────┴─────┴───────────┘
```

**知识库回复逻辑**（316-343 行）：

```
内容（富文本或纯文本）+ 截图列表
                          ┌────────────────────┐
                          │ 📷 相关作业流程截图 │
                          ├──────┬──────┬──────┤
                          │ 图1  │ 图2  │ 图3  │  ← 可点击预览
                          └──────┴──────┴──────┘
```

### 7.3 `setMessages` 手动更新（348-360 行）

```typescript
setMessages((ori) => {
  return ori.map((item, index) => {
    return index === ori.length - 1
      ? { ...item, message: replyText, status: 'success' }
      : item;
  });
});
```

非流式响应需要**手动替换最后一条消息的内容和状态**（因为 `onUpdate('')` 先创建了一条空消息）。

### 7.4 取消请求处理（366-383 行）

```typescript
if (error.name === 'AbortError') {
  setMessages((ori) => {
    return ori.map((item, index) => {
      return index === ori.length - 1
        ? { ...item, message: '用户已取消', status: 'error' }
        : item;
    });
  });
  return;
}
```

用户点击取消按钮时，`AbortController.abort()` 会触发此分支，将最后一条消息显示为 "用户已取消"。

---

## 八、聊天状态管理（394-396 行）

```typescript
const { onRequest, messages, setMessages } = useXChat({ agent: agent!.value });
```

`useXChat` 是 Ant Design X 提供的聊天状态管理 Hook，封装了消息列表的增删改查。

| 方法          | 用途                         |
| ------------- | ---------------------------- |
| `onRequest`   | 发送新消息（用户输入后调用） |
| `messages`    | 响应式消息数组               |
| `setMessages` | 手动修改消息列表             |

---

## 九、事件处理（398-568 行）

### 9.1 发送消息（`onSubmit`）

```typescript
async function onSubmit(nextContent: string) {
  onRequest({ message: nextContent });
  content.value = '';
  // 滚动到底部
}
```

用户按回车或点击发送按钮时触发。

### 9.2 取消请求（`onCancel`）

```typescript
function onCancel() {
  if (currentAbortController.value) {
    currentAbortController.value.abort(); // 前端取消 fetch
  }
  agentRequestLoading.value = false;
}
```

### 9.3 提示词点击（`onPromptsItemClick`）

```typescript
const onPromptsItemClick = (info) => {
  onRequest({ message: info.data.description });
};
```

点击欢迎页的快捷提问按钮时，直接发送。

### 9.4 文件变更（`handleFileChange`）

```typescript
const handleFileChange = (info) => (attachedFiles.value = info.fileList);
```

附件上传/删除时更新文件列表。

---

## 十、消息列表构建（448-534 行）⭐

### 10.1 欢迎占位（`placeholderNode`）

```typescript
const placeholderNode = computed(() =>
  h(Space, {}, () => [
    h(Welcome, { title: 'xxx好，xxx。我是您的专属智能助手...' }),
    h(Prompts, { items: placeholderPromptsItems }),
  ]),
);
```

使用 `h` 函数创建虚拟 DOM，无消息时展示欢迎页 + 快捷提问。

### 10.2 消息项列表（`items`）

```typescript
const items = computed(() => {
  if (messages.value.length === 0) {
    return [{ content: placeholderNode, variant: 'borderless' }];
  }
  return [
    ...messages.value.map(({ id, message, status }) => ({
      key: id,
      loading: status === 'loading',
      messageRender: renderMarkdown,
      role: status === 'local' ? 'local' : 'ai',
      content: message,
    })),
    { content: h(Divider, {}, '清除历史消息'), role: 'node' },
  ];
});
```

**关键逻辑**：

- 无消息 → 返回占位节点
- 有消息 → 遍历生成消息项 + 底部"清除历史消息"分割线

---

## 十一、清除历史消息（535-568 行）

```typescript
const handleClearMsg = async () => {
  if (agentRequestLoading.value) {
    message.info('当前请求正在处理中，无法清除历史消息');
    return;
  }

  const res = await fetch('/spd-api/aIChatAction/clearChatHistory.do', {
    method: 'POST',
  });
  const result = await res.json();

  if (result.success) {
    message.success(result.message || '历史消息已清除');
    setMessages(() => []); // 清空前端消息
  }
};
```

**流程**：

1. 检查是否正在请求中，如果是则阻止
2. 调用后端清空接口
3. 清空前端消息列表

---

## 十二、导出与事件委托（570-595 行）

### 12.1 导出点击处理（`handleExportClick`）

```typescript
const handleExportClick = () => {
  if (sqlTableData.value) {
    exportToExcel(
      sqlTableData.value.data,
      sqlTableData.value.columns,
      `查询结果_${timestamp}`,
    );
  }
};
```

从 `sqlTableData` 取数据，调用 `exportToExcel` 通过隐藏表单 POST 到后端下载。

### 12.2 事件委托（`handleDocumentClick`）

```typescript
const handleDocumentClick = (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.closest('[data-ai-export="sql"]')) {
    handleExportClick();
  }
};
```

**为什么用事件委托？** 因为导出按钮是通过 `innerHTML` 动态插入的 HTML 字符串，不是 Vue 组件，无法用 `@click`。事件委托在 `document` 上监听，点击时冒泡到顶层统一处理。

---

## 十三、图片预览（597-615 行）

```typescript
(window as any).__previewImage = (url: string) => {
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position: fixed; top: 0; ... background: rgba(0,0,0,0.8);';
  overlay.onclick = () => document.body.removeChild(overlay);

  const img = document.createElement('img');
  img.src = url;
  img.onclick = (e) => e.stopPropagation(); // 点击图片不关闭

  overlay.appendChild(img);
  document.body.appendChild(overlay);
};
```

**为什么挂到 `window`？** 截图是 HTML 字符串，`onclick` 属性只能调用全局函数，所以注册到 `window`。

---

## 十四、生命周期与暴露（617-642 行）

### 14.1 `onMounted`

```typescript
onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});
```

注册导出按钮的事件委托。

### 14.2 `onUnmounted`

```typescript
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  delete (window as any).__previewImage;
});
```

**防止内存泄漏**：

- 移除 document 事件监听
- 删除全局预览函数

### 14.3 `defineExpose`

```typescript
defineExpose({
  refreshTimePeriod: () => {
    nowTimePeriod.value = getTimePeriod();
  },
});
```

暴露给父组件的方法，父组件可通过 `ref.value.refreshTimePeriod()` 刷新问候语。

---

## 十五、语音输入相关（634-642 行）

```typescript
const canTakeRecord = ref(true);
const handleUpdateIfCanTakeRecord = (val: boolean) => {
  canTakeRecord.value = val;
};
const finishTheLoadingAsk = (text: string) => {
  content.value = content.value + text;
};
```

控制录音按钮状态和语音识别结果回填到输入框。

---

## 十六、模板渲染（645-770 行）

```vue
<template>
  <div :style="styles.layout">
    <div :style="styles.chat">
      <!-- 消息列表 -->
      <Bubble.List
        ref="bubbleListRef"
        :items="items"
        :roles="roles"
        :auto-scroll="true"
      />

      <!-- 快捷提示词 -->
      <Prompts :items="senderPromptsItems" @item-click="onPromptsItemClick" />

      <!-- 输入框 -->
      <Sender
        :value="content"
        :loading="agentRequestLoading"
        @submit="onSubmit"
        @cancel="onCancel"
      >
        <template #footer>
          <RecordBtn />
          <!-- 语音按钮 -->
          <LoadingButton />
          <!-- 加载中按钮 -->
          <SendButton />
          <!-- 发送按钮 -->
        </template>
        <template #header>
          <Attachments />
          <!-- 附件上传 -->
        </template>
      </Sender>
    </div>
  </div>
</template>
```

**三层结构**：消息列表 → 提示词 → 输入框，纵向排列。

---

## 十七、样式（771-890 行）

| 样式块                                    | 用途                      |
| ----------------------------------------- | ------------------------- |
| `::v-deep(.markdown-body p)`              | Markdown 段落去除底部间距 |
| `::v-deep(.ai-table-wrapper)`             | SQL 表格容器              |
| `::v-deep(.ai-export-btn)`                | 导出按钮样式              |
| `::v-deep(.ai-screenshot-list)`           | 截图列表容器              |
| `::v-deep(.ai-screenshot-item img:hover)` | 截图 hover 放大效果       |

使用 `::v-deep()` 穿透 scoped 样式，影响 `innerHTML` 渲染的子元素。
