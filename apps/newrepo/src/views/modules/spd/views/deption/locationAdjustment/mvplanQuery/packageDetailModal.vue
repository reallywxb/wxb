<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { Button, Input } from 'ant-design-vue';
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
      searchForm.value.movementPlanLineId = modalData.movementPlanLineId;
      // searchForm.value.checkStatus = modalData.checkStatus;
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      // console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
  movementPlanLineId: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
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
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'packageNo',
        title: '包装号',
        minWidth: 200,
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '250',
        sortable: false,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '150',
        sortable: false,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '150',
        sortable: false,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        minWidth: '150',
        sortable: false,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '70',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '90',
        sortable: false,
      },
      {
        field: 'createdByName',
        title: '移库人',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'created',
        title: '移库时间',
        minWidth: '120',
        sortable: false,
      },
    ],
    dataTableId: '/movementPlanAction/queryMovementPlanLinePackage.do',
    id: 'manualInfoActionLog',
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
    title="移库包装"
    title-tooltip="移库包装列表"
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
