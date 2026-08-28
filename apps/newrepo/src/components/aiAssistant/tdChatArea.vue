<script setup lang="ts">
import type { TdChatItemMeta } from '@tdesign-vue-next/chat';

import { ref } from 'vue';

import {
  SvgLsiconMicrophoneFilled,
  SvgMaterialSymbolsLightKeyboardRounded,
} from '@vben/chc-icons';
import { useUserStore } from '@vben/stores';

import {
  Chat as TChat,
  ChatAction as TChatAction,
  ChatSender as TChatSender,
} from '@tdesign-vue-next/chat';
import { Button, message, Table } from 'ant-design-vue';

import aiAssistantAvatar from '#/assets/images/aiAssistant.png?url';
import defaultAvatar from '#/assets/images/avatar.jpeg?url';

import AiScreenshotList from './AiScreenshotList.vue';
import { MockSSEResponse } from './mockData';
import { exportToExcel } from './utils/export';
import { normalizeHtmlImages } from './utils/image';

const userStore = useUserStore();
const chatType = ref<'audio' | 'input'>('input');
const fetchCancel = ref<any>(null);
const loading = ref(false);
const getTimePeriod = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 将时间转换为分钟数，便于比较
  const totalMinutes = hours * 60 + minutes;

  // 定义时间段边界（以分钟为单位）
  const MORNING_START = 6 * 60; // 6:00
  const MORNING_END = 11 * 60 + 30; // 11:30
  const NOON_START = 11 * 60 + 30; // 11:30
  const NOON_END = 13 * 60 + 30; // 13:30
  const AFTERNOON_START = 13 * 60 + 30; // 13:30
  const AFTERNOON_END = 18 * 60; // 18:00

  if (totalMinutes >= MORNING_START && totalMinutes < MORNING_END) {
    return '早上';
  } else if (totalMinutes >= NOON_START && totalMinutes < NOON_END) {
    return '中午';
  } else if (totalMinutes >= AFTERNOON_START && totalMinutes < AFTERNOON_END) {
    return '下午';
  } else {
    return '晚上';
  }
};
const nowTimePeriod = ref<'下午' | '中午' | '早上' | '晚上'>(getTimePeriod());
// 倒序渲染
const chatList = ref<TdChatItemMeta[]>([
  // {
  //   content: `模型由 <span>hunyuan</span> 变为 <span>GPT4</span>`,
  //   role: 'model-change',
  // },
  {
    avatar: aiAssistantAvatar,
    name: 'AI助手',
    // datetime: `${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
    //  `${nowTimePeriod.value}好，${userStore.userInfo!.userRealName || userStore.userInfo!.userName}。我是您的专属智能助手，有什么可以帮到您的？`
    content: `${nowTimePeriod.value}好，${userStore.userInfo!.userRealName || userStore.userInfo!.userName}。我是您的专属智能助手，有什么可以帮到您的？`,
    role: 'assistant',
  },
  // {
  //   avatar: aiAssistantAvatar,
  //   name: '自己',
  //   datetime: '今天16:38',
  //   content: '南极的自动提款机叫什么名字？',
  //   role: 'user',
  // },
]);
const handleOperation = function (type: any, options: any) {
  console.warn('handleOperation', type, options);
};
const operation = function (type: any, options: any) {
  console.warn(type, options);
};
const clearConfirm = function () {
  chatList.value = [];
};
const inputValue = ref('');

const inputEnter = function () {
  if (!inputValue.value) return;
  const params = {
    avatar: userStore.userInfo?.avatar || defaultAvatar,
    name: '自己',
    content: inputValue.value,
    role: 'user',
  };
  chatList.value.unshift(params);
  // 空消息占位
  const params2 = {
    avatar: aiAssistantAvatar,
    name: 'AI助手',
    content: '',
    role: 'assistant',
  };
  chatList.value.unshift(params2);
  handleData(inputValue.value);
  inputValue.value = '';
};

