<script lang="ts" setup>
import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

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
  list: [
    {
      productCode: 'CF20260001',
      productName: '市人民医院',
      manufacturer: '协作医院A',
      manufacturerout: '协作药房一部',
      patientName: '王建国',
      patientNameNo: 'JZK000001',
      gender: '男',
      age: 45,
      diagnosis: '258.60',
      expiryDate: '2026-02-01 09:15:00',
      status: 'completed',
    },
    {
      productCode: 'CF20260002',
      productName: '市中心医院',
      manufacturer: '协作医院B',
      manufacturerout: '协作药房二部',
      patientName: '刘淑芬',
      patientNameNo: 'JZK000002',
      gender: '女',
      age: 32,
      diagnosis: '125.00',
      expiryDate: '2026-02-03 10:22:10',
      status: 'pending',
    },
    {
      productCode: 'CF20260003',
      productName: '第三人民医院',
      manufacturer: '协作医院C',
      manufacturerout: '协作药房三部',
      patientName: '张伟强',
      patientNameNo: 'JZK000003',
      gender: '男',
      age: 28,
      diagnosis: '89.90',
      expiryDate: '2026-02-05 14:35:20',
      status: 'destroy',
    },
    {
      productCode: 'CF20260004',
      productName: '中医院',
      manufacturer: '协作医院D',
      manufacturerout: '协作药房四部',
      patientName: '周秀兰',
      patientNameNo: 'JZK000004',
      gender: '女',
      age: 56,
      diagnosis: '310.00',
      expiryDate: '2026-02-08 08:10:00',
      status: 'pending',
    },
    {
      productCode: 'CF20260005',
      productName: '第一人民医院',
      manufacturer: '协作医院E',
      manufacturerout: '协作药房五部',
      patientName: '杨志远',
      patientNameNo: 'JZK000005',
      gender: '男',
      age: 38,
      diagnosis: '460.50',
      expiryDate: '2026-02-12 16:45:00',
      status: 'completed',
    },
  ],
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
      showCollapseButton: true,
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
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '外延医院',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择外延医院',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'deliveryNo',
        label: '处方号',
        componentProps: {
          placeholder: '请输入处方号',
          allowClear: true,
        },
      },
      {
        component: 'Input',
        fieldName: 'deliveryNo',
        label: '就诊卡号',
        componentProps: {
          placeholder: '请输入就诊卡号',
          allowClear: true,
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentIdNo',
        label: '开方医院',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择开方医院',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'deliveryNoPerson',
        label: '就诊人',
        componentProps: {
          placeholder: '请输入就诊人',
          allowClear: true,
        },
      },
    ],
    gridColumns: [
      {
        title: '序号',
        width: 60,
        align: 'center',
        field: 'index',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productCode',
        title: '处方号',
        width: 100,
      },
      {
        field: 'productName',
        title: '开方医院',
        width: 100,
      },
      {
        field: 'manufacturer',
        title: '外延医院',
        width: 100,
      },
      {
        field: 'manufacturerout',
        title: '外延药房',
        width: 100,
      },
      {
        field: 'patientName',
        title: '就诊人',
        width: 100,
      },
      {
        field: 'patientNameNo',
        title: '就诊卡号',
        width: 110,
      },
      {
        field: 'gender',
        title: '性别',
        width: 80,
      },
      {
        field: 'age',
        title: '年龄',
        width: 80,
        align: 'right',
      },
      {
        field: 'diagnosis',
        title: '处方金额',
        width: 100,
        align: 'right',
      },
      {
        field: 'expiryDate',
        title: '处方时间',
        width: 120,
      },
      {
        field: 'status',
        title: '评价',
        width: 60,
        slots: {
          default: ({ row }: any) => {
            const statusMap: Record<string, { color: string; text: string }> = {
              pending: { color: 'orange', text: '一般' },
              destroy: { color: 'red', text: '不满意' },
              completed: { color: 'green', text: '满意' },
            };
            const status = statusMap[row.status] || {
              color: 'default',
              text: row.status,
            };
            return h(Tag, { color: status.color }, () => status.text);
          },
        },
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
