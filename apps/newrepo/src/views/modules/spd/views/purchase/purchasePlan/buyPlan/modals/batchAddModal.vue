<script lang="ts" setup>
import { ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, Input } from 'ant-design-vue';

import { ChcSelect } from '@vben/chc-ui';

import { useSpdGrid } from '#/components/spd';

// AI-GENERATED-BEGIN
// @date 2026-06-02
// @prompt 增加供应商下拉查询条件
// @description 在批量添加弹窗的生产厂家后面增加供应商下拉查询，接口为 /baseHandleAction/vendor.do
// AI-GENERATED-END
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
      searchForm.value.bpartnerId = modalData.bpartnerId;
      searchForm.value.vendor = undefined; // 每次打开时重置供应商查询条件
      // await nextTick();
      setTimeout(() => {
        ChcGridApi.query();
      }, 0);
    }
  },
});
const searchForm = ref({
  productCode: undefined,
  manufacturer: undefined,
  vendor: undefined,
  warehouseId: undefined,
  replenishSource: undefined,
  bpartnerId: undefined,
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
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        // TODO: medicine change 药品编码
        field: 'productCode',
        minWidth: 110,
        sortable: true,
        title: '药品编码',
      },
      {
        // TODO: medicine change 药品名称
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
      // {
      //   field: 'modelNo',
      //   minWidth: 100,
      //   sortable: true,
      //   title: '型号',
      // },
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
      //   // TODO: medicine add 最小单位
      //   field: 'minUomName',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '最小单位',
      // },
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
        align: 'right',
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
        align: 'right',
        title: '库存',
      },
      // {
      //   field: 'markCode',
      //   minWidth: 100,
      //   sortable: true,
      //   title: '中标编码',
      // },
    ],
    dataTableId: '/productAction/query.do',
    id: 'batch',
    tableSearchExtraParams: searchForm.value,
  },
);

function handleSearch() {
  // console.log('查询时的 searchForm:', searchForm.value);
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
            v-model:value="searchForm.productCode"
            placeholder="编码、名称、拼首码、规格"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_productName_batchAddModal"
          />
          <Input
            placeholder="生产厂家"
            v-model:value="searchForm.manufacturer"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_manufacturer_batchAddModal"
          />
          <ChcSelect
            v-model="searchForm.vendor"
            placeholder="供应商"
            class="mr-[6px] w-[280px]"
            allow-clear
            dict-url="/baseHandleAction/vendor.do"
            api-type="post"
            request-content-type="application/x-www-form-urlencoded"
            show-search
            :paginate="false"
            :filter-by-front-end="true"
            label-field="name"
            value-field="id"
            :immediate="true"
            :after-fetch="
              (res: any) => {
                return { ...res, rows: undefined, records: res.rows };
              }
            "
            @change="handleSearch"
            data-testid="ChcSelect_vendor_batchAddModal"
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
