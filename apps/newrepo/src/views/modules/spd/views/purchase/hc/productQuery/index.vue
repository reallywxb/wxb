<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
// 页面容器组件
import SpdPage from '#/components/spd/page/spdPageNew.vue';
// 页面布局组件
import { deepMerge } from '#/utils/util';

import { queryTraceCodeDetailApi } from './api';
// 引入详情组件
import TraceDetail from './components/TraceDetail.vue';

// 定义类型
interface TraceDetailType {
  traceCode: string;
  productCode: string;
  productName: string;
  productSpec: string;
  dosageForm: string;
  unitName: string;
  approvalNo: string;
  productionDate: string;
  lot: string;
  expiryDate: string;
  manufacturer: string;
  defaultVendor: string;
}

export interface CirculationDataType {
  time: string;
  documentNo: string;
  documentType: string;
  operator: string;
  department: string;
  source: string;
  target: string;
}

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
const traceDetail = ref<TraceDetailType>({
  traceCode: '',
  productCode: '',
  productName: '',
  productSpec: '',
  dosageForm: '',
  unitName: '',
  approvalNo: '',
  productionDate: '',
  lot: '',
  expiryDate: '',
  manufacturer: '',
  defaultVendor: '',
});

// 流通信息数据
const circulationData = ref<CirculationDataType[]>([]);

// 当前处理的行数据
const currentHandleRow = ref<any>(undefined);

// 父组件数据传递
const parentData = ref<any>({});

// 编辑查看页面的配置信息
const detailConfig = ref<DetailInfoType | undefined>(undefined);

// 查看详情
const handleViewDetail = async (row: any) => {
  // 模拟从API获取详情数据

  await queryTraceCodeDetailApi(row.traceCode).then((rowDetail) => {
    traceDetail.value = {
      traceCode: rowDetail.traceCode,
      productCode: rowDetail.productCode,
      productName: rowDetail.productName,
      productSpec: rowDetail.productSpec,
      dosageForm: rowDetail.productStyle, // 剂型
      unitName: rowDetail.unitName,
      approvalNo: rowDetail.approvalNo,
      productionDate: rowDetail.productionDate,
      lot: rowDetail.lot,
      expiryDate: rowDetail.expiryDate,
      manufacturer: rowDetail.manufacturer,
      defaultVendor: rowDetail.vendorName,
    };
    // 模拟获取流通信息数据
    circulationData.value = rowDetail.graphicsList || [];

    // 设置详情页配置
    detailConfig.value = {
      detailTitle: '追溯码详情',
      sourcePage: 0,
      type: 'view',
    };

    currentTab.value = 1;
  });
};

const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        [
          'purchaseDateRange',
          ['purchaseDateFrom', 'purchaseDateTo'],
          'YYYY-MM-DD',
        ],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
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
    id: 'productQuery',
    queryUrl: '/asnAction/tracCode/list.do',
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productCode',
        label: '药品',
        componentProps: {
          placeholder: '编码/名称/搜索码',
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            placeholder: '请选择',
            style: { width: '160px' },
            dictUrl: '/baseHandleAction/vendor.do',
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
        fieldName: 'traceCode',
        label: '追溯码',
        componentProps: {
          placeholder: '请输入',
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'purchaseDateRange',
        label: '采购时间',
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
        },
        defaultValue: [
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
    ],
    gridColumns: [
      {
        title: '序号',
        width: 60,
        align: 'center',
        fixed: 'left',
        field: 'index',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'traceCode',
        title: '追溯码',
        minWidth: 150,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: 120,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: 90,
      },
      {
        field: 'productionDate',
        title: '生产日期',
        width: 120,
      },
      {
        field: 'lot',
        title: '批号',
        width: 100,
      },
      {
        field: 'expiryDate',
        title: '有效期至',
        width: 120,
      },
      {
        field: 'approvalNo',
        title: '批准文号',
        width: 200,
      },
      {
        field: 'manufacturer',
        title: '生产企业',
        width: 150,
      },
      {
        field: 'unitName',
        title: '单位',
        width: 80,
      },
      {
        field: 'minUnitName',
        title: '最小单位',
        width: 80,
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
              () => '详情',
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
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleExport"
              class="mr-2"
              data-testid="button_export_productQuery"
            >
              <template #icon>
                <ExportActionIcon />
              </template>
              导出
            </Button>
          </template>
        </ChcGrid>
      </div>
    </template>

    <!-- 详情页面 -->
    <template #headerTab-1>
      <div v-show="currentTab === 1">
        <TraceDetail
          :trace-info="traceDetail"
          :circulation-data="circulationData"
        />
      </div>
    </template>
  </SpdPage>
</template>
