<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Input } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

const emit = defineEmits(['close', 'confirm']);

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

    emit('confirm', selectRow.value);
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

      // await nextTick();
      setTimeout(() => {
        ChcGridApi.query();
      }, 0);
    }
  },
});
const searchForm = ref({
  productName: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      // proxyConfig: {
      // autoLoad: false,
      // },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        type: 'radio',
        minWidth: 120,
        fixed: 'left',
        visible: false,
      },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '300', sortable: true },
      { field: 'productSpec', title: '规格', width: '120', sortable: true },
      {
        field: 'modelNo',
        title: '型号',
        width: '120',
        sortable: true,
        visible: false,
      },
      { field: 'manufacturer', title: '厂家', width: '120', sortable: true },
      { field: 'uomName', title: '单位', width: '65', sortable: true },
      { field: 'lPackageQty', title: '大包装', width: '80', sortable: true },
    ],
    id: 'batchChooseTable',
    dataTableId: '/productAction/query.do',
    tableSearchExtraParams: searchForm.value,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        selectRow.value = row?.productId ? row : {};
      },
    },
  },
);

const selectRow = ref();
function handleSearch() {
  ChcGridApi.query();
}
</script>
<template>
  <Modal
    class="h-[800px] w-[800px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="商品选择"
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
            data-testid="input_productName_searchModal"
          />
          <Button
            type="primary"
            @click="handleSearch"
            data-testid="button_search_searchModal"
          >
            查询
          </Button>
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
