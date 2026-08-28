<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  isGift?: string;
}>({});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      showCollapseButton: false,
      fieldMappingTime: [
        ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        console.warn('values2', formValues.productCategoryId);
        formValues.productCategoryId = Array.isArray(
          formValues.productCategoryId,
        )
          ? formValues.productCategoryId.join(',')
          : Object.values(formValues.productCategoryId || {}).join(',');

        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
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
      // // 单个复选框变化事件
      // checkboxChange: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
      // // 全选/全不选事件
      // checkboxAll: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'name',
        minWidth: 160,
        sortable: true,
        title: '供应商名称',
      },
      {
        field: 'bpartnerCode',
        minWidth: 120,
        sortable: true,
        title: '供应商编码',
      },
      {
        field: 'productCategoryName',
        minWidth: 120,
        sortable: true,
        title: '商品类别',
      },
      {
        field: 'isStopName',
        minWidth: 80,
        sortable: true,
        title: '停用',
        align: 'center',
      },
      {
        field: 'isActiveName',
        minWidth: 80,
        sortable: true,
        title: '有效',
        align: 'center',
      },
      {
        field: 'refEntID',
        minWidth: 90,
        sortable: true,
        title: '码上放心编码',
      },
      {
        field: 'description',
        minWidth: 160,
        sortable: true,
        title: '描述',
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'value',
        label: '搜索码',
        componentProps: {
          placeholder: '请输入搜索码',
        },
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '供应商名称',
        componentProps: {
          placeholder: '请输入供应商名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择是否有效',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isActive',
        label: '是否有效',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择是否停用',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isStop',
        label: '是否停用',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/productAction/productCategoryList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择商品类别',
            mode: 'multiple',
            onChange(val: any, option: any) {
              console.warn('productCategory', val, option);
            },
            paginate: false,
            filterByFrontEnd: true,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'productCategoryId',

        label: '商品类别',
      },
    ],
    dataTableId: '/vendorAction/query.do',
    id: 'supplierInquiry',
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'CommonImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
      //   // 连接抽离的组件
      //   connectedComponent: ImportModalComp,
      // }),
    },
  },
);
onMounted(() => {
  console.warn('urlParams');
  ChcGridApi.query();
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
