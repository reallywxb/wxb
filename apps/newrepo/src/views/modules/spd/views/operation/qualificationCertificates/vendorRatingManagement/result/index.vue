<script lang="ts" setup>
import type { GridColumn } from '@vben/chc-ui';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button as AntButton } from 'ant-design-vue';
import dayjs from 'dayjs';
import { cloneDeep, omit } from 'lodash-es';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import RateDetail from './detail.vue';
// 表格表头评价率
const tableHeaderRate = ref<{
  hospRateWeight?: number;
  invoiceRateWeight?: number;
  licenseMaintenanceRateWeight?: number;
  orderOnTimeRateWeight?: number;
  passRateWeight?: number;
}>({
  hospRateWeight: undefined,
  invoiceRateWeight: undefined,
  licenseMaintenanceRateWeight: undefined,
  orderOnTimeRateWeight: undefined,
  passRateWeight: undefined,
});

// 设置表头
const setGridTableHeader = async () => {
  try {
    const res = await requestFormClient.post(
      '/vendorRatingAction/queryVendorRatingResult',
      {
        vendorName: '',
        ratingPeriod: dayjs().format('YYYY'),
        pageSize: 1,
        pageNum: 1,
        limit: 1,
        start: 0,
      },
    );
    console.warn('setGridTableHeader res', res);
    const obj = {
      invoiceRateWeight: res.tableColumn['发票送达及时率'],
      orderOnTimeRateWeight: res.tableColumn['订单配送及时率'],
      licenseMaintenanceRateWeight: res.tableColumn['资质证照维护率'],
      hospRateWeight: res.tableColumn['院方评价'],
      passRateWeight: res.tableColumn['验收合格率'],
    };
    tableHeaderRate.value = {
      ...obj,
    };
    // 更新表格列配置
    chcGridApi.setGridOptions({
      columns: getGridColumns(),
    });
  } catch (error) {
    console.error('设置表头失败', error);
  }
};
const getGridColumns = (): GridColumn[] => {
  return [
    {
      type: 'radio',
      width: 50,
      align: 'center',
      title: '单选',
      visible: false,
    },
    {
      type: 'seq',
      width: 50,
      align: 'center',
      title: '序号',
    },
    {
      field: 'vendorName',
      title: '供应商名称',
      width: 100,
      sortable: false,
    },
    {
      field: 'vendorCode',
      title: '供应商编码',
      width: 100,
      align: 'center',
      sortable: false,
    },
    {
      field: 'compositeScore',
      title: '综合得分',
      width: 100,
      align: 'center',
      sortable: false,
    },
    {
      field: 'levelName',
      title: '评级',
      width: 100,
      align: 'center',
      sortable: false,
    },
    {
      field: 'orderDeliverScore',
      title: `订单配送及时率${
        isEmpty(tableHeaderRate.value.orderOnTimeRateWeight)
          ? ''
          : `（${tableHeaderRate.value.orderOnTimeRateWeight}%）`
      }`,
      width: 180,
      align: 'center',
      sortable: false,
    },
    {
      field: 'passRateScore',
      title: `验收合格率${
        isEmpty(tableHeaderRate.value.passRateWeight)
          ? ''
          : `（${tableHeaderRate.value.passRateWeight}%）`
      }`,
      width: 180,
      align: 'center',
      sortable: false,
    },
    {
      field: 'licenseScore',
      title: `资质证照维护率${
        isEmpty(tableHeaderRate.value.licenseMaintenanceRateWeight)
          ? ''
          : `（${tableHeaderRate.value.licenseMaintenanceRateWeight}%）`
      }`,
      width: 180,
      align: 'center',
      sortable: false,
    },
    {
      field: 'invoiceScore',
      title: `发票送达及时率${
        isEmpty(tableHeaderRate.value.invoiceRateWeight)
          ? ''
          : `（${tableHeaderRate.value.invoiceRateWeight}%）`
      }`,
      width: 180,
      align: 'center',
      sortable: false,
    },
    {
      field: 'hospRatingScore',
      title: `院方评价${
        isEmpty(tableHeaderRate.value.hospRateWeight)
          ? ''
          : `（${tableHeaderRate.value.hospRateWeight}%）`
      }`,
      width: 180,
      align: 'center',
      sortable: false,
    },
    {
      field: 'vendorStatus',
      title: `供应商状态`,
      width: 100,
      align: 'center',
      sortable: false,
    },
    {
      field: 'action',
      title: '操作',
      // width: 150,
      fixed: 'right',
      headerAlign: 'center',
      align: 'center',
      slots: {
        default: (scope) => {
          return h(
            AntButton,
            {
              type: 'primary',
              ghost: true,
              onClick: () => {
                console.warn('点击单元格 scope', scope);
                detailData.value = {
                  ...cloneDeep(scope.row),
                  ...cloneDeep(tableHeaderRate.value),
                };
                currentPage.value = PageType.Detail;
              },
              'data-testid': `button_detail_${scope.rowIndex}`,
            },
            {
              default: () => '查看详情',
            },
          );
        },
      },
    },
  ];
};
setGridTableHeader();
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
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
    }),
  },
  {
    id: 'result',
    queryUrl: '/vendorRatingAction/queryVendorRatingResult',
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'ratingCycleType',
        label: '考评周期类型',
        defaultValue: '1',
        componentProps: () => {
          return {
            placeholder: '请选择考评周期类型',
            allowClear: false,
            options: [
              {
                label: '年度',
                value: '1',
              },
              {
                label: '季度',
                value: '2',
              },
            ],
          };
        },
      },
      {
        component: 'DatePicker',
        fieldName: 'ratingYear',
        label: '考评时间',
        defaultValue: dayjs().format('YYYY'),
        componentProps: () => {
          return {
            placeholder: '请选择考评时间',
            picker: 'year',
            format: 'YYYY年',
            valueFormat: 'YYYY',
            allowClear: false,
          };
        },
        dependencies: {
          triggerFields: ['ratingCycleType'],
          show: (values) => values.ratingCycleType === '1',
        },
      },
      {
        component: 'DatePicker',
        fieldName: 'ratingQuarter',
        label: '考评时间',
        defaultValue: dayjs().format('YYYY-Q'),
        componentProps: () => {
          return {
            placeholder: '请选择考评时间',
            picker: 'quarter',
            format: 'YYYY年第Q季度',
            valueFormat: 'YYYY-Q',
            allowClear: false,
          };
        },
        dependencies: {
          triggerFields: ['ratingCycleType'],
          show: (values) => values.ratingCycleType === '2',
        },
      },
      {
        component: 'Input',
        fieldName: 'vendorName',
        label: '供应商',
        componentProps: () => {
          return {
            placeholder: '请输入供应商名称',
            allowClear: true,
          };
        },
      },
      {
        component: 'Select',
        fieldName: 'ratingLevel',
        label: '评级',
        componentProps: () => {
          return {
            placeholder: '请选择评级',
            allowClear: true,
            options: [
              { value: '', label: '全部' },
              { value: 'A', label: '优秀' },
              { value: 'B', label: '良好' },
              { value: 'C', label: '待改进' },
              { value: 'D', label: '不合格' },
            ],
          };
        },
        defaultValue: '',
      },
    ],
    gridColumns: getGridColumns(),
    // showRadioRowTag: true,
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      const ratingPeriod =
        params.ratingCycleType === '1'
          ? params.ratingYear
          : params.ratingQuarter;
      const realParams = omit(params, [
        'ratingCycleType',
        'ratingYear',
        'ratingQuarter',
      ]);
      return { ...realParams, ratingPeriod };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.data,
        total: params.total,
      };
    },
  },
);
const PageType = {
  Main: 'MAIN',
  Detail: 'DETAIL',
} as const;

type PageTypeValue = (typeof PageType)[keyof typeof PageType];
const currentPage = ref<PageTypeValue>(PageType.Main);
// 详情数据
const detailData = ref<Record<string, any>>({});
// 处理返回
const handleBack = () => {
  currentPage.value = PageType.Main;
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid v-show="currentPage === PageType.Main" />
    <RateDetail
      v-show="currentPage === PageType.Detail"
      @back="handleBack"
      :current-page="currentPage"
      :detail-data="detailData"
    />
  </Page>
</template>

<style lang="less" scoped>
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
