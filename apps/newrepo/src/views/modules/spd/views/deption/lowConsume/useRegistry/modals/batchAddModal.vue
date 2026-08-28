<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Input } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

const modalOuterData = ref();
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // console.log(ChcGridApi.grid.getCheckboxRecords());
    modalOuterData.value.handleBatchChoose(
      ChcGridApi.grid.getCheckboxRecords(),
    );
    modalApi.close();
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      searchForm.value.warehouseId = modalData.warehouseId;
      searchForm.value.replenishSource = modalData.replenishSource;
      // await nextTick();
      setTimeout(() => {
        ChcGridApi.query();
      }, 0);
    }
  },
});
const searchForm = ref({
  productName: undefined,
  manufacturer: undefined,
  warehouseId: undefined,
  replenishSource: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      // proxyConfig: {
      // autoLoad: false,
      // },
      checkboxConfig: {
        checkMethod: (scope: any) => {
          return !modalOuterData.value.blackList.includes(
            scope.row.productCode,
          );
        },
      },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'productCode',
        minWidth: 110,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'productName',
        minWidth: 135,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 80,
        sortable: true,
        title: '规格',
      },
      {
        field: 'modelNo',
        minWidth: 100,
        sortable: true,
        title: '型号',
        visible: false,
      },
      {
        field: 'manufacturer',
        minWidth: 120,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'uomName',
        minWidth: 60,
        sortable: true,
        title: '单位',
      },
      // {
      //   field: 'replenishPackageQty',
      //   minWidth: 80,
      //   sortable: true,
      //   title: '定数',
      // },
      {
        field: 'price',
        minWidth: 100,
        sortable: true,
        title: '采购价',
      },
      {
        field: 'vendorName',
        minWidth: 180,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'storageQty',
        minWidth: 70,
        sortable: true,
        title: '库存',
      },
      {
        field: 'markCode',
        minWidth: 100,
        sortable: true,
        title: '中标编码',
      },
    ],
    dataTableId: '/productAction/query.do',
    tableSearchExtraParams: searchForm.value,
  },
);

function handleSearch() {
  ChcGridApi.query();
}
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="批量添加"
    title-tooltip="多选后点击确定添加到单据明细列表"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
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
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>
<style scoped>
/* ::v-deep(.vxe-table--render-default .vxe-cell--checkbox.is--disabled) {
  color: #929292;
} */

::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>
