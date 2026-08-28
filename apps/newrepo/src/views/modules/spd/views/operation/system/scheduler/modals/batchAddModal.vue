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

      searchForm.value.ad_process_id = modalData.ad_process_id;

      // await nextTick();
      setTimeout(() => {
        ChcGridApi.query();
      }, 0);
    }
  },
});
const searchForm = ref({
  ad_process_id: undefined,
  productName: undefined,
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
          return !modalOuterData.value.blackList.includes(String(scope.row.id));
        },
      },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'id',
        title: '参数ID',
        width: '90',
      },
      {
        field: 'name',
        title: '参数',
        width: '210',
      },
    ],
    id: 'batchChooseTable',

    dataTableId: '/schedulerHandleAction/getProcessParam.do',
    tableSearchExtraParams: searchForm.value,
    afterFetchFn: (params: any) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
  },
);

function handleSearch() {
  ChcGridApi.query();
}
</script>
<template>
  <Modal
    class="h-[400px] w-[500px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="批量添加"
    title-tooltip="多选后点击确定添加到参数列表"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <Input
            v-model:value="searchForm.productName"
            placeholder=" "
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_productName_batchAddModal"
          />
          <Button
            type="primary"
            @click="handleSearch"
            data-testid="button_search_batchAddModal"
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
