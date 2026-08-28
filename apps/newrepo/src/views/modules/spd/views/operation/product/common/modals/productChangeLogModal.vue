<script lang="ts" setup>
import { reactive } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { Button, Input } from 'ant-design-vue';
import { useSpdGrid } from '#/components/spd';

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

      tableSearchExtraParams.productId = modalData.productId;

      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});

const tableSearchExtraParams = reactive({
  productId: '',
  columnName: 'Vendor_ID,PriceList,PricePO',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'columnName',
        minWidth: 120,
        sortable: true,
        title: '变更列',
      },
      {
        field: 'oldValue',
        minWidth: 120,
        sortable: true,
        title: '旧值',
        align: 'right',
        formatter: ({ cellValue }: any) => {
          if (cellValue === 'true') {
            return '是';
          } else if (cellValue === 'false') {
            return '否';
          } else {
            return cellValue;
          }
        },
      },
      {
        field: 'newValue',
        minWidth: 120,
        sortable: true,
        title: '新值',
        align: 'right',
        formatter: ({ cellValue }: any) => {
          if (cellValue === 'true') {
            return '是';
          } else if (cellValue === 'false') {
            return '否';
          } else {
            return cellValue;
          }
        },
      },
      {
        field: 'realName',
        minWidth: 120,
        sortable: true,
        title: '操作人',
      },
      {
        field: 'fromDate',
        minWidth: 120,
        sortable: true,
        title: '操作时间',
      },
    ],
    dataTableId: '/productAction/queryProductLog.do',
    tableSearchExtraParams,
  },
);
</script>
<template>
  <Modal title="变更日志">
    <ChcGrid class="h-[600px]" />
  </Modal>
</template>
