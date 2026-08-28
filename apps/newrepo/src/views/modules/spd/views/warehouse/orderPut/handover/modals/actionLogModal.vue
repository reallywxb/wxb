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
      searchForm.value.asnLineId = modalData.asnLineId;
      // searchForm.value.checkStatus = modalData.checkStatus;
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
  asnLineId: undefined,
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
        minWidth: 80,
        sortable: false,
        title: '包装号',
      },
      {
        field: 'qtyDelivered',
        minWidth: 100,
        sortable: false,
        title: '数量',
        align: 'right',
      },
      {
        field: 'serNo',
        minWidth: 120,
        sortable: false,
        title: '厂家码',
      },
      {
        field: 'checkerName',
        minWidth: 100,
        sortable: false,
        title: '验收人',
      },
      {
        field: 'checkTime',
        minWidth: 180,
        sortable: false,
        title: '验收时间',
      },
      {
        field: 'putawayName',
        minWidth: 100,
        sortable: false,
        title: '上架人',
      },
      {
        field: 'putawayTime',
        minWidth: 100,
        sortable: false,
        title: '上架时间',
      },
    ],
    dataTableId: '/asnAction/queryPackageDetail.do',
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
    title="配送包装"
    title-tooltip="配送包装列表"
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
