<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Input } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { useUserStore } from '@vben/stores';

// import { productColOptions } from '../../utils/productColOptions';
import { productColOptions } from './productColOptions';
const userStore = useUserStore();
const modalOuterData = ref();
const showParentWarehouseInventory = ref(false); // 控制"上级仓库库存"列显隐
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

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      // showParentWarehouseInventory.value = false;
      searchForm.value.warehouseId = modalData.warehouseId;
      // searchForm.value.replenishSource = modalData.replenishSource;
      searchForm.value.productControlLevel = modalData.productControlLevel;
      searchForm.value.showStorage = modalData.showStorage;
      searchForm.value.showPrice = modalData.showPrice;
      searchForm.value.fromWarehouseId = modalData.fromWarehouseId;
      searchForm.value.specWarehouseId = modalData.specWarehouseId;
      searchForm.value.otherValue = modalData.otherValue;
      searchForm.value.fromWarehouseId = modalData.fromWarehouseId;
      // 根据传入的仓库信息，控制"上级仓库库存"列显隐
      showParentWarehouseInventory.value =
        modalData.isParentWarehouseInventory === 'Y';
      // console.log('222', showParentWarehouseInventory.value);
      setTimeout(() => {
        if (showParentWarehouseInventory.value) {
          ChcGridApi.grid.showColumn('storageFromQty');
        } else {
          ChcGridApi.grid.hideColumn('storageFromQty');
        }
      }, 200);
      // this.$nextTick(() => {
      //   ChcGridApi.grid.setCheckboxRecords(modalData.blackList);
      // });
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
  productControlLevel: undefined,
  showStorage: undefined,
  showPrice: undefined,
  fromWarehouseId: undefined,
  specWarehouseId: undefined,
  otherValue: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      checkboxConfig: {
        checkMethod: (scope: any) => {
          return !modalOuterData.value.blackList.includes(
            scope.row.productCode,
          );
        },
      },
    },
    gridEvents: {
      cellDblclick: handleCellDblclick,
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      // ...productColOptions,
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
      {
        field: 'storageFromQty',
        minWidth: 120,
        sortable: true,
        title: '上级仓库库存',
        visible: showParentWarehouseInventory.value, // 根据申请仓库的isParentWarehouseInventory字段控制
      },
      {
        field: 'productStateCode',
        title: '商品本位码',
        width: '100',
        formatter({ row }: any) {
          return row.productStateCode === 'Y' ? '是' : '否';
        },
      },
      { field: 'productControlLevelName', title: '商品组', width: '80' },
      {
        field: 'isBulkPurchase',
        title: '是否4+7',
        formatter({ row }: any) {
          return row.isBulkPurchase === 'Y' ? '是' : '否';
        },
        width: '80',
      },
      { field: 'certificateNo', title: '注册证号', width: '100' },
      { field: 'description', title: '备注', width: '100' },
    ],
    dataTableId: '/productAction/query.do',
    id: 'batchChooseTable',
    tableSearchExtraParams: searchForm.value,
  },
);

function handleSearch() {
  ChcGridApi.query();
}

/**
 * AI-GENERATED-BEGIN
 * @date 2026-06-26
 * @prompt 添加双击行调用确认接口的功能
 * @description 双击表格行时，自动勾选该行并触发确认操作，将选中的数据添加到单据明细列表
 */
function handleCellDblclick({ row }: { row: any }) {
  // 先勾选当前双击的行
  ChcGridApi.grid.setCheckboxRow(row, true);
  // 触发确认操作
  modalOuterData.value.handleBatchChoose(ChcGridApi.grid.getCheckboxRecords());
  modalApi.close();
}
// AI-GENERATED-END
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
            data-testid="input_product_name_batchAddModal"
          />
          <Input
            placeholder="生产厂家"
            v-model:value="searchForm.manufacturer"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_manufacturer_batchAddModal"
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
