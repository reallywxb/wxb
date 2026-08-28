<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

const modalTitle = ref('变更记录');
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
      // console.warn(11111, modalData);
      tableSearchExtraParams.productId = modalData.productId;
      // const mockData = Array.from({ length: 10 }, (_, index) => ({
      //   processType: index % 2 === 0 ? '新增' : '修改',
      //   processName: `操作人${index + 1}`,
      //   processTime: `2023-08-0${index + 1} 10:00:00`,
      //   comments: `变更内容${index + 1}`,
      //   description: `变更备注${index + 1}`,
      // }));
      console.warn(22_222, ChcGridApi);
      setTimeout(() => {
        ChcGridApi.query();
        // ChcGridApi.grid.reloadData(mockData);
      }, 200);
    }
  },
});

const tableSearchExtraParams = reactive({
  productId: '',
  // columnName: 'Vendor_ID,PriceList,PricePO',
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
        field: 'processType',
        minWidth: 120,
        sortable: true,
        title: '操作类型',
      },
      {
        field: 'processName',
        minWidth: 120,
        sortable: true,
        title: '操作人',
      },
      {
        field: 'processTime',
        minWidth: 120,
        sortable: true,
        title: '操作时间',
      },
      {
        field: 'comments',
        minWidth: 150,
        sortable: true,
        title: '操作内容',
        formatter: ({ cellValue }: any) => {
          const str = JSON.stringify(cellValue);
          return str;
        },
      },
      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: '操作备注',
      },
      // {
      //   field: 'oldValue',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '旧值',
      //   align: 'right',
      //   formatter: ({ cellValue }: any) => {
      //     if (cellValue === 'true') {
      //       return '是';
      //     } else if (cellValue === 'false') {
      //       return '否';
      //     } else {
      //       return cellValue;
      //     }
      //   },
      // },
    ],
    dataTableId: '/productAction/queryProductApplyLog',
    tableSearchExtraParams,
  },
);
</script>
<template>
  <Modal :title="modalTitle">
    <ChcGrid class="h-[600px]" />
  </Modal>
</template>
