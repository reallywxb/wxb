<script lang="ts" setup>
import { onMounted, ref, useTemplateRef } from 'vue';
// import { useRoute } from 'vue-router';

import { SvgPrintFillIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

// @ts-ignore
import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Button,
  message,
  Modal,
  RadioButton,
  RadioGroup,
} from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { executeScheduler } from './api';
import logCom from './components/log.vue';
import schedulerParamCom from './components/schedulerParam.vue';
import editModalUI from './modals/editModal.vue';

const [editModal, editModalApi] = useVbenModal({
  connectedComponent: editModalUI,
});
const headerTabs = ref([
  {
    label: '参数',
    value: 'schedulerParam',
    disabled: false,
  },
  {
    label: '日志',
    value: 'log',
    disabled: false,
  },
]);

// 子表组件隐射
const TabVal = {
  schedulerParam: 'schedulerParam', // 调价明细
  log: 'log', // 调价结果
} as const;

// 子表头部切换默认值
const currentTab = ref<(typeof TabVal)[keyof typeof TabVal]>(
  TabVal.schedulerParam,
);

const schedulerParamComRef = useTemplateRef<
  InstanceType<typeof schedulerParamCom>
>('schedulerParamComRef');

const logComRef = useTemplateRef<InstanceType<typeof logCom>>('logComRef');

const renderDay = (val: any) => {
  return val === 'Y' ? '√' : '';
};

// 父表行切换的逻辑
const handleParentRadioChange = ({ row }: { row: any }) => {
  console.warn('父表选中行变化 ===>', row);
  selectRow.value = row || null;
  // 清空下游所有数据和状态
  // selectedDetailRow.value = null;
  // priceAdjDetailsComRef.value?.clear();
  // priceAdjResultComRef.value?.clear();
  // 触发第一个子表(调价明细)查询
  // if (selectRow.value?.AD_Process_ID) {
  //   // selectRow.value?.query();
  // }
  currentChange();
};