/**
 * @date 2026-08-05
 * @prompt 处理 AI 请求，改为非流式 JSON 请求，支持多类型响应渲染
 * @description 发送请求到 /aIChatAction/chat.do，根据返回的 type 字段区分渲染（表格、富文本、知识库图文、纯文本）
 */
const handleData = async (inputValue: string) => {
  loading.value = true;
  const lastItem: any = chatList.value[0];

  try {
    const mockResponse = new MockSSEResponse();
    fetchCancel.value = mockResponse;

    const result = await mockResponse.getResponse(inputValue);

    if (result?.success) {
      const type = result.type || 'chat';

      if (type === 'sql_query') {
        // SQL 查询结果：表格渲染
        lastItem.tableData = result.data || [];
        lastItem.tableColumns = result.columns || [];
        lastItem.tableCount = result.count || 0;
        lastItem.replyType = 'table';
      } else if (type === 'chat_html') {
        // 富文本回复
        lastItem.contentHtml = normalizeHtmlImages(result.content);
        lastItem.replyType = 'html';
      } else if (result.from_knowledge_base) {
        // 知识库回复
        lastItem.screenshots = result.screenshots || [];
        if (result.content_html) {
          lastItem.contentHtml = normalizeHtmlImages(result.content_html);
          lastItem.replyType = 'knowledge-rich';
        } else {
          lastItem.content = result.content || '收到';
          lastItem.replyType = 'knowledge-text';
        }
      } else {
        // 普通文本
        lastItem.content = result.content || '收到';
        lastItem.replyType = 'text';
      }
    } else {
      lastItem.content = result.message || '抱歉，处理您的请求时出错了';
      lastItem.role = 'error';
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      message.info('已停止生成');
    } else {
      message.error('请求失败，请重试');
      lastItem.content = '网络异常，请检查连接';
      lastItem.role = 'error';
    }
  } finally {
    loading.value = false;
  }
};
let newAskObj: TdChatItemMeta = {};
const addAnLoadingAsk = () => {
  newAskObj = {
    avatar: userStore.userInfo?.avatar || defaultAvatar,
    name: '自己',
    content: '',
    role: 'user',
  };
  loading.value = true;
  chatList.value.unshift(newAskObj);
  // if (!msg) inputValue.value = msg;
  // inputEnter();
};
const finishTheLoadingAsk = (text: string) => {
  loading.value = false;
  newAskObj.content = text;
  if (text) {
    const params2 = {
      avatar: aiAssistantAvatar,
      name: 'AI助手',
      content: '',
      role: 'assistant',
    };
    chatList.value.unshift(params2);
    handleData(text);
  }
};
const toggleChatType = () => {
  chatType.value = chatType.value === 'input' ? 'audio' : 'input';
};
const backToInitStatus = () => {};
const recordBtnRef = ref();
// const canTakeRecord = computed(() => {
//   return recordBtnRef.value?.canTakeRecord || false;
// });
const canTakeRecord = ref(false);
const handleUpdateIfCanTakeRecord = (val: boolean) => {
  canTakeRecord.value = val;
};
defineExpose({
  refreshTimePeriod: () => {
    nowTimePeriod.value = getTimePeriod();
  },
});
</script>
<template>
  <TChat
    layout="single"
    :data="chatList"
    :clear-history="chatList.length > 0"
    :text-loading="loading"
    @on-action="operation"
    @clear="clearConfirm"
  >
    <!-- 'good', 'bad','replay', 'copy'  :operation-btn="[]"-->
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <template #actions="{ item, index }">
      <TChatAction
        :content="item.content"
        :operation-btn="['copy']"
        @operation="handleOperation"
      />
    </template>
    <!-- 根据 replyType 渲染不同内容 -->
    <template #content="{ item }">
      <!-- 1. 普通文本 -->
      <div v-if="!item.replyType || item.replyType === 'text'">
        {{ item.content }}
      </div>

      <!-- 2. HTML 富文本 -->
      <div
        v-else-if="item.replyType === 'html'"
        v-html="item.contentHtml"
        class="ai-rich-content"
      ></div>

      <!-- 3. SQL 表格 -->
      <div v-else-if="item.replyType === 'table'" class="ai-table-wrapper">
        <div class="ai-table-toolbar">
          <span class="ai-table-info">共 {{ item.tableCount }} 条数据</span>
          <Button
            type="primary"
            size="small"
            @click="
              exportToExcel(item.tableData, item.tableColumns, '查询结果')
            "
          >
            📥 导出 Excel
          </Button>
        </div>
        <Table
          :columns="
            item.tableColumns.map((col: string) => ({
              title: col,
              dataIndex: col,
              key: col,
            }))
          "
          :data-source="item.tableData"
          :pagination="false"
          size="small"
          bordered
        />
      </div>

      <!-- 4. 知识库 - 富文本 -->
      <div
        v-else-if="item.replyType === 'knowledge-rich'"
        class="ai-knowledge-wrapper"
      >
        <div v-html="item.contentHtml" class="ai-knowledge-content"></div>
        <AiScreenshotList
          :screenshots="item.screenshots"
          v-if="item.screenshots?.length"
        />
      </div>

      <!-- 5. 知识库 - 纯文本 -->
      <div
        v-else-if="item.replyType === 'knowledge-text'"
        class="ai-knowledge-wrapper"
      >
        <div>{{ item.content }}</div>
        <AiScreenshotList
          :screenshots="item.screenshots"
          v-if="item.screenshots?.length"
        />
      </div>
    </template>
    <template #footer>
      <TChatSender
        v-model="inputValue"
        class="chat-sender"
        :textarea-props="{
          placeholder: '请输入消息...',
        }"
        :disabled="chatType !== 'input'"
        :loading="loading"
        @send="inputEnter"
      >
        <template #inner-header>
          <div class="pl-[10px] pr-[10px]"></div>
        </template>
        <template #suffix>
          <!-- 监听键盘回车发送事件需要在sender组件监听 -->
          <RecordBtn
            ref="recordBtnRef"
            :is-stream-load="false"
            :add-an-loading-ask="addAnLoadingAsk"
            :back-to-init-status="backToInitStatus"
            :finish-the-loading-ask="finishTheLoadingAsk"
            v-show="chatType === 'audio' && canTakeRecord"
            @update-if-can-take-record="handleUpdateIfCanTakeRecord"
          />
          <Button
            v-show="chatType === 'input'"
            @click="inputEnter"
            type="link"
            :disabled="!inputValue"
          >
            发送
          </Button>
          <!-- v-show="canTakeRecord" -->
          <Button
            @click="toggleChatType"
            type="link"
            :disabled="!!inputValue || !canTakeRecord"
            :class="chatType === 'audio' ? 'ml-[6px]' : 'ml-[0]'"
          >
            <template #icon>
              <SvgMaterialSymbolsLightKeyboardRounded
                class="mb-[3px] text-[18px]"
                v-if="chatType === 'audio'"
              />
              <SvgLsiconMicrophoneFilled
                class="mb-[3px] text-[18px]"
                v-if="chatType === 'input'"
              />
            </template>
          </Button>
        </template>
      </TChatSender>
    </template>
  </TChat>
</template>
<style scoped>
/**
 * AI 助手聊天区域样式
 */

/* 富文本内容区域 */
.ai-rich-content {
  line-height: 1.6;
}

.ai-rich-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* SQL 表格容器 */
.ai-table-wrapper {
  margin-top: 8px;
}

.ai-table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 0;
}

.ai-table-info {
  font-size: 14px;
  color: #666;
}

/* 知识库内容容器 */
.ai-knowledge-wrapper {
  line-height: 1.6;
}

.ai-knowledge-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
