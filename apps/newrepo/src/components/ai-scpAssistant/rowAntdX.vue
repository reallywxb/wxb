<script setup lang="ts">
import type {
  AttachmentsProps,
  BubbleListProps,
  BubbleProps,
  PromptsProps,
} from 'ant-design-x-vue';

import type { VNode } from 'vue';

import { computed, h, ref } from 'vue';

import {
  AntdClearOutlined,
  AntdCloudUploadOutlined,
  AntdEllipsisOutlined,
  AntdFireOutlined,
  AntdShareAltOutlined,
} from '@vben/chc-icons';
// useAccessStore
import { useAccessStore, useUserStore } from '@vben/stores';

import {
  Avatar,
  Button,
  Divider,
  Flex,
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
  XRequest,
} from 'ant-design-x-vue';
import markdownit from 'markdown-it';

import aiAssistantAvatar from '#/assets/images/aiAssistantNoBg.png?url';
import defaultAvatar from '#/assets/images/avatar.jpeg?url';
import { AI_MODEL_CHECK_URL } from '#/const';
import { getTimePeriod } from '#/utils/util';

import RecordBtn from './recordBtn.vue';

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
        description: `系统里有什么新功能？`,
      },
      {
        key: '1-2',
        description: `系统有哪些基本功能？`,
      },
      {
        key: '1-3',
        description: `系统里和我的角色相关的功能？`,
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

// ==================== Runtime ====================
const exampleRequest = XRequest({
  baseURL: '/ai/chat',
  // model: MODEL,
  // dangerouslyApiKey: API_KEY
});
const accessStore = useAccessStore();
const currentWholeMsg = ref('');
const handleSuccess = ref();
const [agent] = useXAgent<string, { message: string }, string>({
  // baseURL: '/ai/chat',
  request: async ({ message }, { onUpdate, onSuccess }) => {
    agentRequestLoading.value = true;
    const accessStore = useAccessStore();
    let wholeMsg = '';
    currentWholeMsg.value = '';
    onUpdate(wholeMsg);
    await exampleRequest.value.create(
      {
        messages: [{ content: message }],
        validate: {
          url: `${AI_MODEL_CHECK_URL}/baseHandleAction/vendor.do`, // ai接口会调用此接口校验用户信息
          token: accessStore.accessToken, // ai校验使用的token
          method: 'POST', // ai校验接口方法
        },
        type: 'dify',
        area: 0,
      },
      {
        onSuccess: () => {
          // console.log('onSuccess', messages);
        },
        onError: (error) => {
          agentRequestLoading.value = false;
          onSuccess([
            `${wholeMsg}\n<span style="color:red">获取数据异常</span>`,
          ]);
          console.error('onError', error);
        },
        onUpdate: (msg) => {
          // console.log('onUpdate', JSON.stringify(messages.value));
          if (msg && msg.data) {
            // console.log('onUpdate', JSON.generalParse(msg.data));
            const msgObj = JSON.generalParse(msg.data);
            if (msgObj.data.text) {
              // console.log('onUpdate', msgObj.data.text);
              // console.log('onUpdate', wholeMsg);
              wholeMsg += msgObj.data.text;
              currentWholeMsg.value += msgObj.data.text;
              // onUpdate(wholeMsg);
              setMessages((ori) => {
                return ori.map((item, index) => {
                  return index === ori.length - 1
                    ? {
                        ...item,
                        message: wholeMsg,
                        status: wholeMsg ? 'success' : 'loading',
                      }
                    : item;
                  // if (index === ori.length - 1) {
                  //   console.log('item', item.message);
                  //   return {
                  //     ...item,
                  //     message: wholeMsg,
                  //     status: wholeMsg ? 'success' : 'loading',
                  //   };
                  // } else {
                  //   return item;
                  // }
                });
              });
            }
            if (msgObj.event === 'workflow_finished') {
              agentRequestLoading.value = false;
              onSuccess([wholeMsg]);
            }
          }

          // onUpdate(msg);
          //       async ({ message }, { onSuccess }) => {
          //   agentRequestLoading.value = true;
          //   await sleep();
          //   agentRequestLoading.value = false;
          //   onSuccess([`Mock success return. You said: ${message}`]);
          // },
        },
        onStream: (abortController) => {
          handleSuccess.value = onSuccess;
          AbortController.value = abortController;
        },
      },
    );
  },
});
const AbortController = ref<AbortController>();
const { onRequest, messages, setMessages } = useXChat({
  agent: agent!.value,
  // requestPlaceholder: '获取数据中',
  // transformMessage: (params) => {
  //   // console.log('originMessage', params.originMessage);
  //   const midLine = params.chunk;
  //   let dataText = '';
  //   try {
  //     const text = JSON.generalParse(midLine.slice(6)).data.text;

  //     dataText = text || '';
  //     // return text || '';
  //   } catch {
  //     dataText = '';
  //     // return '';
  //   }
  //   // console.log('transformMessage', dataText);
  //   return (params.originMessage || '') + dataText;
  // },
  // resolveAbortController(abortController) {
  //   AbortController.value = abortController;
  // },
  // transformStream: new TransformStream({
  //   transform(chunk, controller) {
  //     // if()
  //     try {
  //       const text = JSON.generalParse(chunk.slice(6));
  //       // console.log('transformStream', text);
  //       if (text.event === 'workflow_finished') {
  //         controller.terminate();
  //         // agentRequestLoading.value = false;
  //       }
  //       // dataText = text || '';
  //       // return text || '';
  //     } catch {
  //       // console.log('transformStream', chunk);
  //       // dataText = '';
  //       // return '';
  //     }
  //     // console.log('transformStream', chunk);
  //     controller.enqueue(chunk);
  //   },
  // }),
});
const bubbleListRef = ref();
// ==================== Event ====================
async function onSubmit(nextContent: string) {
  if (!nextContent) return;
  // 将滚动条拖到底部
  agentRequestLoading.value = true;
  onRequest({
    message: nextContent,
    validate: {
      url: `${AI_MODEL_CHECK_URL}/baseHandleAction/vendor.do`, // ai接口会调用此接口校验用户信息
      token: accessStore.accessToken, // ai校验使用的token
      method: 'POST', // ai校验接口方法
    },
    type: 'dify',
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
  AbortController.value?.abort();
  handleSuccess.value([currentWholeMsg.value]);
  agentRequestLoading.value = false;
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
const handleClearMsg = () => {
  // 如果正在请求中，先取消请求
  if (agentRequestLoading.value) {
    onCancel();
  }
  if (messages.value.length > 0) {
    setMessages(() => {
      return [];
    });
  }
};
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
  scrollbar-width: none;
}
</style>
