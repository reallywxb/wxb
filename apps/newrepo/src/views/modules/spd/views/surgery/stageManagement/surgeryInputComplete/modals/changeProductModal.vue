<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
// import { useRoute } from 'vue-router';

const tableSearchExtraParams = ref<Record<string, any>>({});

const modalOuterData = ref<any>();

const [CustomModal, modalApi] = useVbenModal({
  draggable: true,
  // showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  // footer: false,
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onConfirm() {
    const row = chcGridApi.grid.getRadioRecord(true);
    console.warn('onConfirm: row', row);
    if (!row) {
      message.error('请选择商品！');
      return;
    }

    modalOuterData.value?.callback(row);
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const mData = modalApi.getData<any>();
      console.warn('onOpenChange: mData', mData);
      modalOuterData.value = mData;
      tableSearchExtraParams.value = mData.tableQueryExtraParams;
      setTimeout(() => {
        chcGridApi.query();
      }, 0);
    }
  },
});
const chcGridOption: SchemaColumnAndOptions = {
  id: 'surgeryInput_productListModal',
  queryUrl: '/productAction/query.do',
  gridColumns: [
    {
      type: 'radio',
      width: 50,
      visible: false,
    },
    {
      title: '序号',
      width: 50,
      type: 'seq',
    },
    { field: 'productCode', title: '药品编码', width: '120' },
    { field: 'productName', title: '药品名称', width: '200' },
    { field: 'medicineName', title: '通用名', width: '180' },
    { field: 'productSpec', title: '规格', width: '100' },
    { field: 'modelNo', title: '型号', width: '80', visible: false },
    {
      field: 'vendorName',
      title: '供应商',
      width: '120',
    },
    { field: 'manufacturer', title: '厂家', width: '120' },
    { field: 'uomName', title: '单位', width: '65' },
    {
      field: 'pricePO',
      title: '采购价',
      width: '65',
    },
    { field: 'storageQty', title: '库存', width: '65' },
    { field: 'levelMax', title: '库存上限', width: '80' },
    { field: 'lPackageQty', title: '大包装', width: '65' },
    { field: 'mPackageQty', title: '中包装', width: '65' },
    {
      field: 'priceList',
      title: '零售价',
      width: '65',
    },
    { field: 'markCode', title: '中标编码', width: '80' },
    { field: 'productStateCode', title: '商品本位码', width: '100' },
    {
      field: 'isDisinfectant',
      title: '消毒液',
      width: '80',

      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    { field: 'productControlLevelName', title: '管控类型', width: '80' },
    {
      field: 'isBulkPurchase',
      title: '是否4+7',

      width: '80',
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    { field: 'certificateNo', title: '注册证号', width: '100' },
    { field: 'description', title: '备注', width: '100' },
  ],
  // autoSelectFirstRow: false,
  gridEvents: {
    radioChange({ row }: { row: any }) {
      console.warn('radioChange:', row);
    },
  },
  beforeFetchFn(params) {
    console.warn('beforeFetchFn:', params);
    return {
      ...params,
      ...tableSearchExtraParams.value,
    };
  },
  afterFetchFn: (params) => {
    return {
      ...params,
      records: params.rows,
    };
  },
};
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      showDefaultActions: false,
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      wrapperClass: 'grid-cols-2',
    },
    gridOptions: {
      stripe: false,
      pagerConfig: {
        // enabled: false,
      },
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        highlight: true,
      },
      align: 'center',
    },
  },
  chcGridOption,
);
</script>
<template>
  <CustomModal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="更改商品"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </CustomModal>
</template>
