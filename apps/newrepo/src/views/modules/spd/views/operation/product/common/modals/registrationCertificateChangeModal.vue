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
  columnName: 'CertificateNo',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'fromDate',
        title: '时间',
        minWidth: '140',
        sortable: false,
      },
      {
        field: 'realName',
        title: '操作人',
        minWidth: '100',
        sortable: false,
        //    		}, {
        //    			"field": "logType",
        //    			"title": "类型",
        //    			"minWidth": "60",
        //    			"sortable": false
      },
      {
        field: 'oldValue',
        title: '原值',
        minWidth: '200',
        sortable: false,
      },
      {
        field: 'newValue',
        title: '新值',
        minWidth: '200',
        sortable: false,
      },
    ],
    dataTableId: '/productAction/queryProductLog.do',
    tableSearchExtraParams,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[50%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="注册证号变更记录"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
