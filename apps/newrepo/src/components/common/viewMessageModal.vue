<script setup lang="ts">
import type { NotificationItem } from '@vben/chc-ui';

import { Button } from 'ant-design-vue';

withDefaults(
  defineProps<{
    messageInfo: NotificationItem;
    showBtns: boolean;
    // title: string;
  }>(),
  {
    // title: '标题',
  },
);
const emit = defineEmits(['submit', 'cancel']);
function handleSubmit() {
  emit('submit', 'submit');
}
function handleCancel() {
  emit('cancel', 'cancel');
}
</script>
<template>
  <div style="width: 100%; padding: 0 20px" class="view-message-container">
    <div class="view-message-container__title">
      <h1
        style="
          margin-bottom: 10px;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
          color: hsl(var(--foreground));
          text-align: left;
        "
      >
        {{ messageInfo.title }}
        <!-- 欢迎回来 👋🏻 -->
      </h1>
      <p style="font-size: 14px; color: hsl(var(--muted-foreground))">
        {{ messageInfo.message }}
      </p>
      <p>
        {{ messageInfo.date }}
      </p>
      <div style="display: flex; gap: 10px; align-items: center">
        <Button
          v-if="showBtns"
          style="width: 100%; margin-top: 20px"
          size="large"
          @click="handleCancel"
        >
          关 闭
        </Button>
        <Button
          v-if="showBtns"
          type="primary"
          style="width: 100%; margin-top: 20px"
          size="large"
          @click="handleSubmit"
        >
          标记为已读
        </Button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.view-message-container__title {
  margin-bottom: 20px;

  /* background-color: pink; */
}
</style>
