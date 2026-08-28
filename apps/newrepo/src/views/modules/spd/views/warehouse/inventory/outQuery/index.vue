<script lang="ts" setup>
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
let docType = urlParams?.docType || '';
if (docType === 'I ') {
  docType = 'I+';
}
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});
let fatherGridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  {
    title: '单选',
    type: 'radio',
    width: 50,
    align: 'center',
    visible: false,
  },
  { title: '序号', type: 'seq', width: 50, align: 'center' },

  {
    field: 'inventoryNo',
    title: '申请单号',
    width: '110',
    sortable: true,
  },
  {
    field: 'movementDate',
    title: '申请时间',
    width: '160',
    sortable: true,
  },
  {
    field: 'departmentName',
    title: '院区',
    width: '150',
    sortable: true,
  },
  {
    field: 'warehouseName',
    title: '仓库',
    width: '200',
    sortable: true,
  },

  {
    field: 'productCode',
    title: '药品编码',
    width: '120',
    sortable: true,
  },
  {
    field: 'productName',
    title: '药品名称',
    width: '200',
    sortable: true,
  },
  {
    field: 'productSpec',
    title: '规格',
    width: '90',
    sortable: true,
  },
  {
    field: 'manufacturer',
    title: '厂家',
    width: '150',
    sortable: true,
  },
  {
    field: 'uomName',
    title: '单位',
    width: '60',
    sortable: true,
  },
  {
    field: 'qty',
    title: `${docType === 'I-' ? '报损' : '报溢'}数量`,
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'totalAmt',
    title: `${docType === 'I-' ? '报损' : '报溢'}金额`,
    width: '90',
    align: 'right',
    sortable: true,
    formatter: ({ cellValue }) => {
      return cellValue.toFixed(2);
    },
  },
  {
    field: 'docStatusName',
    title: '申请状态',
    width: '90',
    sortable: true,
  },
  {
    field: 'rejectReason',
    title: '拒绝原因',
    width: '160',
    sortable: true,
  },
  {
    field: 'approveUserName',
    title: '审核人',
    width: '100',
    sortable: true,
  },
  {
    field: 'approveTime',
    title: '审核时间',
    width: '160',
    sortable: true,
  },
  {
    field: 'createdByName',
    title: '创建人',
    width: '100',
    sortable: true,
  },
  {
    field: 'created',
    title: '创建时间',
    width: '160',
    sortable: true,
  },
];
fatherGridColumns = fatherGridColumns.filter((item) => {
  if (
    item.field === 'action' ||
    item.type === 'radio' ||
    item.type === 'checkbox'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
});
const fatherTableCheckedRow = ref<Record<string, any>>({});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'outQuery',
    // api地址
    queryUrl: `inventoryAction/query.do?page=query&processed=Y&docType=${encodeURIComponent(
      docType,
    )}`,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '申请时间',
        defaultValue: [
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'), // 七天前
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            onChange(value: any) {
              console.warn('warehouseId onChange', value);
              searchController.sign();
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },

      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        fatherTableCheckedRow.value = {};
        fatherTableCheckedRow.value = row;
        SonChcGridApi.reload();
      },
      // 单个复选框变化事件
      // checkboxChange: (v: any) => {
      //   console.warn('父表格 checkboxChange', v);
      // },
      // // 全选/全不选事件
      // checkboxAll: (v: any) => {
      //   console.warn('父表格 checkboxAll', v);
      // },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        SonChcGridApi.grid.remove();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const [SonChcGrid, SonChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [],
    //      { title: '序号', type: 'seq', width: 50, align: 'center' },
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'qty',
        title: `${docType === 'I-' ? '报损' : '报溢'}数量`,
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价',
        width: '90',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue.toFixed(2);
        },
      },
      {
        field: 'lineAmt',
        title: `${docType === 'I-' ? '报损' : '报溢'}金额`,
        width: '90',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue.toFixed(2);
        },
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productionDate',
        title: '生产日期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        width: '110',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '180',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'inventoryReasonName',
        title: '损溢原因',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    id: 'outQuery_son',
    queryUrl: '/inventoryAction/queryDetail.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      if (!isEmpty(fatherTableCheckedRow.value.inventoryId)) {
        params.inventoryId = fatherTableCheckedRow.value.inventoryId;
      }
      if (!fatherTableCheckedRow.value.inventoryId) {
        return false;
      }

      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid />
      </template>
      <template #second>
        <SonChcGrid />
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
