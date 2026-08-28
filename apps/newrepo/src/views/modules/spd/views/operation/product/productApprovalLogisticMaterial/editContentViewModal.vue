<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

const modalTitle = ref('');
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
      modalTitle.value = modalData.title;
      console.warn('onOpenChange：打开状态改变', modalData);
      tableSearchExtraParams.applyId = modalData.productApplyId;
      // const mockData = Array.from({ length: 20 }, (_, index) => ({
      //   name: `字段${index + 1}`,
      //   oldValue: `旧值${index + 1}`,
      //   newValue: `新值${index + 1}`,
      // }));
      setTimeout(() => {
        ChcGridApi.query();
        // ChcGridApi.grid.reloadData(mockData);
      }, 200);
    }
  },
});

const tableSearchExtraParams = reactive({
  applyId: '',
  columnName: 'Vendor_ID,PriceList,PricePO',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
      // 使用 vxe 内置序号配置，确保序号从 1 开始且稳定显示
      seqConfig: {
        /**
         * 自定义序号计算方法
         * @param params 当前单元格的上下文参数
         * @returns 从 1 开始的行序号
         */
        seqMethod: ({ rowIndex }: any) => rowIndex + 1,
        startIndex: 1,
      },
      stripe: false,
    },
  },
  {
    gridColumns: [
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
      },
      {
        field: 'columnName',
        minWidth: 120,
        sortable: true,
        title: '字段名称',
      },
      {
        field: 'oldValue',
        minWidth: 120,
        sortable: true,
        title: '变更前',
      },
      {
        field: 'newValue',
        minWidth: 120,
        sortable: true,
        title: '变更后',
      },
    ],
    dataTableId: '/productAction/queryProductApplyColumn',
    tableSearchExtraParams,
  },
);
</script>
<template>
  <Modal :title="modalTitle">
    <ChcGrid class="h-[500px]" />
  </Modal>
</template>
