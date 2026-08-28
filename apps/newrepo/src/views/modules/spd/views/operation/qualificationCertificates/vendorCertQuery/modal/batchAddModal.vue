<script lang="ts" setup>
import { ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, Input } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

const modalOuterData = ref();
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  confirmText: '添加',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    modalOuterData.value.handleBatchChoose(
      ChcGridApi.grid.getCheckboxRecords(),
    );
    modalApi.close();
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // 采购数量必须大于零!.info('onOpened：打开动画结束');
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      // searchForm.value.warehouseId = modalData.warehouseId;
      // searchForm.value.replenishSource = modalData.replenishSource;
      // await nextTick();
      setTimeout(() => {
        ChcGridApi.query();
      }, 0);
    }
  },
});
const searchForm = ref({
  productName: undefined,
  markCode: undefined,
  warehouseId: undefined,
  replenishSource: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
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
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
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
        title: '生产企业',
      },
      {
        field: 'isActive',
        minWidth: 60,
        sortable: true,
        title: '启用状态',
        formatter({ row }) {
          return row.isActive === 'Y' ? '是' : '否';
        },
      },
    ],
    dataTableId: '/productMapAction/queryProduct.do',
    id: 'batchAdd',
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
    title="添加关联医院商品"
    title-tooltip="添加关联医院商品"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <label>药品名称：</label>
          <Input
            v-model:value="searchForm.productName"
            placeholder="请输入药品名称"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_productName_batchAddModal"
          />
          <label>中标编码：</label>
          <Input
            placeholder="请输入中标编码"
            v-model:value="searchForm.markCode"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_markCode_batchAddModal"
          />
          <Button
            type="primary"
            @click="handleSearch"
            data-testid="button_search_batchAddModal"
          >
            查询
            <template #icon>
              <SearchActionIcon class="mb-[4px] ml-[-5px] mr-[-1px]" />
            </template>
          </Button>
        </template>
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
