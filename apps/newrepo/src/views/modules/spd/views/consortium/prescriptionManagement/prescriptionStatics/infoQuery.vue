<script setup lang="ts">
import { toRaw, watch } from 'vue';

import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const currentTab = defineModel<number>('currentTab', { required: true });

// Mock 数据
const mockData = {
  list: Array.from({ length: 5 }).map((_, index) => ({
    id: index + 1,
    departmentName: `开单医生${String(index + 1).padStart(2, '0')}`,
    productName: `药品名称${index + 1}`,
    productCode: `PROD${String(index + 1).padStart(4, '0')}`,
    insurance: `INS${String(index + 1).padStart(6, '0')}`,
    productSpec: `10mg*${index + 1}`,
    price: (Math.random() * 100).toFixed(2),
    qty: Math.floor(Math.random() * 1000),
    uomName: '盒',
    vendorName: `供应商${String.fromCodePoint(65 + (index % 5))}`,
    manufacturer: `厂家${String.fromCodePoint(65 + (index % 5))}`,
  })),
};

// 自定义查询函数 - 使用 mock 数据
const mockQuery = async () => {
  // 模拟接口延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 返回 mock 数据
  return {
    items: mockData.list,
    total: mockData.list.length,
  };
};

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['createdFrom', 'createdTo'], 'YYYY-MM-DD'],
        ['dateCommit', ['commitFrom', 'commitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        ajax: {
          query: mockQuery,
        },
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'departmentName',
        minWidth: 120,
        sortable: true,
        title: '开单医生',
      },
      {
        field: 'productName',
        minWidth: 120,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'insurance',
        minWidth: 120,
        sortable: true,
        title: '医保编码',
      },
      {
        field: 'productSpec',
        minWidth: 100,
        sortable: true,
        title: '规格',
      },
      {
        field: 'price',
        minWidth: 90,
        sortable: true,
        title: '价格',
        align: 'right',
      },
      {
        field: 'qty',
        minWidth: 90,
        sortable: true,
        title: '数量',
        align: 'right',
      },
      {
        field: 'uomName',
        minWidth: 80,
        sortable: true,
        title: '单位',
      },
      {
        field: 'vendorName',
        minWidth: 150,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'manufacturer',
        minWidth: 150,
        sortable: true,
        title: '生产厂家',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '处方时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        // TODO: medicine change 药品
        component: 'Input',
        fieldName: 'productYS',
        label: '开单医生',
        componentProps: {
          placeholder: '请输入开单医生',
        },
      },
      {
        // TODO: medicine change 药品
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        componentProps: {
          placeholder: '请输入药品名称',
        },
      },
      {
        // TODO:medicine change 医保药品编码
        component: 'Input',
        fieldName: 'insurance',
        label: '药品编码',
        componentProps: {
          placeholder: '请输入药品编码',
        },
      },
    ],
    id: 'prescriptionStaticsInfoQuery',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return {
        ...params,
        receiptType: params.receiptType || '0,2,3,4,5,G,S',
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

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
  <div class="h-full">
    <ChcGrid />
  </div>
</template>
<style scoped></style>
