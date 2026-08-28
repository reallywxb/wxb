<script setup lang="ts">
import type {
  AttachmentsProps,
  BubbleListProps,
  BubbleProps,
  PromptsProps,
} from 'ant-design-x-vue';

import type { VNode } from 'vue';

import { computed, h, onMounted, onUnmounted, ref } from 'vue';

import {
  AntdClearOutlined,
  AntdCloudUploadOutlined,
  AntdEllipsisOutlined,
  AntdFireOutlined,
  AntdShareAltOutlined,
} from '@vben/chc-icons';
// useAccessStore
import { useUserStore } from '@vben/stores';

import {
  Avatar,
  Button,
  Divider,
  Flex,
  message,
  Space,
  theme,
  Typography,
} from 'ant-design-vue';
import {
  Attachments,
  Bubble,
  Prompts,
  Sender,
  useXAgent,
  useXChat,
  Welcome,
} from 'ant-design-x-vue';
import markdownit from 'markdown-it';

import aiAssistantAvatar from '#/assets/images/aiAssistantNoBg.png?url';
import defaultAvatar from '#/assets/images/avatar.jpeg?url';
import { getTimePeriod } from '#/utils/util';

import RecordBtn from './recordBtn.vue';
import { exportToExcel } from './utils/export';
import { normalizeHtmlImages, normalizeImageUrl } from './utils/image';

defineOptions({ name: 'PlaygroundIndependentSetup' });
const userStore = useUserStore();
const nowTimePeriod = ref<'下午' | '中午' | '早上' | '晚上'>(getTimePeriod());
const { token } = theme.useToken();

const styles = computed(() => {
  return {
    layout: {
      width: '100%',
      // 'min-width': '970px',
      height: '100%',
      'border-radius': `${token.value.borderRadius}px`,
      display: 'flex',
      background: `${token.value.colorBgContainer}`,
      'font-family': `AlibabaPuHuiTi, ${token.value.fontFamily}, sans-serif`,
    },
    menu: {
      background: `${token.value.colorBgLayout}80`,
      width: '280px',
      height: '100%',
      display: 'flex',
      'flex-direction': 'column',
    },
    conversations: {
      padding: '0 12px',
      flex: 1,
      'overflow-y': 'auto',
    },
    chat: {
      height: '100%',
      width: '100%',
      // 'max-width': '700px',
      // margin: '0 auto',
      'box-sizing': 'border-box',
      display: 'flex',
      'flex-direction': 'column',
      // padding: `${token.value.paddingLG}px`,
      gap: '16px',
    },
    messages: {
      flex: 1,
      'overflow-y': 'auto',
    },
    placeholder: {
      'padding-top': '32px',
      'text-align': 'left',
      flex: 1,
      width: '100%',
    },
    sender: {
      'box-shadow': token.value.boxShadow,
    },
    logo: {
      display: 'flex',
      height: '72px',
      'align-items': 'center',
      'justify-content': 'start',
      padding: '0 24px',
      'box-sizing': 'border-box',
    },
    'logo-img': {
      width: '24px',
      height: '24px',
      display: 'inline-block',
    },
    'logo-span': {
      display: 'inline-block',
      margin: '0 8px',
      'font-weight': 'bold',
      color: token.value.colorText,
      'font-size': '16px',
    },
    addBtn: {
      background: '#1677ff0f',
      border: '1px solid #1677ff34',
      width: 'calc(100% - 24px)',
      margin: '0 12px 24px 12px',
    },
    iconStyle: {
      fontSize: 18,
      color: token.value.colorText,
    },
  } as const;
});
// const iconStyle = {
//   fontSize: 18,
//   color: token.value.colorText,
// };

function renderTitle(icon: VNode, title: string) {
  return h(Space, { align: 'start' }, () => [icon, h('span', title)]);
}

const placeholderPromptsItems: PromptsProps['items'] = [
  {
    key: '1',
    label: renderTitle(
      h(AntdFireOutlined, { style: { color: '#FF4D4F', marginTop: '3px' } }),
      '热点话题',
    ),
    description: '你对什么感兴趣？',
    children: [
      {
        key: '1-1',
        description: `查看最近三天的采购订单？`,
      },
      {
        key: '1-2',
        description: `采购流程是什么？`,
      },
      {
        key: '1-3',
        description: `系统的功能有哪些？`,
      },
    ],
  },
];

