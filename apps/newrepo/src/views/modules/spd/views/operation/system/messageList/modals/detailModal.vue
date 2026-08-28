<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

const serviceData = ref<any>({});
const title = ref('编辑');
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
      title.value = `消息编号:${serviceData.value.AD_USER_TIPS_ID}`;
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
</script>
<template>
  <Modal class="h-[300px] w-[400px]" :title="title" title-tooltip="">
    <div class="p-2">
      <div class="text-center text-xl font-semibold">
        {{ serviceData.Title }}
      </div>
      <div class="text-center text-sm font-semibold">
        {{ serviceData.Created }}
      </div>
      <div
        class="mb-[20px] mt-[20px]"
        style="border-bottom: 1px solid #999"
      ></div>
      <div>{{ serviceData.Content }}</div>
    </div>
  </Modal>
</template>
