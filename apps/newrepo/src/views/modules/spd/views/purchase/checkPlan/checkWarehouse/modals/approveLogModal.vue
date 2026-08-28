<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

import { usePageGridEnv } from './envOptions';

const modalOuterData = ref();
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      // searchForm.value.processId = modalData.processId;
      // searchForm.value.orderPlanId = modalData.orderPlanId;
      searchForm.value.asnId = modalData.asnId;
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});

const searchForm = ref({
  orderPlanId: undefined,
  processId: undefined,
  asnId: undefined,
  limit: 10_000,
  start: 0,
});
const { gridApproveOptions } = usePageGridEnv(searchForm);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: gridApproveOptions,
  },
  {},
);
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="验收记录"
    title-tooltip="验收记录列表"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
