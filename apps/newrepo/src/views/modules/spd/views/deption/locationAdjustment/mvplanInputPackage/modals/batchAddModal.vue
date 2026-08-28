<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

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
      // await nextTick();
      setTimeout(() => {
        ChcGridApi.query();
      }, 0);
    }
  },
});
const searchForm = ref({
  warehouseId: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      checkboxConfig: {},
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
      {
        field: 'unitPackQty',
        minWidth: 80,
        sortable: true,
        title: '定数',
        visible: false,
      },
      {
        field: 'packageCount',
        minWidth: 80,
        sortable: true,
        title: '包数',
      },
      {
        field: 'qtyOnHand',
        minWidth: 80,
        sortable: true,
        title: '库存',
      },
      {
        field: 'locatorName',
        minWidth: 140,
        sortable: true,
        title: '货位',
      },
      {
        field: 'lot',
        minWidth: 100,
        sortable: true,
        title: '批号',
      },
      {
        field: 'guaranteeDate',
        minWidth: 120,
        sortable: true,
        title: '效期',
      },
    ],
    dataTableId: '/storageAction/queryPackageStorageLot.do',
    id: 'batch',
    tableSearchExtraParams: searchForm.value,
  },
);
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
          <Button type="primary" @click="handleSearch">
            查询
            <template #icon>
              <SearchActionIcon class="mb-[4px] ml-[-5px] mr-[-1px]" />
            </template>
          </Button>
        </template> -->
      </ChcGrid>
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>