const senderPromptsItems: PromptsProps['items'] = [
  // {
  //   key: '1',
  //   description: 'Hot Topics',
  //   icon: h(AntdFireOutlined, { style: { color: '#FF4D4F' } }),
  // },
  // {
  //   key: '2',
  //   description: 'Design Guide',
  //   icon: h(AntdReadOutlined, { style: { color: '#1890FF' } }),
  // },
];

const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    // typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: '8px',
        // backgroundColor: 'pink',
      },
    },
    avatar: h(Avatar, { src: aiAssistantAvatar }),
  },
  local: {
    placement: 'end',
    variant: 'shadow',
    styles: {
      content: {
        borderRadius: '8px',
        // backgroundColor: 'skyblue',
      },
    },
    avatar: h(Avatar, { src: userStore.userInfo?.avatar || defaultAvatar }),
  },
  node: {
    placement: 'start',
    // typing: { step: 5, interval: 20 },
    styles: {
      content: {
        width: '100%',
        // borderRadius: '8px',
        // backgroundColor: 'pink',
      },
    },
    // avatar: h(Avatar, { src: aiAssistantAvatar }),
  },
};
const md = markdownit({ html: true, breaks: true });
const renderMarkdown: BubbleProps['messageRender'] = (content) =>
  h(
    Typography,
    { class: 'markdown-body' },
    {
      default: () => h('div', { innerHTML: md.render(content) }),
    },
  );
// ==================== State ====================
const headerOpen = ref(false);
const content = ref('');
const attachedFiles = ref<AttachmentsProps['items']>([]);
const agentRequestLoading = ref(false);
// 存储 SQL 表格数据，用于导出功能
const sqlTableData = ref<{
  data: Record<string, any>[];
  columns: string[];
  count: number;
} | null>(null);
// AbortController 用于取消请求
const currentAbortController = ref<AbortController | null>(null);

// ==================== Runtime ====================
/**
 * @date 2026-08-07
 * @prompt 改写 antdxChatArea 请求逻辑，从 SSE 流式改为非流式 JSON 请求
 * @description 使用 fetch 请求 /spd-api/aIChatAction/chat.do，支持多类型响应渲染
 */
