<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';
// import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgCloseIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, Input, InputNumber, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { deepClone } from '#/utils/util';

import ChangePackageStatusModalComp from './changePackageStatus.vue';

// const route = useRoute();

// const urlParams: { [key: string]: any } = route.meta?.urlParams || {}; // 路由给过来的参数
const modalOuterData = ref<any>();
const searchForm = ref<any>({
  packageNo: undefined,
});
const [ChangePackageStatusModal, changePackageStatusModalApi] = useVbenModal({
  connectedComponent: ChangePackageStatusModalComp,
});
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  footer: false,
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = modalApi.getData<any>();
      searchForm.value.storageStatus =
        modalOuterData.value.record.storageStatus;
      searchForm.value.packageStatus = 'S';
      searchForm.value.productId = modalOuterData.value.record.productId;
      searchForm.value.locatorId = modalOuterData.value.record.locatorId;
      searchForm.value.warehouseId = modalOuterData.value.record.warehouseId;
      searchForm.value.lot = modalOuterData.value.record.lot;
      searchForm.value.unitPackQty = modalOuterData.value.record.unitPackQty;
      searchForm.value.isPicking = 'N';

      setTimeout(() => {
        chcGridApi.query();
      }, 200);
    }
  },
});
const chcGridOption: SchemaColumnAndOptions = {
  gridColumns: [
    {
      type: 'radio',
      visible: false,
      width: 50,
    },
    {
      title: '序号',
      width: 50,
      align: 'center',
      type: 'seq',
    },
    { type: 'checkbox', title: '多选', width: 50, align: 'center' },
    {
      field: 'packageNo',
      minWidth: '包装号',
      width: '180',
    },
    {
      field: 'productName',
      title: '药品名称',
      minWidth: '150',
      sortable: false,
    },
    {
      field: 'productSpec',
      title: '规格',
      minWidth: '120',
      sortable: false,
    },
    {
      field: 'modelNo',
      title: '型号',
      minWidth: '120',
      sortable: false,
      visible: false,
    },
    {
      field: 'manufacturer',
      title: '生产厂家',
      minWidth: '120',
      sortable: false,
    },
    {
      field: 'uomName',
      title: '单位',
      minWidth: '70',
      sortable: false,
    },
    {
      field: 'qty',
      title: '定数',
      minWidth: '65',
      visible: false,
    },
    {
      field: 'storageStatusName',
      title: '库存状态',
      minWidth: '80',
    },
    {
      field: 'lot',
      title: '批号',
      minWidth: '90',
      sortable: false,
    },
    {
      field: 'guaranteeDate',
      title: '效期',
      minWidth: '90',
      sortable: false,
    },
  ],
  autoSelectFirstRow: false,
  gridEvents: {
    // radioChange() {},
  },
  queryUrl: () => `/packageAction/query.do`,
  getTableId: () => 'choosePackage',
  tableSearchExtraParams: searchForm.value,
  afterFetchFn: (params) => {
    originRows.value = params.rows.map((item: any) => {
      return deepClone(item);
    });
    return {
      ...params,
      records: params.rows,
    };
  },
};
let [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      showDefaultActions: false,
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[70px]',
      },
    },
    gridOptions: {
      stripe: false,
      pagerConfig: {
        enabled: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      checkboxConfig: {
        highlight: true,
        trigger: 'row',
      },
      radioConfig: {
        highlight: false,
      },
      align: 'center',
    },
  },
  chcGridOption,
);
const originRows = ref<any[]>([]);
const handleSearch = (
  e: KeyboardEvent | MouseEvent,
  type: 'click' | 'enter',
) => {
  if (type === 'enter') {
    searchForm.value.packageNo = (e.target as HTMLInputElement).value;
  }
  chcGridApi.query();
};
const handleSave = () => {
  const warehouseId = modalOuterData.value.record.warehouseId;
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择记录！');
  }
  if (warehouseId < 1) {
    return message.error('请选择仓库！');
  }
  const data: any[] = [];
  const params: { [key: string]: any } = {};
  records.forEach((record: any) => {
    data.push(record);
  });
  params.lineData = JSON.stringify(data);
  params.warehouseId = warehouseId;
  changePackageStatusModalApi
    .setData({
      params,
      callback() {
        modalApi.close();
        modalOuterData.value.callback();
      },
    })
    .open();
};
</script>
<template>
  <Modal
    class="formatBtnIconPosition h-[800px] w-[80%]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="选择包装"
    title-tooltip="选择包装"
  >
    <ChangePackageStatusModal />
    <div class="h-full">
      <ChcGrid class="h-[calc(100%-38px)]">
        <template #descriptionDefault="scope">
          <Input
            class="w-full"
            :min="0"
            v-model:value="scope.row.description"
            :data-testid="`input_description_${scope.rowIndex}_choosePackage`"
          />
        </template>
        <template #qtyOrderedDefault="scope">
          <InputNumber
            class="w-full"
            :min="0"
            v-model:value="scope.row.qtyOrdered"
            :data-testid="`InputNumber_qtyOrdered_${scope.rowIndex}_choosePackage`"
          />
        </template>
        <template #toolbar-actions>
          <Input
            v-model:value="searchForm.packageNo"
            class="mr-[0.5rem] w-[240px]"
            placeholder="请输入包装号"
            allow-clear
            @press-enter="handleSearch($event, 'enter')"
            data-testid="input_packageNo_choosePackage"
          />
          <Button
            type="primary"
            @click="handleSearch($event, 'click')"
            data-testid="button_search"
          >
            搜索
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] pt-[7px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handleSave"
            data-testid="button_confirm"
          >
            确认
            <template #icon>
              <SvgSaveIcon />
            </template>
          </Button>
          <Button
            type="primary"
            danger
            @click="modalApi.close()"
            data-testid="button_cancel"
          >
            取消
            <template #icon>
              <SvgCloseIcon />
            </template>
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(.vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
