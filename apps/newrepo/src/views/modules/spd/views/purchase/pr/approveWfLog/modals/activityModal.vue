<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalTitle = ref('查看');
const modalData = ref<Record<string, any>>({});

const [ChcGridUI, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // radioChange: ({ row }: { row: any }) => {
      //   console.warn('父表格 radioChange', row);
      //   // 请求子表  多个子表请求
      // },
    },
  },
  {
    gridColumns: [
      {
        type: 'seq',
        width: '50',
        align: 'center',
        title: '序号',
      },
      {
        field: 'nodeName',
        title: '审批节点',
        width: '20%',
        sortable: true,
      },
      {
        field: 'wfstateName',
        title: '审批状态',
        // width: '20%',
        sortable: true,
      },
      {
        field: 'userName',
        title: '审批人',
        width: '20%',
        sortable: true,
      },
      {
        field: 'updated',
        title: '审批时间',
        width: '40%',
        align: 'center',
        sortable: true,
      },
    ],
    formSchema: [],
    queryUrl: '/orderAction/queryActivity.do',
    id: 'approveWfLog_detail',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      params.orderId = modalData.value?.row.orderId;
      // params.processId = modalData.value?.row.processId;
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  showCancelButton: false,
  cancelText: '关闭',

  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const mData = modalApi.getData<Record<string, any>>();
      modalData.value = {};
      modalData.value = mData;
      console.warn('modalData', modalData);
      modalTitle.value = mData.modalTitle || modalTitle.value;
      console.warn('onOpenChange modalData', modalData.value);

      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});
onMounted(() => {});
</script>
<template>
  <Modal class="h-[800px] w-[80%]" confirm-text="确定" :title="modalTitle">
    <div class="h-full">
      <ChcGridUI />
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