const [agent] = useXAgent<string, { message: string }, string>({
  request: async ({ message }, { onUpdate, onSuccess, onError }) => {
    agentRequestLoading.value = true;

    // 创建新的 AbortController
    currentAbortController.value = new AbortController();

    // 调用 onUpdate 触发 loading 状态（参考原文件第 248 行）
    onUpdate('');

    try {
      const res = await fetch('/spd-api/aIChatAction/chat.do', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          msg: message,
        }).toString(),
        signal: currentAbortController.value.signal,
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const result = await res.json();

      if (result?.success) {
        const type = result.type || 'chat';
        let replyText = '';

        if (type === 'sql_query') {
          // SQL 查询结果：生成 HTML 表格 + 导出按钮
          const rows = result.data || [];
          const columns = result.columns || [];
          const count = result.count || 0;

          if (rows.length > 0 && columns.length > 0) {
            // 存储表格数据供导出使用
            sqlTableData.value = { data: rows, columns, count };

            // 生成 HTML 表格（含导出按钮）
            let html = '<div class="ai-table-wrapper">';
            html += '<div class="ai-table-toolbar">';
            html += `<span class="ai-table-info">共 ${rows.length} 条数据</span>`;
            html += `<button class="ai-export-btn" data-ai-export="sql">📊 导出Excel</button>`;
            html += '</div>';
            html += '<table class="ai-table"><thead><tr>';
            columns.forEach((col: string) => {
              html += `<th>${col}</th>`;
            });
            html += '</tr></thead><tbody>';
            rows.forEach((row: Record<string, any>) => {
              html += '<tr>';
              columns.forEach((col: string) => {
                html += `<td>${row[col] ?? ''}</td>`;
              });
              html += '</tr>';
            });
            html += '</tbody></table></div>';

            replyText = html;
          } else {
            replyText = '查询完成，没有找到数据。';
          }
        } else if (type === 'warning') {
          // 库存预警结果：取 data 第一个数据格式化成文本
          const firstData = result.data?.[0];
          if (firstData) {
            // 转义方括号，防止 markdown-it 将其解析为链接
            const escapeBrackets = (val: any) =>
              String(val).replace(/\[/g, '\\[').replace(/\]/g, '\\]');
            replyText = `⚠️ **库存预警提示**
              **商品信息**：${escapeBrackets(firstData['商品'] || result.product_name || '-')}
              **仓库信息**：${escapeBrackets(firstData['仓库'] || result.warehouse_name || '-')}
              **预警等级**：${firstData['预警等级'] || result.warning_level || '-'}
              **库存详情**：
              - 当前库存：${firstData['当前库存'] || result.current_stock || '-'}
              - 预测日均销量：${firstData['预测日均销量'] || result.predicted_daily_demand || '-'}
              - 再订货点：${firstData['再订货点'] || result.reorder_point || '-'}
              - 安全库存：${firstData['安全库存'] || result.safety_stock || '-'}
              - 缺口量：${firstData['缺口量'] || result.shortage || '-'}
              **预测策略**：${escapeBrackets(firstData['预测策略'] || result.strategy || '-')}`;
          } else {
            replyText = '暂无预警数据';
          }
        } else if (type === 'prediction') {
          // 销量预测结果：取 data 第一个数据格式化成文本
          const firstData = result.data?.[0];
          if (firstData) {
            // 转义方括号，防止 markdown-it 将其解析为链接
            const escapeBrackets = (val: any) =>
              String(val).replace(/\[/g, '\\[').replace(/\]/g, '\\]');

            replyText = `📊 **销量预测结果**
              **商品信息**：${escapeBrackets(firstData['商品'] || result.product_name || '-')}
              **仓库信息**：${escapeBrackets(firstData['仓库'] || result.warehouse_name || '-')}
              **预测详情**：
              - 预测天数：${firstData['预测天数'] || result.days || '-'} 
              - 预测销量：${firstData['预测销量'] || `${result.predicted_quantity?.toFixed(2) || '-'} `}
              - 预测策略：${escapeBrackets(firstData['预测策略'] || result.strategy || '-')}
              - 是否使用模型：${firstData['是否使用模型'] || (result.use_model ? '是' : '否')}`;
          } else {
            replyText = '暂无预测数据';
          }
        } else if (type === 'chat_html') {
          replyText = normalizeHtmlImages(result.content);
        } else if (result.from_knowledge_base) {
          // 知识库回复
          const screenshots = result.screenshots || [];
          let screenshotsHtml = '';

          // 拼接截图 HTML
          if (screenshots.length > 0) {
            screenshotsHtml = '<div class="ai-screenshot-list">';
            screenshotsHtml +=
              '<div class="ai-screenshot-title">📷 相关作业流程截图</div>';
            screenshots.forEach((s: { url: string; name?: string }) => {
              const normalizedUrl = normalizeImageUrl(s.url);
              screenshotsHtml += `<div class="ai-screenshot-item">`;
              screenshotsHtml += `<img src="${normalizedUrl}" alt="${s.name || ''}" onclick="event.preventDefault(); window.__previewImage('${normalizedUrl}')" style="cursor:pointer;" />`;
              if (s.name) {
                screenshotsHtml += `<div class="ai-screenshot-name">${s.name}</div>`;
              }
              screenshotsHtml += '</div>';
            });
            screenshotsHtml += '</div>';
          }

          if (result.content_html) {
            replyText =
              normalizeHtmlImages(result.content_html) + screenshotsHtml;
          } else {
            replyText = (result.content || '收到') + screenshotsHtml;
          }
        } else {
          replyText = result.content || '收到';
        }

        // 使用 setMessages 手动更新最后一条消息的内容和状态
        setMessages((ori) => {
          if (ori.length === 0) return ori;
          return ori.map((item, index) => {
            return index === ori.length - 1
              ? {
                  ...item,
                  message: replyText,
                  status: 'success',
                }
              : item;
          });
        });

        onSuccess([replyText]);
      } else {
        onError(new Error(result.message || '请求失败'));
      }
    } catch (error: any) {
      // 用户主动取消请求，不视为错误
      if (error.name === 'AbortError') {
        // console.log('请求已取消');
        // 将最后一条消息状态更新为 error，显示"已取消"
        setMessages((ori) => {
          if (ori.length === 0) return ori;
          return ori.map((item, index) => {
            return index === ori.length - 1
              ? {
                  ...item,
                  message: '用户已取消',
                  status: 'error',
                }
              : item;
          });
        });
        return;
      }
      console.error('请求失败:', error);
      onError(error);
    } finally {
      currentAbortController.value = null;
      agentRequestLoading.value = false;
    }
  },
});

