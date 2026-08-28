<script setup lang="ts">
// import { useRoute } from 'vue-router';

// @ts-ignore
import { Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
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
        field: 'ProcessParamName',
        title: '参数名',
      },
      {
        field: 'defaultParamValue',
        title: '默认参数',
        // "width": "100"
      },
      {
        field: 'AD_Scheduler_ID',
        title: 'AD_Scheduler_ID',
        visible: false,
      },
      {
        field: 'AD_Process_Para_ID',
        title: 'AD_Process_Para_ID',
        visible: false,
      },
      {
        field: 'isactive',
        title: '是否有效',
        align: 'center',
        formatter({ row }: any) {
          return row.isactive === 'Y' ? '是' : '否';
        },
        slots: {
          default: 'isactive',
        },
      },
      {
        field: 'description',
        title: '描述',
      },
    ],

    id: 'schedulerParamTable',
    queryUrl: `/schedulerHandleAction/querySchedulerParam.do`,
    beforeFetchFn: (params) => {
      return {
        AD_Scheduler_ID: params.value.AD_Scheduler_ID || 0,
        ...params,
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

const handleQuery = (data: any) => {
  if (data?.AD_Scheduler_ID) {
    roleGridApi.query({ AD_Scheduler_ID: data.AD_Scheduler_ID });
  } else {
    roleGridApi.grid.remove();
  }
};

const isactiveChange = (row: any, checked: any) => {
  roleGridApi.grid.setRow(row, {
    isactive: checked,
  });
};
defineExpose({ handleQuery });
</script>
<template>
  <!-- <Page content-class="p-0" auto-content-height> -->
  <div class="h-full">
    <RoleGrid>
      <template #isactive="scope">
        <Switch
          :checked="scope.row.isactive"
          checked-value="Y"
          @change="(checked) => isactiveChange(scope.row, checked)"
          style="width: 50px"
          checked-children="是"
          un-checked-value="N"
          un-checked-children="否"
          :data-testid="`switch_isactive_${scope.rowIndex}_roleGrid`"
        />
      </template>
    </RoleGrid>
  </div>
  <!-- </Page> -->
</template>
