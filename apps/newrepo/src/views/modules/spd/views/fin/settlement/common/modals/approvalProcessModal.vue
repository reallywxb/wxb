<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { Button, Input } from 'ant-design-vue';
import { useSpdGrid } from '#/components/spd';

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
      searchForm.value.settlementId = modalData.settlementId;
      // searchForm.value.processId = modalData.processId;
      // ChcGridApi.query();
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});
const searchForm = ref({
  settlementId: undefined,
  // processId: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      // checkboxConfig: {
      //   checkMethod: (scope: any) => {
      //     return !modalOuterData.value.blackList.includes(
      //       scope.row.productCode,
      //     );
      //   },
      // },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'nodeName',
        title: '审批节点',
        sortable: true,
      },
      {
        field: 'wfstateName',
        title: '审批状态',
        width: '110',
        sortable: true,
      },
      {
        field: 'userName',
        title: '审批人',
        width: '110',
        sortable: true,
      },
      {
        field: 'updated',
        title: '审批时间',
        width: '120',
        sortable: true,
      },
    ],
    dataTableId: '/settlementAction/queryActivity.do',
    tableSearchExtraParams: searchForm.value,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[50%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="查看"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
