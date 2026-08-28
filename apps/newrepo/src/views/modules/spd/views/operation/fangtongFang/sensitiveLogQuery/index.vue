<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query();
  isFirstLoaded.value = true;
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['startDate', 'endDate'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        console.warn('handleSubmit formValues', formValues);
        const params = {
          ...toRaw(formValues),
        };
        ChcGridApi.formApi.setLatestSubmissionValues(params);
        ChcGridApi.query(formValues);
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
      //   if (row.leaveDays < 90) {
      //     return { color: 'red' };
      //   } else if (row.leaveDays <= 180 && row.leaveDays >= 90) {
      //     return { color: '#8552a1' };
      //   } else return '';
      // },
    }),
  },
  {
    id: 'sensitiveLogQuery',
    // api地址
    dataTableId: 'aptAction/queryLog',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'isHigh',
        title: '是否敏感操作',
        minWidth: '90',
        sortable: true,
        formatter: ({ row: { isHigh } }: { row: { isHigh: string } }) => {
          const isHighMap = {
            Y: '敏感操作',
            N: '非敏感操作',
          };
          return isHighMap[isHigh as keyof typeof isHighMap] || '';
        },
      },
      {
        field: 'menuName',
        title: '菜单名称',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'operation',
        title: '功能类型',
        minWidth: '130',
        sortable: true,
        formatter: ({ row: { operation } }: { row: { operation: string } }) => {
          if (!operation) {
            return '';
          }
          const operationMap = {
            query: '查询',
            export: '导出',
            print: '打印',
          };
          // return operationMap[operation as keyof typeof operationMap] || '';
          const operationList = operation.split(',') || [];
          return operationList
            .map((item) => operationMap[item as keyof typeof operationMap])
            .join(',');
        },
      },
      {
        field: 'userName',
        title: '操作人',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      // {
      //   field: 'roleName',
      //   title: '角色',
      //   minWidth: '130',
      //   sortable: true,
      // },
      {
        field: 'created',
        title: '操作时间',
        minWidth: '150',
        sortable: true,
      },
      // {
      //   field: 'operationContent',
      //   title: '操作内容',
      //   minWidth: '200',
      //   sortable: true,
      // },
      {
        field: 'requestParam',
        title: '请求参数',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'responseBody',
        title: '返回内容',
        minWidth: '200',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '操作时间',
        defaultValue: [
          dayjs().subtract(1, 'month').format('YYYY-MM-DD'), // 一个月前
          dayjs().format('YYYY-MM-DD'), // 今天
        ],
      },
      {
        component: 'ChcSelect',
        fieldName: 'isHigh',
        label: '是否敏感操作',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // 如果选择了全部，其他项都不应该被选择
            mode: 'multiple',
            placeholder: '请选择',
            showChooseAll: '',
            maxTagCount: 3,
            allowClear: true,
            paginate: false,
            options: [
              { value: '', label: '全部' },
              { value: 'query', label: '查询' },
              { value: 'export', label: '打印' },
              { value: 'print', label: '导出' },
            ],
            onChange(val: any) {
              // 如果选择了全部
              if (val.includes('')) {
                ChcGridApi.formApi?.setFieldValue('operation', ['']);
              }
            },
          };
        },
        defaultValue: [],
        fieldName: 'operation',
        label: '功能类型',
      },
      {
        component: 'Input',
        fieldName: 'menuName',
        label: '菜单名称',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请输入菜单名称',
          };
        },
      },
      // {
      //   component: 'Input',
      //   fieldName: 'productName',
      //   label: '物资关键字',
      //   defaultValue: '',
      //   componentProps: () => {
      //     return {
      //       placeholder: '请输入产品名称/规格型号',
      //     };
      //   },
      // },
      {
        component: 'Input',
        fieldName: 'userName',
        label: '操作人',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请输入姓名/登录名称',
          };
        },
      },
      // {
      //   component: 'ChcSelect',
      //   fieldName: 'roleName',
      //   label: '角色',
      //   componentProps: () => {
      //     return {
      //       dictUrl: '/baseHandleAction/departmentList.do',
      //       placeholder: '请选择',
      //       mode: 'multiple',
      //       maxTagCount: 1,
      //       allowClear: true,
      //       paginate: false,
      //       showChooseAll: '',
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   defaultValue: '',
      // },
    ],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      const newParams = { ...params };
      if (
        newParams.operation &&
        Array.isArray(newParams.operation) &&
        newParams.operation.length > 0
      ) {
        newParams.operation = newParams.operation.includes('')
          ? ''
          : newParams.operation.join(',');
      }
      return newParams;
    },
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      return {
        ...params,
        records: params.data || [],
      };
    },
  },
);

onMounted(() => {
  // 触发自动查询
  searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button-parentExport"
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
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
