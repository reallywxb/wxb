<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { formDefaultOptions } from './formDefaultOptions';
import { gridDefaultOptions } from './gridDefaultOptions';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      detailPageType: 'edit' | 'view' | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (row: any, detailPageConfig: DetailInfo) => void;
    thisTab: PageTab;
  }>(),
  {},
);
const { contentIsMaximize } = usePreferences();

class LazySelect {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
// 用于控制表格的查询在所有select下拉框查询完并赋值后触发
const selectController = new LazySelect(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const isFirstLoaded = ref(false);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      // submitButtonOptions: { show: false },
      // resetButtonOptions: { show: false },
      // // collapsed:false
      // showCollapseButton: false,
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
      {
        title: '多选',
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'presNo',
        minWidth: 120,
        sortable: true,
        title: '收费单号',
        slots: { default: 'presNo' },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'presDate',
        minWidth: 170,
        sortable: true,
        title: '处方日期',
      },
      {
        field: 'patientCode',
        minWidth: 135,
        sortable: true,
        title: '就诊卡号',
      },
      {
        field: 'patientName',
        minWidth: 150,
        sortable: true,
        title: '患者姓名',
      },
      {
        field: 'sex',
        minWidth: 150,
        sortable: true,
        title: '患者性别',
      },
      {
        field: 'age',
        minWidth: 70,
        sortable: true,
        title: '年龄',
      },
      {
        field: 'bendNo',
        minWidth: 90,
        sortable: true,
        title: '床位',
        align: 'right',
      },
      {
        field: 'departmentName',
        minWidth: 90,
        sortable: true,
        title: '院区',
        align: 'right',
      },
      {
        field: 'bpartnerName',
        minWidth: 120,
        sortable: true,
        title: '发放仓库',
        align: 'right',
      },
      {
        field: 'doctorName',
        minWidth: 90,
        sortable: true,
        title: '开立科室',
        align: 'right',
      },
      {
        field: 'sourceTypeName',
        minWidth: 95,
        sortable: true,
        title: '开立医生', // 暂无
      },
      {
        field: 'diagnosis',
        minWidth: 100,
        sortable: true,
        title: '诊断',
      },

      {
        field: 'createdByName',
        minWidth: 100,
        sortable: true,
        title: '处方金额',
      },

      {
        field: 'insuranceCodeNo',
        minWidth: 100,
        sortable: true,
        title: '医保卡号',
      },

      {
        field: 'description',
        minWidth: 100,
        sortable: true,
        title: '备注',
      },

      {
        field: 'confirmName',
        minWidth: 100,
        sortable: true,
        title: '确认人',
      },
      {
        field: 'confirmTime',
        minWidth: 150,
        sortable: true,
        title: '确认时间',
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择发货仓库',
            onChange() {
              // console.warn("warehouseId", val, option);
              selectController.sign();
            },
            paginate: false,
            showChooseAll: '',
            immediate: true,
            // defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'warehouseId',
        label: '发货仓库',
      },

      {
        component: 'Input',
        fieldName: 'patientCard',
        label: '就诊卡号',
        componentProps: {
          placeholder: '请输入就诊卡号',
        },
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '姓名',
        componentProps: {
          placeholder: '请输入姓名',
        },
      },
      {
        component: 'Input',
        fieldName: 'presNo',
        label: '收费单号',
        componentProps: {
          placeholder: '请输入收费单号',
        },
      },
    ],
    dataTableId: '/prescriptionAction/query.do',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: { status: 'R' },
    getTableArrDataFn: (params) => {
      totalAmount.value = params.totalPrice || 0;
      // console.warn("getTableArrDataFn:", params.totalPrice);
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
const handleOrderPlanClick = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '查看明细',
    sourcePage: props.thisTab.value,
    type: 'view',
  });
};
const handleComfirm = () => {};
</script>
<template>
  <div
    :style="{
      height: contentIsMaximize ? 'calc(100vh - 38px)' : 'calc(100vh - 152px)',
      overflowY: 'hidden',
    }"
  >
    <ChcGrid>
      <template #presNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
        >
          {{ scope.row.presNo }}
        </a>
      </template>
      <template #toolbar-actions>
        <Button type="primary" @click="handleComfirm" class="mr-[0.5rem]">
          确认
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
