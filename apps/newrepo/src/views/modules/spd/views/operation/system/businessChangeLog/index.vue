<script lang="ts" setup>
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD 00:00'],
      ],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/changeLogHandleAction/queryChangeLog.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'TableName', title: '表', minWidth: 100, sortable: true },
      { field: 'Record_ID', title: '单据ID', minWidth: 80, sortable: true },
      { field: 'ColumnName', title: '列', minWidth: 180, sortable: true },
      { field: 'OldValue', title: '旧值', minWidth: 100, sortable: true },
      { field: 'NewValue', title: '新值', minWidth: 100, sortable: true },
      /*      {field:'CreatedBy',title:'创建人',width:100},
       {field:'Created',title:'创建时间',width:140},*/
      { field: 'UpdatedBy', title: '更新人', minWidth: 100, sortable: true },
      { field: 'Updated', title: '更新时间', minWidth: 140, sortable: true },
      {
        field: 'Remote_Addr',
        title: '远程地址',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'Remote_Host',
        title: '远程主机',
        minWidth: 120,
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        componentProps: () => {
          return {
            valueFormat: 'YYYY-MM-DD',
            format: 'YYYY-MM-DD',
          };
        },
        defaultValue: [dayjs().format('YYYY-MM-DD')],
        label: '更新时间',
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/changeLogHandleAction/getTableList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择表',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            showChooseAll: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'AD_Table_ID',
        label: '表',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/changeLogHandleAction/getColumnList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            triggerFields: ['AD_Table_ID', 'ad_table_id'],
            placeholder: '请选择列',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            showChooseAll: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['AD_Table_ID', 'ad_table_id'],
          trigger(values: any) {
            console.warn(values);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('AD_Column_ID') &&
              ChcGridApi.formApi?.getFieldComponentRef('AD_Column_ID').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'AD_Column_ID',
              ).params.dependencies = {
                AD_Table_ID: values.AD_Table_ID,
                ad_table_id: values.AD_Table_ID,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('AD_Column_ID')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('AD_Column_ID', undefined);
            }
          },
        },
        fieldName: 'AD_Column_ID',
        label: '列',
      },
      {
        component: 'Input',
        fieldName: 'Record_ID',
        label: '单据ID',
        componentProps: {
          placeholder: '请输入单据ID',
        },
      },
    ],
    gridEvents: {},
    afterFetchFn: (params) => {
      const rows =
        params.rows?.map((item: any) => {
          return {
            ...item,
          };
        }) || [];

      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
  },
);

onMounted(() => {
  handleQuery();
});

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden" />
    </div>
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
