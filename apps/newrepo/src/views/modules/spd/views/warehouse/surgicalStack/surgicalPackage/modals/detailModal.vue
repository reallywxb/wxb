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
  onConfirm() {
    modalApi.close();
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      setTimeout(() => {
        ChcGridApi.query({ packageId: modalOuterData.value.packageId });
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
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      { field: 'productName', title: '药品名称', width: '150', sortable: true },
      { field: 'productCode', title: '药品编码', width: '150', sortable: true },
      { field: 'productSpec', title: '规格', width: '150', sortable: true },
      { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
      {
        field: 'qty',
        title: '包内数量',
        width: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'billedQty',
        title: '已计费数量',
        width: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyReceived',
        title: '已消耗数量',
        width: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'backedQty',
        title: '已回库数量',
        width: '110',
        align: 'right',
        sortable: true,
      },
      { field: 'uomName', title: '单位', width: '100', sortable: true },
      { field: 'lot', title: '批号', width: '100', sortable: true },
      { field: 'guaranteeDate', title: '效期', width: '100', sortable: true },
      { field: 'serNo', title: '厂家码', width: '100', sortable: true },
    ],
    id: 'batchChooseTable',
    dataTableId: '/surgicalPackageAction/queryPackageDetail.do',
    tableSearchExtraParams: searchForm.value,
    gridEvents: {},
  },
);
</script>
<template>
  <Modal
    class="h-[450px] w-[1000px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="包装明细"
  >
    <div class="h-full">
      <ChcGrid />
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
