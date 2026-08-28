<script setup lang="ts">
import type { TdChatItemMeta } from '@tdesign-vue-next/chat';

import { ref } from 'vue';

import {
  SvgLsiconMicrophoneFilled,
  SvgMaterialSymbolsLightKeyboardRounded,
  SvgMaterialSymbolsStopCircleOutline,
} from '@vben/chc-icons';
import { useUserStore } from '@vben/stores';

import {
  Chat as TChat,
  ChatAction as TChatAction,
  ChatSender as TChatSender,
} from '@tdesign-vue-next/chat';
import { Button } from 'ant-design-vue';

import aiAssistantAvatar from '#/assets/images/aiAssistant.png?url';
import defaultAvatar from '#/assets/images/avatar.jpeg?url';
import { deepClone } from '#/utils/util';

import { MockSSEResponse } from './mockData';

const userStore = useUserStore();
const chatType = ref<'audio' | 'input'>('input');
const fetchCancel = ref<any>(null);
const loading = ref(false);
const isStreamLoad = ref(false);
const modelType = ref<'coze' | 'deepseek' | 'dify'>('dify');
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
const onStop = function () {
  if (fetchCancel.value) {
    fetchCancel.value.abortController.abort();
    loading.value = false;
    isStreamLoad.value = false;
  }
};
const inputValue = ref('');

