<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const searchParams = ref<Record<string, any>>({});
const modalTitle = ref('在途明细');
const [Modal, modalApi] = useVbenModal({
  draggable: true,
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
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      console.warn('modalData', modalData);
      modalTitle.value = modalData.modalTitle || modalTitle.value;
      searchParams.value = {};
      searchParams.value = {
        warehouseId: modalData.row.warehouseId,
        productId: modalData.row.productId,
        storageStatus: modalData.row.storageStatus,
      };
      if (modalData.tabVal === 'lot') {
        searchParams.value.lot = modalData.row.lot || '';
        searchParams.value.locatorValue = modalData.row.locatorValue;
        searchParams.value.vendorId = modalData.row.vendorId;
      } else if (modalData.tabVal === 'lotSummary') {
        searchParams.value.lot = modalData.row.lot || '';
      }
      console.warn('onOpenChange modalData', modalData);
      console.warn('onOpenChange searchParams', searchParams.value);
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});

const [ChcGridUI, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orderId',
        title: '申请号',
        width: '100',
        sortable: false,
      },
      {
        field: 'dateOrdered',
        title: '申请日期',
        width: '100',
        sortable: false,
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        width: '100',
        sortable: false,
      },
      {
        field: 'bpartnerName',
        title: '业务对象',
        width: '180',
        sortable: false,
      },
      {
        field: 'qtyMoving',
        title: '在途数量',
        width: '80',
        align: 'right',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: false,
      },
      {
        field: 'createdByName',
        title: '操作人',
        width: '100',
        sortable: false,
      },
    ],
    formSchema: [],
    queryUrl: '/storageAction/queryMovingDetail.do',
    id: 'storageQuery_movingDetailModal',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      return {
        ...params,
        ...searchParams.value,
      };
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

onMounted(() => {});
</script>
<template>
  <Modal class="h-[800px] w-[80%]" :title="modalTitle">
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
