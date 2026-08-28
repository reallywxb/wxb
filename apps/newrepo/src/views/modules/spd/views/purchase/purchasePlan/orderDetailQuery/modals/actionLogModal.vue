<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

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
      searchForm.value.Record_ID = modalData.orderLineId;
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
  Record_ID: undefined,
  AD_Table_ID: 260,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'Type',
        minWidth: 60,
        sortable: true,
        title: '操作',
      },
      {
        field: 'ColumnName',
        minWidth: 80,
        sortable: true,
        title: '列',
      },
      {
        field: 'OldValue',
        minWidth: 100,
        sortable: true,
        title: '旧值',
        align: 'right',
      },
      {
        field: 'NewValue',
        minWidth: 120,
        sortable: true,
        title: '新值',
        align: 'right',
      },
      {
        field: 'UpdatedBy',
        minWidth: 100,
        sortable: true,
        title: '操作人',
      },
      {
        field: 'Updated',
        minWidth: 180,
        sortable: true,
        title: '操作时间',
      },
      {
        field: 'Remote_Addr',
        minWidth: 100,
        sortable: true,
        title: '远程地址',
      },
      {
        field: 'Remote_Host',
        minWidth: 100,
        sortable: true,
        title: '远程主机',
      },
      {
        field: 'TableName',
        minWidth: 110,
        sortable: true,
        title: '表',
      },
      {
        field: 'Record_ID',
        minWidth: 135,
        sortable: true,
        title: '单据ID',
      },
    ],
    dataTableId: '/changeLogHandleAction/queryChangeLog.do',
    id: 'infoLog',
    tableSearchExtraParams: searchForm.value,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="操作记录"
    title-tooltip="操作记录列表"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