const { onRequest, messages, setMessages } = useXChat({
  agent: agent!.value,
});
const bubbleListRef = ref();
// ==================== Event ====================
async function onSubmit(nextContent: string) {
  if (!nextContent) return;

  onRequest({
    message: nextContent,
  });

  content.value = '';
  // 每次输入，将滚动条滚动到底部
  if (bubbleListRef.value) {
    setTimeout(() => {
      bubbleListRef.value.nativeElement.scrollTo({
        top: bubbleListRef.value.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 0);
  }
}
function onCancel() {
  // 1. 前端取消 fetch 请求
  if (currentAbortController.value) {
    currentAbortController.value.abort();
  }
  agentRequestLoading.value = false;

  // fetch('/spd-api/aIChatAction/stopChat', {
  //   method: 'POST',
  // })
  //   .then((res) => res.json())
  //   .then((result) => {
  //     console.log('停止会话响应:', result);
  //   })
  //   .catch((error) => {
  //     console.error('通知后端停止失败:', error);
  //   });
}

const onPromptsItemClick: PromptsProps['onItemClick'] = (info) => {
  agentRequestLoading.value = true;
  onRequest({
    message: info.data.description as string,
  });
};

const handleFileChange: AttachmentsProps['onChange'] = (info) =>
  (attachedFiles.value = info.fileList);
// ==================== Nodes ====================
const placeholderNode = computed(() =>
  h(
    Space,
    { direction: 'vertical', size: 16, style: styles.value.placeholder },
    () => [
      h(Welcome, {
        variant: 'borderless',
        icon: h('img', { src: aiAssistantAvatar, style: { maxWidth: 'none' } }),
        title: `${nowTimePeriod.value}好，${userStore.userInfo!.userRealName || userStore.userInfo!.userName}。我是您的专属智能助手，有什么可以帮到您的？`,
        description: '我可以回答和系统相关的问题',
        extra: h(Space, {}, () => [
          h(Button, {
            icon: h(AntdShareAltOutlined),
            style: { display: 'none' },
          }),
          h(Button, {
            icon: h(AntdEllipsisOutlined),
            style: { display: 'none' },
          }),
        ]),
      }),
      h(Prompts, {
        title: () => '你想做哪些事情呢？',
        items: placeholderPromptsItems,
        styles: {
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        },
        onItemClick: onPromptsItemClick,
      }),
    ],
  ),
);

const items = computed<BubbleListProps['items']>(() => {
  if (messages.value.length === 0) {
    return [{ content: placeholderNode, variant: 'borderless' }];
  }
  return [
    ...messages.value.map(({ id, message, status }) => {
      return {
        key: id,
        loading: status === 'loading',
        messageRender: renderMarkdown,
        role: status === 'local' ? 'local' : 'ai', // || role === 'local'
        content: message,
      };
    }),
    {
      content: h(
        Divider,
        { class: 'w-full' },
        () =>
          h(
            'span',
            {
              type: 'text',
              class: 'text-[12px] flex cursor-pointer',
              onClick: handleClearMsg,
            },
            [
              h(AntdClearOutlined, { class: 'mr-[5px] text-[12px] mt-[3px]' }),
              '清除历史消息',
            ],
            // {
            //   default: '清除历史消息',
            //   icon: h(AntdClearOutlined, { class: 'mb-[2px]' }),
            // },
          ),
        // h(
        //   Button,
        //   { type: 'text', class: 'text-[12px]' },
        //   {
        //     default: '清除历史消息',
        //     icon: h(AntdClearOutlined, { class: 'mb-[2px]' }),
        //   },
        // ),
      ),
      variant: 'borderless',
      role: 'node',
    },
  ];
});
const handleClearMsg = async () => {
  // 如果正在请求中，先取消请求
  if (agentRequestLoading.value) {
    // onCancel();
    message.info('当前请求正在处理中，无法清除历史消息');
    return;
  }

  try {
    const res = await fetch('/spd-api/aIChatAction/clearChatHistory.do', {
      method: 'POST',
    });

    if (!res.ok) {
      message.error('清除历史消息失败');
      return;
    }

    const result = await res.json();
    console.log('清除历史消息响应:', result);

    if (result.success) {
      message.success(result.message || '历史消息已清除');
      setMessages(() => {
        return [];
      });
    } else {
      message.error(result.message || '清除历史消息失败');
    }
  } catch (error) {
    console.error('清除历史消息异常:', error);
    message.error('清除历史消息异常');
  }
};

// 处理导出按钮点击事件，使用事件委托监听 Bubble 内的导出按钮
// 点击导出按钮时从 sqlTableData 中获取数据并调用 exportToExcel
const handleExportClick = () => {
  if (sqlTableData.value) {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[-:T]/g, '');
    exportToExcel(
      sqlTableData.value.data,
      sqlTableData.value.columns,
      `查询结果_${timestamp}`,
    );
  }
};

// 事件委托处理函数（保存引用以便销毁）
const handleDocumentClick = (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.closest('[data-ai-export="sql"]')) {
    handleExportClick();
  }
};

// 全局图片预览函数（供 HTML 字符串中的 onclick 调用）
(window as any).__previewImage = (url: string) => {
  // 使用自定义遮罩层预览图片
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 9999; display: flex;
    align-items: center; justify-content: center; cursor: pointer;
  `;
  overlay.onclick = () => document.body.removeChild(overlay);

  const img = document.createElement('img');
  img.src = url;
  img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 4px;';
  img.onclick = (e) => e.stopPropagation(); // 点击图片不关闭

  overlay.appendChild(img);
  document.body.appendChild(overlay);
};

// 在组件挂载时添加事件委托
onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

// 在组件卸载时移除事件委托，防止内存泄漏
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  // 清理全局预览函数
  delete (window as any).__previewImage;
});
defineExpose({
  refreshTimePeriod: () => {
    nowTimePeriod.value = getTimePeriod();
  },
});

// 语音输入按钮功能
const canTakeRecord = ref(true);
const handleUpdateIfCanTakeRecord = (val: boolean) => {
  canTakeRecord.value = val;
};
const finishTheLoadingAsk = (text: string) => {
  // 将识别出来的文本添加到输入框中
  content.value = content.value + text;
};
</script>

<template>
  <div :style="styles.layout">
    <div :style="styles.chat">
      <!-- 🌟 消息列表 -->
      <Bubble.List
        ref="bubbleListRef"
        :items="items"
        :roles="roles"
        :style="styles.messages"
        :auto-scroll="true"
      >
        <!-- <template #avatar="scope" v-if="messages.length > 0">
          <Avatar
            :src="
              scope.item.role === 'ai'
                ? aiAssistantAvatar
                : userStore.userInfo?.avatar || defaultAvatar
            "
          />
        </template> -->
      </Bubble.List>

      <!-- 🌟 提示词 -->
      <Prompts :items="senderPromptsItems" @item-click="onPromptsItemClick" />

      <!-- 🌟 输入框 -->
      <!-- :disabled="agentRequestLoading" -->
      <Sender
        :value="content"
        :style="styles.sender"
        :actions="false"
        :loading="agentRequestLoading"
        :read-only="agentRequestLoading"
        @submit="onSubmit"
        @cancel="onCancel"
        :auto-size="{ minRows: 2, maxRows: 6 }"
        @change="(value) => (content = value)"
      >
        <template
          #footer="{
            info: {
              components: { SendButton, LoadingButton }, //SpeechButton
            },
          }"
        >
          <Flex justify="flex-end" align="center">
            <Flex align="center">
              <!-- <Badge :dot="attachedFiles.length > 0 && !headerOpen">
                <Button type="text" @click="() => (headerOpen = !headerOpen)">
                  <template #icon>
                    <AntdPaperClipOutlined />
                  </template>
                </Button>
              </Badge> -->
              <!-- <Button type="text" @click="handleClearMsg" title="清空历史消息">
                <template #icon>
                  <AntdClearOutlined class="text-[16px]" />
                </template>
              </Button>
              <Divider type="vertical" /> -->
              <!-- <component :is="SpeechButton" :style="styles.iconStyle" /> -->
              <RecordBtn
                :is-stream-load="agentRequestLoading"
                v-show="canTakeRecord"
                :finish-the-loading-ask="finishTheLoadingAsk"
                @update-if-can-take-record="handleUpdateIfCanTakeRecord"
              />
              <Divider type="vertical" v-show="canTakeRecord" />
              <component
                :is="LoadingButton"
                v-if="agentRequestLoading"
                type="default"
              />
              <component
                :is="SendButton"
                v-else
                type="primary"
                :disabled="false"
              />
            </Flex>
          </Flex>
        </template>
        <template #header>
          <Sender.Header
            title="文件"
            :open="headerOpen"
            :styles="{ content: { padding: 0 } }"
            @open-change="(open) => (headerOpen = open)"
          >
            <Attachments
              :before-upload="() => false"
              :items="attachedFiles"
              @change="handleFileChange"
            >
              <template #placeholder="type">
                <Flex
                  v-if="type && type.type === 'inline'"
                  align="center"
                  justify="center"
                  vertical
                  gap="2"
                >
                  <Typography.Text style="font-size: 30px; line-height: 1">
                    <AntdCloudUploadOutlined />
                  </Typography.Text>
                  <Typography.Title
                    :level="5"
                    style="margin: 0; font-size: 14px; line-height: 1.5"
                  >
                    文件上传
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    点击或拖拽文件到此处
                  </Typography.Text>
                </Flex>
                <Typography.Text v-if="type && type.type === 'drop'">
                  把文件放到这里
                </Typography.Text>
              </template>
            </Attachments>
          </Sender.Header>
        </template>
      </Sender>
    </div>
  </div>
</template>
<style scoped>
::v-deep(.markdown-body p) {
  margin-bottom: 0;
}

::v-deep(.ant-bubble-list) {
  /* 保留滚动条，不隐藏 */
}

/* SQL 表格样式 */
::v-deep(.ai-table-wrapper) {
  margin-top: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow-x: auto;
}

::v-deep(.ai-table-toolbar) {
  min-width: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

::v-deep(.ai-table-info) {
  font-size: 14px;
  color: #666;
}

::v-deep(.ai-export-btn) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 13px;
  color: #fff;
  background: #1677ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

::v-deep(.ai-export-btn:hover) {
  background: #4096ff;
}

::v-deep(.ai-table) {
  min-width: fit-content;
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

::v-deep(.ai-table thead) {
  background: #fafafa;
}

::v-deep(.ai-table th) {
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
}

::v-deep(.ai-table td) {
  padding: 8px 12px;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

::v-deep(.ai-table tbody tr:hover) {
  background: #fafafa;
}

/* 知识库截图样式 */
::v-deep(.ai-screenshot-list) {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e8e8e8;
}

::v-deep(.ai-screenshot-title) {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

::v-deep(.ai-screenshot-item) {
  display: inline-block;
  margin-right: 12px;
  margin-bottom: 8px;
  cursor: pointer;
}

::v-deep(.ai-screenshot-item img) {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #eee;
  transition: transform 0.2s;
}

::v-deep(.ai-screenshot-item img:hover) {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

::v-deep(.ai-screenshot-name) {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 4px;
}
</style>
