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
const modalTitle = ref('整件预配明细');
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
      switch (modalData.tabVal) {
        case 'lotDetail': {
          searchParams.value = {
            ...modalData.queryParams,
          };

          break;
        }
        case 'lotSummary': {
          searchParams.value = {
            ...modalData.queryParams,
          };

          break;
        }
        case 'packageSummary': {
          searchParams.value = {
            ...modalData.queryParams,
          };

          break;
        }
        // No default
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
        field: 'docType',
        title: '单据类型',
        width: '100',
        sortable: false,
      },
      {
        field: 'docId',
        title: '单据号码',
        width: '100',
        sortable: false,
      },
      {
        field: 'qtyPrepared',
        title: '预配数量',
        width: '80',
        align: 'right',
        sortable: false,
      },
      // {
      //   field: 'unitPackQty',
      //   title: '定数',
      //   width: '60',
      //   align: 'right',
      //   sortable: false,
      // },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: false,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: false,
      },
      {
        field: 'created',
        title: '操作时间',
        width: '120',
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
    queryUrl: '/storageAction/queryStoragePrepare.do',
    id: 'storageQuery_repareDetailModal',
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
