<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

const modalOuterData = ref();
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  // showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onConfirm() {
    const record = ChcGridApi.grid.getRadioRecord(true);
    if (!record) {
      message.error('请选择行！');
    }
    modalOuterData.value.callback(record);
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      // searchForm.value.warehouseId = modalData.warehouseId;
      // searchForm.value.Record_ID = modalData.orderPlanLineId;
      // ChcGridApi.query();
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      // console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
  // productName: undefined,
  // manufacturer: undefined,
  // warehouseId: undefined,
  // replenishSource: undefined,
  // Record_ID: undefined,
  // AD_Table_ID: 1_000_359,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      pagerConfig: {
        enable: false,
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
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter({ rowIndex }: any) {
          return rowIndex + 1;
        },
      },
      // { type: 'checkbox', title: '', width: 50, align: 'center' }, type: 'seq',
      {
        field: 'adviceNo',
        title: '医嘱编号',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'adviceItemName',
        title: '医嘱项目名称',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'ssmc',
        title: '手术名称',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'bpartnerId',
        title: '开单科室',
        minWidth: '80',
        // "hide":true
      },
      {
        field: 'kdksmc',
        title: '开单科室',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'drawerUserName',
        title: '开单医生',
        minWidth: '90',
        // "hide":true
      },
      {
        field: 'drawerUserId',
        title: '开单医生',
        minWidth: '10',
        // "hide":true
      },
      {
        field: 'zdysUserId',
        title: '主刀医生',
        minWidth: '90',
        // "hide":true
      },
      {
        field: 'zdysName',
        title: '主刀医生',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'sssj',
        title: '手术时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'ssdh',
        title: '手术单号',
        sortable: true,
      },
      {
        field: 'diagnosis',
        title: '诊断',
        minWidth: '140',
        sortable: true,
      },
    ],
    autoSelectFirstRow: true,
    dataTableId: 'packageAction/query.do',
    id: 'action',
    tableSearchExtraParams: searchForm.value,
  },
);

// function handleSearch() {
//   ChcGridApi.query();
// }
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="医嘱"
    title-tooltip="医嘱"
  >
    <div class="h-full">
      <ChcGrid>
        <!-- <template #toolbar-actions>
          <Input
            v-model:value="searchForm.productName"
            placeholder="编码、名称、拼首码、规格"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
          />
          <Input
            placeholder="生产厂家"
            v-model:value="searchForm.manufacturer"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
          />
          <Button type="primary" @click="handleSearch">查询</Button>
        </template> -->
      </ChcGrid>
    </div>
  </Modal>
</template>