const inputEnter = function () {
  if (isStreamLoad.value) {
    return;
  }
  if (!inputValue.value) return;
  const params = {
    avatar: userStore.userInfo?.avatar || defaultAvatar,
    name: '自己',
    // datetime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    content: inputValue.value,
    role: 'user',
  };
  chatList.value.unshift(params);
  // 空消息占位
  const params2 = {
    avatar: aiAssistantAvatar,
    name: 'AI助手',
    // datetime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    content: '',
    role: 'assistant',
  };
  chatList.value.unshift(params2);
  handleData(inputValue.value);
  inputValue.value = '';
};
const fetchSSE = async (fetchFn: any, options: any) => {
  const response = await fetchFn();
  const { success, fail, complete } = options;
  // 如果不 ok 说明有请求错误
  if (!response.ok) {
    complete?.(false, response.statusText);
    fail?.();
    return;
  }
  const reader = response?.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;
  const bufferArr: any[] = [];
  let dataText = ''; // 记录数据
  const event: any = { data: null };
  reader
    .read()
    .then(function processText(content: any) {
      let isComplete = false;
      if (content.done) {
        isComplete = true;
        // 正常的返回
        // complete?.(true);
        // return;
      }
      const chunk = decoder.decode(content.value, { stream: true });
      const buffers = chunk.toString().split(/\r?\n/);
      bufferArr.push(...buffers);
      const i = 0;
      if (modelType.value === 'dify') {
        // 针对dify智能体做下特殊处理
        try {
          if (
            JSON.generalParse(buffers[0]!.slice(6)).event ===
            'workflow_finished'
          ) {
            isComplete = true;
          }
        } catch {
          if (buffers[0]!.includes(`"event":"workflow_finished"`)) {
            isComplete = true;
          }
          // console.log('buffers', buffers[0]);
        }
      }
      if (isComplete) {
        complete?.(true);
        // reader.releaseLock();
        return;
      }
      while (i < bufferArr.length) {
        const line = bufferArr[i];
        if (modelType.value === 'deepseek') {
          if (line && line.includes('data:') && line !== 'data: [DONE]') {
            const midLine = line;
            dataText = JSON.generalParse(midLine.slice(6)).choices[0].delta
              .content;
            event.data = dataText;
          }
        } else if (
          modelType.value === 'coze' &&
          line &&
          line.includes('data:') &&
          line !== 'data:"[DONE]"'
        ) {
          const midLine = line;

          try {
            if (JSON.generalParse(midLine.slice(5)).reasoning_content) {
              dataText = JSON.generalParse(midLine.slice(5)).reasoning_content;
              event.data = dataText;
            }
          } catch {}
        } else if (
          modelType.value === 'dify' &&
          line &&
          line.includes('data:')
        ) {
          const midLine = line;

          try {
            // console.log('midLine', JSON.generalParse(midLine.slice(6)).data.text);
            // console.log('dify', JSON.generalParse(line.slice(6)));
            if (JSON.generalParse(midLine.slice(6)).data.text) {
              dataText = JSON.generalParse(midLine.slice(6)).data.text;
              event.data = dataText;
            }
          } catch {
            // console.log('dify', midLine.slice(6));
          }

          // const midLine = line;
          // console.log('midLine', typeof JSON.generalParse(midLine.slice(5)));
        }

        if (event.data) {
          // console.log('event', event, event.data);
          const jsonData = deepClone(event);
          // console.log('jsonData', jsonData);
          success(jsonData);
          event.data = null;
        }
        bufferArr.splice(i, 1);
      }
      reader
        .read()
        .then(processText)
        .catch((error: Error) => {
          if (error.name === 'AbortError') {
            loading.value = false;
            isStreamLoad.value = false;
            return; // 直接返回，不进行错误处理
          }

          // 处理其他类型的错误
          console.error('请求失败:', error);
        });
    })
    .catch((error: Error) => {
      // reader.releaseLock();
      if (error.name === 'AbortError') {
        loading.value = false;
        isStreamLoad.value = false;
        return; // 直接返回，不进行错误处理
      }

      // 处理其他类型的错误
      console.error('请求失败:', error);
    });
};
const handleData = async (inputValue: string) => {
  loading.value = true;
  isStreamLoad.value = true;
  const lastItem: any = chatList.value[0];
  const mockResponse = new MockSSEResponse();
  fetchCancel.value = mockResponse;
  await fetchSSE(
    () => {
      return mockResponse.getResponse(inputValue, modelType.value);
    },
    {
      success(result: any) {
        loading.value = false;
        const { data } = result;
        lastItem.content += data;
        // console.log('fetchSSE---success', lastItem.content);
      },
      complete(isOk: any, msg: any) {
        if (!isOk || !lastItem.content) {
          lastItem.role = 'error';
          lastItem.content = msg;
        }
        // 控制终止按钮
        isStreamLoad.value = false;
        loading.value = false;
      },
    },
  );
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
    if (isStreamLoad.value) {
      return;
    }
    const params2 = {
      avatar: aiAssistantAvatar,
      name: 'AI助手',
      // datetime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
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
    :clear-history="chatList.length > 0 && !isStreamLoad"
    :text-loading="loading"
    :is-stream-load="isStreamLoad"
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
    <template #footer>
      <TChatSender
        v-model="inputValue"
        class="chat-sender"
        :textarea-props="{
          placeholder: '请输入消息...',
        }"
        :disabled="chatType !== 'input' || isStreamLoad"
        :loading="loading"
        @send="inputEnter"
      >
        <template #inner-header>
          <div class="pl-[10px] pr-[10px]"></div>
        </template>
        <template #suffix>
          <!-- 监听键盘回车发送事件需要在sender组件监听 -->
          <!-- <TButton theme="default" variant="text" size="large" class="btn" @click="inputEnter"> 发送 </TButton> -->
          <RecordBtn
            ref="recordBtnRef"
            :is-stream-load="isStreamLoad"
            :add-an-loading-ask="addAnLoadingAsk"
            :back-to-init-status="backToInitStatus"
            :finish-the-loading-ask="finishTheLoadingAsk"
            v-show="chatType === 'audio' && canTakeRecord"
            @update-if-can-take-record="handleUpdateIfCanTakeRecord"
          />
          <Button
            @click="onStop"
            v-show="isStreamLoad"
            type="link"
            title="停止响应"
          >
            <!-- <template #icon> -->
            <SvgMaterialSymbolsStopCircleOutline class="mb-[3px] text-[16px]" />
            <!-- </template> -->
          </Button>
          <Button
            v-show="!isStreamLoad && chatType === 'input'"
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
            :disabled="!!inputValue || !!isStreamLoad || !canTakeRecord"
            :class="
              chatType === 'audio' && !isStreamLoad ? 'ml-[6px]' : 'ml-[0]'
            "
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
        <!-- <template #prefix>
          <div>
            <Select
              v-model:value="modelType"
              class="costumSelect w-[110px] overflow-hidden"
            >
              <SelectOption value="dify"> dify智能体 </SelectOption>
              <SelectOption value="deepseek"> deepseek </SelectOption>
              <SelectOption value="coze"> 扣子智能体 </SelectOption>
            </Select>
          </div>
        </template> -->
      </TChatSender>
    </template>
  </TChat>
</template>
<style scoped></style>
