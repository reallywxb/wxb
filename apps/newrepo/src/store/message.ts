import type { NotificationItem } from '@vben/chc-ui';

import { ref } from 'vue';

import { useUserStore } from '@vben/stores';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import {
  getMyMessageList,

  // readMessage,
} from '#/api/core/user';

const userStore = useUserStore();
export const useMessageStore = defineStore('system-message', () => {
  const messageList = ref<NotificationItem[]>([]);
  const websocketConnection = ref();
  const websocketHeartTimer = ref();
  const queryMessageTimer = ref();
  const cols = [
    { id: 'messageTime' },
    { id: 'messageType', dict: true },
    { id: 'content' },
    { id: 'orgId', dict: true },
    { id: 'isRead' },
    { id: 'id' },
    { id: 'createdBy' },
    { id: 'createTime' },
    { id: 'updatedBy' },
    { id: 'updateTime' },
    { id: 'versionstamp' },
  ];
  function setMessageList(data: any) {
    messageList.value = data;
  }
  function startWebsocketConnection() {
    // 建立链接
    websocketConnection.value = new WebSocket(
      `ws://192.168.20.48:8000` + `?id=${userStore.userInfo?.id}`,
    );
    // 定时发送心跳包
    websocketHeartTimer.value = setInterval(() => {
      // 判断链接是否正常,链接正常才能发送心跳包
      websocketConnection.value.readyState === 1 &&
        websocketConnection.value.send('ping');
    }, 10_000);
  }
  function stopWebsocketConnection() {
    websocketConnection.value.close();
    clearInterval(websocketHeartTimer.value);
    websocketConnection.value = null;
  }
  function addMessage(data: { records: NotificationItem[] }) {
    // messageList.value = data.records.map((item: any) => {
    //   return {
    //     avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    //     date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    //     isRead: item.isRead,
    //     message: item.content,
    //     title: item.messageType,
    //     ...item,
    //   };
    // });
    const ids = new Set(messageList.value.map((item) => item.id));
    messageList.value = [
      ...data.records.filter((item) => !ids.has(item.id)),
      ...messageList.value,
    ].map((item: any) => {
      return {
        avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
        date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isRead: item.isRead,
        message: item.content,
        title: item.messageType,
        ...item,
      };
    });
  }
  function refreshMessageList() {
    return new Promise((resolve, reject) => {
      getMyMessageList({
        cols,
        current: 1,
        size: 500,
        sort: ['messageTime desc'],
        start: 0,
        isRead: false,
        messageType: '',
        messageTime: '',
      })
        .then((res) => {
          addMessage(res);
          resolve(messageList.value);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  function initMessageList() {
    return new Promise((resolve, reject) => {
      getMyMessageList({
        cols,
        current: 1,
        size: 500,
        sort: ['messageTime desc'],
        start: 0,
        isRead: false,
        messageType: '',
        messageTime: '',
      })
        .then((data) => {
          messageList.value = data.records.map((item: any) => {
            return {
              avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
              date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              isRead: item.isRead,
              message: item.content,
              title: item.messageType,
              ...item,
            };
          });
          resolve(messageList.value);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  function startQueryMessageInterval() {
    queryMessageTimer.value && clearInterval(queryMessageTimer.value);
    queryMessageTimer.value = setInterval(() => {
      getMyMessageList({
        cols,
        current: 1,
        size: 500,
        sort: ['messageTime desc'],
        start: 0,
        isRead: false,
        messageType: '',
        messageTime: '',
      }).then((res) => {
        addMessage(res);
      });
    }, 5000);
  }
  function stopQueryMessageInterval() {
    queryMessageTimer.value && clearInterval(queryMessageTimer.value);
    queryMessageTimer.value = null;
  }
  function websocketMessageListener(event: MessageEvent) {
    const message = JSON.generalParse(event.data);
    if (message && message.id) {
      messageList.value = [message, ...messageList.value].map((item: any) => {
        return {
          avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
          date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          isRead: item.isRead,
          message: item.content,
          title: item.messageType,
          ...item,
        };
      });
    }
  }
  function startWebsocket() {
    if (!websocketConnection.value) {
      // 创建一个新的WebSocket连接
      startWebsocketConnection();
      websocketConnection.value.addEventListener(
        'message',
        websocketMessageListener,
      );
    }
  }
  function stopWebsocket() {
    if (websocketConnection.value) {
      // 创建一个新的WebSocket连接
      websocketConnection.value.removeEventListener(
        'message',
        websocketMessageListener,
      );
      stopWebsocketConnection();
    }
  }
  function $reset() {
    messageList.value = [];
    stopWebsocket();
    stopQueryMessageInterval();
  }
  return {
    messageList,
    setMessageList,
    initMessageList,
    // startWebsocketConnection,
    websocketConnection,
    // stopWebsocketConnection,
    refreshMessageList,
    startQueryMessageInterval,
    stopQueryMessageInterval,
    startWebsocket,
    stopWebsocket,
    $reset,
  };
});