const currentChange = () => {
  if (currentTab.value === TabVal.schedulerParam) {
    schedulerParamComRef.value?.handleQuery(selectRow.value);
  } else if (currentTab.value === TabVal.log) {
    logComRef.value?.handleQuery(selectRow.value);
  }
};

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // stripe: true,

      radioConfig: {
        trigger: 'row',
        highlight: true,
      },

      pagerConfig: {
        enabled: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    id: 'parentTable',
    queryUrl: `/schedulerHandleAction/query.do`,
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'AD_Scheduler_ID',
        title: 'AD_Scheduler_ID',
        minWidth: '80',
        visible: false,
        sortable: true,
      },
      {
        field: 'AD_Schedule_ID',
        title: 'AD_Schedule_ID',
        minWidth: '80',
        visible: false,
        sortable: true,
      },
      {
        field: 'AD_Process_ID',
        title: 'AD_Process_ID',
        minWidth: '80',
        visible: false,
        sortable: true,
      },
      {
        field: 'ProcessName',
        title: '名称',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'IsActive',
        title: '是否启用',
        minWidth: '90',
        sortable: true,
        align: 'center',
        formatter({ row }: any) {
          return renderDay(row.IsActive);
        },
      },
      {
        field: 'KeepLogDays',
        title: '日志保留天数',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'ScheduleTypeName',
        title: '计划类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'ScheduleType',
        title: '计划类型',
        minWidth: '100',
        visible: false,
        sortable: true,
      },
      {
        field: 'MonthDay',
        title: '月份日期',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'WeekDay',
        title: '星期几',
        align: 'right',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'FrequencyTypeName',
        title: '频度类型',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'FrequencyType',
        title: '频度类型',
        minWidth: '90',
        visible: false,
        sortable: true,
      },

      {
        field: 'Frequency',
        title: '频度',
        minWidth: '120',
        visible: false,
        sortable: true,
      },
      {
        field: 'OnMonday',
        title: '星期一',
        width: '80',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.OnMonday);
        },
        align: 'center',
      },
      {
        field: 'OnTuesday',
        title: '星期二',
        width: '80',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.OnTuesday);
        },
        align: 'center',
      },
      {
        field: 'OnWednesday',
        title: '星期三',
        width: '80',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.OnWednesday);
        },
        align: 'center',
      },
      {
        field: 'OnThursday',
        title: '星期四',
        width: '80',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.OnThursday);
        },
        align: 'center',
      },
      {
        field: 'OnFriday',
        title: '星期五',
        width: '80',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.OnFriday);
        },
        align: 'center',
      },
      {
        field: 'OnSaturday',
        title: '星期六',
        width: '80',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.OnSaturday);
        },
        align: 'center',
      },
      {
        field: 'OnSunday',
        title: '星期日',
        width: '80',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.OnSunday);
        },
        align: 'center',
      },
      {
        field: 'ScheduleHour',
        title: '启动小时',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'ScheduleMinute',
        title: '启动分钟',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'RunOnlySpecifiedTime',
        title: '仅指定时间',
        formatter({ row }: any) {
          return renderDay(row.RunOnlySpecifiedTime);
        },
        align: 'center',
        width: '120',
        sortable: true,
      },
      {
        field: 'RunOnlySpecifiedTolMin',
        title: '运行窗口时间',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'RunOnlyOnIP',
        title: '仅IP地址',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return renderDay(row.RunOnlyOnIP);
        },
        align: 'center',
      },
      {
        field: 'DateLastRun',
        title: '上次运行时间',
        width: '140',
        sortable: true,
      },
      {
        field: 'DateNextRun',
        title: '下次运行时间',
        width: '140',
        sortable: true,
      },
      {
        field: 'Description',
        title: '描述',
        width: '140',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'processName',
        label: '名称',
        componentProps: {
          placeholder: '请输入名称',
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        handleParentRadioChange({ row });
      },
    },
    beforeFetchFn: (params) => {
      return {
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

onMounted(() => {
  ChcGridApi.query();
});

const selectRow: any = ref({});

const handleQuery = () => {
  // roleGridApi.query({
  //   treatmentId: selectRow.value.treatmentId,
  // });
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
};

const handleExecute = (row: any) => {
  // processModalApi.setData(row).open();
  if (row.IsActive !== 'Y') {
    message.warning('请先启用定时任务');
    return;
  }
  const params = {
    AD_Scheduler_ID: row.AD_Scheduler_ID,
  };
  Modal.confirm({
    title: '提示',
    content: `立即执行${row.ProcessName}吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      return executeScheduler(params).then((res: any) => {
        message.success(res.msg);
        handleQuery();
      });
    },
  });
};

const handleEdit = () => {
  if (!selectRow.value.AD_Process_ID) {
    message.warning('请选择定时任务');
    return;
  }
  editModalApi.setData(selectRow.value).open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <editModal @close="handleQuery" />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleEdit"
                data-testid="button_config_index"
              >
                配置
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                style="background-color: #b17a33d4"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleExecute(scope.row)"
                :data-testid="`button_execute_${scope.rowIndex}`"
              >
                立即执行
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <div
            class="relative box-border flex h-full w-full flex-col items-start justify-start bg-white"
          >
            <div class="box-border w-full bg-white p-[8.4px_8px]">
              <RadioGroup
                v-model:value="currentTab"
                button-style="solid"
                @change="currentChange"
                data-testid="RadioGroup_currentTab"
              >
                <template v-for="item in headerTabs" :key="item.value">
                  <RadioButton
                    :value="item.value"
                    :disabled="item.disabled"
                    :data-testid="`RadioButton_${item.value}`"
                  >
                    {{ item.label }}
                  </RadioButton>
                </template>
              </RadioGroup>
            </div>
            <div class="bg-pink relative box-border w-full flex-1">
              <div class="absolute box-border h-full w-full p-[8.4px_8px]">
                <schedulerParamCom
                  ref="schedulerParamComRef"
                  v-show="currentTab === TabVal.schedulerParam"
                  v-model:current-tab="currentTab"
                  v-model:parent-data="selectRow"
                  :this-tab="headerTabs[0] as PageTab"
                />
                <logCom
                  ref="logComRef"
                  v-show="currentTab === TabVal.log"
                  v-model:current-tab="currentTab"
                  v-model:parent-data="selectRow"
                  :this-tab="headerTabs[1] as PageTab"
                />
              </div>
            </div>
          </div>
        </template>
      </PageSplitLazy>
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
