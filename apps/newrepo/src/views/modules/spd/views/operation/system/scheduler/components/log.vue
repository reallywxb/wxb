<script setup lang="ts">
import { ref } from 'vue';

// import { useRoute } from 'vue-router';
// @ts-ignore
import { Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      showCollapseButton: false,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'Created',
        title: '创建时间',
        width: '200',
        sortable: true,
      },
      {
        field: 'Summary',
        title: '概要说明',
        minWidth: '400',
        sortable: true,
        slots: {
          default: 'Summary',
        },
        // hover: true,
      },
      {
        field: 'Reference',
        title: '引用',
        width: '200',
        sortable: true,
      },
      {
        field: 'TextMsg',
        title: '文本消息',
        width: '200',
      },
      {
        field: 'IsError',
        title: '错误',
        width: '200',
        formatter({ row }: any) {
          return row.IsError === 'Y' ? '是' : '否';
        },
        sortable: true,
      },
      {
        field: 'Description',
        title: '描述',
        width: '120',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '创建日期',
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'Summary',
        label: '概要说明',
        componentProps: {
          placeholder: '',
        },
      },
    ],
    id: 'schedulerLogTable',
    queryUrl: `/schedulerHandleAction/querySchedulerLog.do`,
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        AD_Scheduler_ID: parentData.value.AD_Scheduler_ID || 0,
        ...params,
      };
    },
  },
);

const parentData = ref<any>({});
const handleQuery = (data: any) => {
  parentData.value = data;
  if (data?.AD_Scheduler_ID) {
    roleGridApi.query();
  } else {
    roleGridApi.grid.remove();
  }
};

const handleViewSummary = (scope: any) => {
  Modal.info({
    title: '概要说明',
    content: scope.row.Summary,
    okText: '关闭',
  });
};
defineExpose({ handleQuery });
</script>
<template>
  <!-- <Page content-class="p-0" auto-content-height> -->
  <div class="h-full">
    <RoleGrid>
      <template #Summary="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewSummary(scope)"
          :data-testid="`button_Summary_${scope.rowIndex}_log`"
        >
          {{ scope.row.Summary }}
        </a>
      </template>
    </RoleGrid>
  </div>
  <!-- </Page> -->
</template>
