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

      tableSearchExtraParams.productCode = modalData.productCode;

      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});

const tableSearchExtraParams = reactive({
  productCode: '',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'bpartnerName',
        title: '供应商',
        width: '150',
        sort: true,
      },
      {
        field: 'certNo',
        title: '证照号码',
        width: '150',
        sort: true,
      },
      {
        field: 'certDate',
        title: '发证日期',
        width: '100',
        sort: true,
      },
      {
        field: 'certValidTo',
        title: '有效日期',
        width: '100',
        sort: true,
      },
      {
        field: 'productName',
        title: '产品名称',
        width: '120',
        sort: true,
      },
      {
        field: 'manufacturerName',
        title: '生产企业',
        width: '200',
        sort: true,
      },
      {
        field: 'productTypeName',
        title: '产品类型',
        width: '100',
        sort: true,
      },
      {
        field: 'certTypeName',
        title: '证照类型',
        width: '180',
        sort: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '100',
        sort: true,
      },
      // {
      //   fixed: 'right',
      //   title: '操作',
      //   width: '80',
      //   toolbar: '#tablebar1',
      // },
    ],
    dataTableId: '/certAction/query.do',
    tableSearchExtraParams,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[50%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="注册证号一览"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
