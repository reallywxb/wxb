<script lang="ts" setup>
import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, Tag } from 'ant-design-vue';

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
    deliveryNo: '202514231',
    dispensingDate: '2025-10-12 12:23:22',
    wardName: '综合科一病区',
    dispensingStatus: '已完成',
    indicator: '陈明华',
    indicatorDate: '2025-10-12 12:25:32',
    dispenser: '陈明华',
    dispensingTime: '2025-10-12 12:25:32',
    reviewer: '李秀英',
    reviewDate: '2025-10-12 12:25:32',
  },
  list: [
    {
      productName: '注射用头孢唑林钠',
      productCode: 'YP001001',
      status: 'pending',
      manufacturer: '华北制药',
      productSpec: '0.5g',
      dispenseQty: 10,
      recycledQty: 0,
      currentRecycleQty: 10,
      unitName: '支',
      batchNo: '20251001',
      expiryDate: '2027-10-01',
      controlLevel: '普通',
      patientName: '王建国',
      gender: '男',
      age: 45,
      diagnosis: '肺炎',
    },
    {
      productName: '氯化钠注射液',
      productCode: 'YP001002',
      status: 'destroy',
      manufacturer: '大冢制药',
      productSpec: '250ml',
      dispenseQty: 5,
      recycledQty: 3,
      currentRecycleQty: 2,
      unitName: '瓶',
      batchNo: '20250915',
      expiryDate: '2026-09-15',
      controlLevel: '普通',
      patientName: '刘淑芬',
      gender: '女',
      age: 32,
      diagnosis: '上呼吸道感染',
    },
    {
      productName: '阿莫西林胶囊',
      productCode: 'YP001003',
      status: 'completed',
      manufacturer: '联邦制药',
      productSpec: '0.25g*24',
      dispenseQty: 2,
      recycledQty: 2,
      currentRecycleQty: 0,
      unitName: '盒',
      batchNo: '20250820',
      expiryDate: '2026-08-20',
      controlLevel: '普通',
      patientName: '张伟强',
      gender: '男',
      age: 28,
      diagnosis: '扁桃体炎',
    },
    {
      productName: '盐酸氨溴索注射液',
      productCode: 'YP001004',
      status: 'pending',
      manufacturer: '勃林格殷格翰',
      productSpec: '2ml:15mg',
      dispenseQty: 8,
      recycledQty: 0,
      currentRecycleQty: 8,
      unitName: '支',
      batchNo: '20251101',
      expiryDate: '2027-11-01',
      controlLevel: '普通',
      patientName: '周秀兰',
      gender: '女',
      age: 56,
      diagnosis: '慢性支气管炎',
    },
    {
      productName: '注射用青霉素钠',
      productCode: 'YP001005',
      status: 'destroy',
      manufacturer: '石药集团',
      productSpec: '80万单位',
      dispenseQty: 6,
      recycledQty: 4,
      currentRecycleQty: 2,
      unitName: '支',
      batchNo: '20251020',
      expiryDate: '2026-10-20',
      controlLevel: '特殊',
      patientName: '杨志远',
      gender: '男',
      age: 38,
      diagnosis: '皮肤感染',
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
    id: 'emptyBottleRecycle',
    formSchema: [
      {
        component: 'Input',
        fieldName: 'deliveryNo',
        label: '送货单号',
        componentProps: {
          placeholder: '请输入送货单号',
          allowClear: true,
        },
      },
    ],
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
        fixed: 'left',
      },
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
        field: 'productName',
        title: '药品名称',
        width: 180,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: 120,
      },
      {
        field: 'status',
        title: '状态',
        width: 90,
        slots: {
          default: ({ row }: any) => {
            const statusMap: Record<string, { color: string; text: string }> = {
              pending: { color: 'orange', text: '待回收' },
              destroy: { color: 'red', text: '待销毁' },
              completed: { color: 'green', text: '已完成' },
            };
            const status = statusMap[row.status] || {
              color: 'default',
              text: row.status,
            };
            return h(Tag, { color: status.color }, () => status.text);
          },
        },
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: 150,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: 100,
      },
      {
        field: 'dispenseQty',
        title: '发药数量',
        width: 90,
        align: 'right',
      },
      {
        field: 'recycledQty',
        title: '已回收数量',
        width: 100,
        align: 'right',
      },
      {
        field: 'currentRecycleQty',
        title: '本次回收数量',
        width: 110,
        align: 'right',
      },
      {
        field: 'unitName',
        title: '单位',
        width: 80,
      },
      {
        field: 'batchNo',
        title: '批号',
        width: 120,
      },
      {
        field: 'expiryDate',
        title: '有效期至',
        width: 120,
      },
      {
        field: 'controlLevel',
        title: '管控级别',
        width: 100,
      },
      {
        field: 'patientName',
        title: '患者姓名',
        width: 100,
      },
      {
        field: 'gender',
        title: '性别',
        width: 60,
      },
      {
        field: 'age',
        title: '年龄',
        width: 60,
        align: 'right',
      },
      {
        field: 'diagnosis',
        title: '诊断',
        width: 150,
      },
    ],
  },
);

// 回收
const handleRecycle = () => {
  console.warn('回收');
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }
  message.success('回收成功');
};

// 销毁
const handleDestroy = () => {
  message.success('销毁成功');
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #top>
        <div class="mb-4">
          <div v-if="orderInfo.deliveryNo" class="f-20 p-4 font-medium">
            <div class="mb-2 flex gap-8">
              <span>送货单号：{{ orderInfo.deliveryNo }}</span>
              <span>摆药日期：{{ orderInfo.dispensingDate }}</span>
              <span>病区名称：{{ orderInfo.wardName }}</span>
              <span>摆药状态：{{ orderInfo.dispensingStatus }}</span>
            </div>
            <div class="flex gap-8">
              <span>指示人：{{ orderInfo.indicator }}</span>
              <span>指示日期：{{ orderInfo.indicatorDate }}</span>
              <span>摆药人：{{ orderInfo.dispenser }}</span>
              <span>摆药日期：{{ orderInfo.dispensingTime }}</span>
              <span>复核人：{{ orderInfo.reviewer }}</span>
              <span>复核日期：{{ orderInfo.reviewDate }}</span>
            </div>
          </div>
          <div>
            <Button type="primary" @click="handleRecycle">回收</Button>
            <Button danger class="ml-2" @click="handleDestroy">销毁</Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped></style>
