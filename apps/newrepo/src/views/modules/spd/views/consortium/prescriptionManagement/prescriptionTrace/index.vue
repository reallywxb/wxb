<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
// 页面容器组件
import SpdPage from '#/components/spd/page/spdPageNew.vue';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
// 页面布局组件

import { queryPrescriptionTraceDetailApi } from './api';
// 引入详情组件
import TraceDetail from './components/TraceDetail.vue';

interface DetailInfoType {
  detailTitle: string;
  sourcePage: number;
  type: 'add' | 'edit' | 'view';
}

interface PageTabType {
  disabled?: boolean;
  label: string;
  value: number;
}

// 头部tab数组
const headerTabs = ref<PageTabType[]>([
  {
    label: '列表',
    value: 0,
    disabled: false,
  },
  {
    label: '详情',
    value: 1,
    disabled: false,
  },
]);

// 当前激活的tab，0为列表，1为详情
const currentTab = ref(0);
// 详情数据
const prescriptionInfo = ref<any>({});

// 追溯信息数据
const traceData = ref<any[]>([]);

// 当前处理的行数据
const currentHandleRow = ref<any>(undefined);

// 父组件数据传递
const parentData = ref<any>({});

// 编辑查看页面的配置信息
const detailConfig = ref<DetailInfoType | undefined>(undefined);

// 查看详情
const handleViewDetail = async (row: any) => {
  await queryPrescriptionTraceDetailApi(row.prescriptionId).then((detail) => {
    prescriptionInfo.value = detail;
    // 获取追溯信息数据
    traceData.value = detail.traceList || [];

    // 设置详情页配置
    detailConfig.value = {
      detailTitle: '',
      sourcePage: 0,
      type: 'view',
    };

    currentTab.value = 1;
  });
};

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['beginDate', 'endDate'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'prescriptionTrace',
    queryUrl: '/prescriptionAction/traceList',
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '处方时间',
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'extHospitalId',
        label: '外延医院',
        componentProps: () => {
          return {
            dictUrl: '/prescriptionAction/queryAllHospital',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择外延医院',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // 处理返回数据
              const newRecords =
                res.data.map((item: any) => ({
                  ...item,
                  id: item.code,
                })) || [];
              return { ...res, rows: undefined, records: newRecords };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'presNo',
        label: '处方号',
        componentProps: {
          placeholder: '请输入处方号',
        },
      },
      {
        component: 'Input',
        fieldName: 'patientCode',
        label: '就诊卡号',
        componentProps: {
          placeholder: '请输入',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/prescriptionAction/queryAllHospital',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择开方医院',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              const rows = res.data.map((item: any) => ({
                ...item,
                id: item.code,
              }));
              return { ...res, rows: undefined, records: rows || [] };
            },
          };
        },
        fieldName: 'hospitalId',
        label: '开方医院',
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '就诊人',
        componentProps: {
          placeholder: '请输入就诊人',
        },
      },
    ],
    gridColumns: [
      {
        title: '序号',
        width: 50,
        align: 'center',
        fixed: 'left',
        field: 'index',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'presNo',
        title: '处方号',
        width: 120,
      },
      {
        field: 'orgName',
        title: '开方医院',
        minWidth: 150,
      },
      {
        field: 'extOrgName',
        title: '外延医院',
        minWidth: 150,
      },
      {
        field: 'extWarehouseName',
        title: '外延药房',
        minWidth: 150,
      },
      {
        field: 'patientName',
        title: '就诊人',
        width: 120,
      },
      {
        field: 'patientCode',
        title: '就诊卡号',
        width: 120,
      },
      {
        field: 'sex',
        title: '性别',
        width: 80,
      },
      {
        field: 'age',
        title: '年龄',
        width: 80,
      },
      {
        field: 'totalAmt',
        width: 100,
        sortable: true,
        title: '处方金额',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
      },
      {
        field: 'presTypeName',
        title: '处方类型',
        width: 100,
      },
      {
        field: 'presDate',
        sortable: true,
        title: '处方时间',
        minWidth: 160,
      },
      {
        title: '操作',
        field: 'action',
        fixed: 'right',
        width: 100,
        slots: {
          default: ({ row }: any) => {
            return h(
              Button,
              {
                type: 'link',
                size: 'small',
                onClick: () => handleViewDetail(row),
              },
              () => '查看明细',
            );
          },
        },
      },
    ],
  },
);

const handleSearch = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  await chcGridApi.query(formValues);
};

// 页面加载时自动查询
onMounted(async () => {
  await handleSearch();
});
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:current-handle-row="currentHandleRow"
    v-model:parent-data="parentData"
    v-model:detail-config="detailConfig"
    mode="noTab"
  >
    <!-- 列表页面 -->
    <template #headerTab-0>
      <div v-show="currentTab === 0" class="h-full">
        <ChcGrid />
      </div>
    </template>

    <!-- 详情页面 -->
    <template #headerTab-1>
      <div v-show="currentTab === 1" class="h-full">
        <TraceDetail
          :prescription-info="prescriptionInfo"
          :trace-data="traceData"
        />
      </div>
    </template>
  </SpdPage>
</template>

<style scoped></style>
