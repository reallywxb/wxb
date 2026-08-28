<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
// 页面容器组件
// 页面布局组件
import { deepMerge } from '#/utils/util';

// 单据信息
const orderInfo = ref({
  deliveryNo: '',
  dispensingDate: '',
  wardName: '',
  dispensingStatus: '',
  indicator: '',
  indicatorDate: '',
  dispenser: '',
  dispensingTime: '',
  reviewer: '',
  reviewDate: '',
});

// Mock 数据
const mockData = {
  orderInfo: {
    deliveryNo: 'PS20260001',
    dispensingDate: '2026-02-25 10:12:22',
    wardName: '综合科一病区',
    dispensingStatus: '已完成',
    indicator: '张三',
    indicatorDate: '2026-02-25 10:15:00',
    dispenser: '李四',
    dispensingTime: '2026-02-25 10:15:10',
    reviewer: '王五',
    reviewDate: '2026-02-25 10:16:00',
  },
  list: Array.from({ length: 20 }).map((_, index) => ({
    id: index + 1,
    vendorName: `供应商${String.fromCodePoint(65 + (index % 5))}`,
    vendorCode: `VEN${String(index + 1).padStart(4, '0')}`,
    compositeScore: `${(90 + Math.random() * 10).toFixed(2)}%`, // 交货及时率
    passRateScore: `${(95 + Math.random() * 5).toFixed(2)}%`, // 验收合格率
    licenseScore: `${(98 + Math.random() * 2).toFixed(2)}%`, // 证照合格率
    invoiceScore: `${(Math.random() * 2).toFixed(2)}%`, // 不良事件率
    hospRatingScore: Math.floor(Math.random() * 10_000), // 订单规模
    vendorStatus: `${Math.floor(Math.random() * 60) + 30}天`, // 结算周期
    vendorScore: (80 + Math.random() * 20).toFixed(1), // 工艺上得分
    vendorLevel: ['A', 'B', 'C'][index % 3], // 供应商等级
  })),
};

// 自定义查询函数 - 使用 mock 数据
const mockQuery = async () => {
  // 模拟接口延迟
  await new Promise((resolve) => setTimeout(resolve, 300));
  chcGridApi.formApi.getValues().then((res) => {
    orderInfo.value = {
      ...mockData.orderInfo,
      ...res,
    };
  });

  // 返回 mock 数据
  return {
    items: mockData.list,
    total: mockData.list.length,
  };
};

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      isSeparator: false,
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      isSeparator: false,
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
    id: 'emptyStatic',
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '处方时间',
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'deliveryNoPerson',
        label: '供应商',
        componentProps: {
          placeholder: '请输入供应商名称',
          allowClear: true,
        },
      },
    ],
    gridColumns: [
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
      },
      {
        field: 'vendorName',
        title: '供应商名称',
        width: 120,
        sortable: false,
      },
      {
        field: 'vendorCode',
        title: '供应商编码',
        width: 120,
        align: 'center',
        sortable: false,
      },
      {
        field: 'compositeScore',
        title: '交货及时率',
        width: 120,
        align: 'center',
        sortable: false,
      },
      {
        field: 'passRateScore',
        title: '验收合格率',
        width: 120,
        align: 'center',
        sortable: false,
      },
      {
        field: 'licenseScore',
        title: '证照合格率',
        width: 120,
        align: 'center',
        sortable: false,
      },
      {
        field: 'invoiceScore',
        title: '不良事件率',
        width: 100,
        align: 'center',
        sortable: false,
      },
      {
        field: 'hospRatingScore',
        title: '订单规模',
        width: 100,
        align: 'center',
        sortable: false,
      },
      {
        field: 'vendorStatus',
        title: `结算周期`,
        width: 100,
        align: 'center',
        sortable: false,
      },
      {
        field: 'vendorScore',
        title: `供应商得分`,
        width: 100,
        align: 'center',
        sortable: false,
      },
      {
        field: 'vendorLevel',
        title: `供应商等级`,
        width: 100,
        align: 'center',
        sortable: false,
      },
    ],
  },
);
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid />
  </Page>
</template>
<style scoped></style>
