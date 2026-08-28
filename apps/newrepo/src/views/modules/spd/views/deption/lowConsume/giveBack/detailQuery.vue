<script setup lang="ts">
import { ref, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { formDefaultOptions } from './formDefaultOptions';
import { gridDefaultOptions } from './gridDefaultOptions';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const { contentIsMaximize } = usePreferences();
const selectedAmount = ref(0);
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
        // slots: { default: "orderPlanNo" },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'productName',
        minWidth: 170,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 70,
        sortable: true,
        title: '规格',
      },
      {
        field: 'modelNo',
        minWidth: 70,
        sortable: true,
        title: '型号',
        visible: false,
      },
      {
        field: 'manufacturer',
        minWidth: 150,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'uomName',
        minWidth: 70,
        sortable: true,
        title: '单位',
        align: 'right',
      },
      {
        field: 'price',
        minWidth: 70,
        sortable: true,
        title: '价格',
        align: 'right',
      },
      {
        field: 'qty',
        minWidth: 80,
        sortable: true,
        title: '处方数量',
        align: 'right',
      },
      {
        field: 'qtyDelivery',
        minWidth: 90,
        sortable: true,
        title: '已发放数量',
        align: 'right',
      },
      {
        field: 'qtyBacked',
        minWidth: 90,
        sortable: true,
        title: '已退回数量', // 暂无
        align: 'right',
      },
      {
        field: 'qtyBack',
        minWidth: 80,
        sortable: true,
        title: '退回数量', // 暂无
        align: 'right',
      },
      {
        field: 'createdByName',
        minWidth: 150,
        sortable: true,
        title: '医生嘱托',
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
    ],
    dataTableId: '/prescriptionAction/query.do',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: { status: 'P' },
    getTableArrDataFn: (params) => {
      totalAmount.value = params.totalPrice || 0;
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = total;
};

watch(
  () => currentTab.value,
  (val: number | string) => {
    if (val === props.thisTab.value) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);
</script>
<template>
  <div
    :style="{
      height: contentIsMaximize ? 'calc(100vh - 38px)' : 'calc(100vh - 152px)',
      overflowY: 'hidden',
    }"
  >
    <ChcGrid />
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
