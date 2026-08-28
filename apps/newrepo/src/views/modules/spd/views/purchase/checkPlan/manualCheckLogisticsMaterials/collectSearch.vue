<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import { commonFormOptions, viewFormOptions } from './options';

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
const selectController = new LazySelect(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});

const extParams = ref({});
const totalAmount = ref(0);
const totalType = ref(1); // 默认值为1
const isFirstLoaded = ref(false);
// const currentTab = defineModel<number>('currentTab', { required: true });
// const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });

const gridColumns1 = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 110,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 90,
    sortable: true,
    title: '数量',
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right',
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
];
const gridColumns2 = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'applyBPartnerName',
    minWidth: 110,
    sortable: true,
    title: '需求库房',
    formatter: (params: any) => {
      return params.row.applyBPartnerName || '';
    },
  },
  {
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 110,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 90,
    sortable: true,
    title: '数量',
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right',
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'insurance',
    minWidth: 130,
    sortable: true,
    title: '医保药品编码',
  },
  {
    field: 'isCrossDocking',
    minWidth: 150,
    sortable: true,
    title: '是否直供',
    formatter({ row }: any) {
      return row.isCrossDocking === 'Y' ? '是' : '否';
    },
  },
];
const gridColumns3 = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 110,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 90,
    sortable: true,
    title: '数量',
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right',
  },
  {
    field: 'lot',
    minWidth: 100,
    sortable: true,
    title: '批号',
  },
  {
    field: 'guaranteeDate',
    minWidth: 100,
    sortable: true,
    title: '效期',
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'insurance',
    minWidth: 130,
    sortable: true,
    title: '医保药品编码',
  },
];

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateCommit', ['commitFrom', 'commitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        if (totalType.value === 1) {
          ChcGridApi.setGridOptions({
            columns: gridColumns1,
          });
        } else if (totalType.value === 3) {
          ChcGridApi.setGridOptions({
            columns: gridColumns3,
          });
        } else {
          ChcGridApi.setGridOptions({
            columns: gridColumns2,
          });
        }
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
        // ChcGridApi.query({ ...values });
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {
        // highlight: true,
      },
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    gridColumns: gridColumns1 as any[],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            options: [
              { value: 1, label: '按物资汇总' },
              // { value: 2, label: '按物资+需求库房汇总' },
              { value: 3, label: '按批号效期汇总' },
            ],
            placeholder: '请选择查询维度',
            paginate: false,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              totalType.value = val; // 更新查询维度值
              console.warn('totalType', totalType.value, val, option);
              // extParams.value.queryDimension_text = option.label;
            },
            immediate: true,
          };
        },
        fieldName: 'totalType',
        label: '查询维度',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateCommit',
        label: '入库提交时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y&categoryType=2',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            // showSearch: true,
            placeholder: '请选择采购仓库',
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
              selectController.sign();
            },
            paginate: false,
            // allowClear: true,
            // filterByFrontEnd: false,
            // onSearch: (params: any) => {
            //   console.warn('onSearch:', params);
            // },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/vendor.do?categoryType=2',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('bpartnerId', val, option);
              selectController.sign();
              // extParams.value.vendorId_text = option.name;
            },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'mInoutId',
        label: '入库单号',
        componentProps: {
          placeholder: '请输入入库单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '物资关键字',
        componentProps: {
          placeholder: '请输入编码/名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '已开票' },
              { value: 'N', label: '未开票' },
            ],
            placeholder: '请选择开票状态',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'invoiceStatus',
        label: '开票状态',
      },
    ],
    // showExportBtn: true,
    dataTableId: '/asnAction/totalDetail.do',
    id: 'manualInfoCollectSearch',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    // getTableArrDataFn: (params) => {
    //   totalAmount.value = params.totalPrice || 0;
    //   let amout = 0;
    //   params.rows?.forEach((item: any) => {
    //     if (item.lineAmt) {
    //       amout += Number.parseFloat(item.lineAmt);
    //     }
    //   });
    //   totalAmount.value = Number(amout.toFixed(2));
    //   console.warn('getTableArrDataFn:', params.totalPrice);
    //   return {
    //     ...params,
    //     records: params.rows,
    //   };
    // },
    beforeFetchFn: (params) => {
      return {
        ...params,
        asnType: 'PO',
        // receiptType: params.receiptType || '2,3,4,5,G,S',
      };
    },
    afterFetchFn: (params) => {
      const amout = params.rows?.reduce((pre: number, cur: any) => {
        if (cur.lineAmt) {
          return pre + Number.parseFloat(cur.lineAmt);
        }
        return pre;
      }, 0);
      totalAmount.value = Number(amout.toFixed(2));
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
    // customModals: {
    //   'AddNewModal-addNewModalApi': {
    //     class: 'w-[800px]',
    //     closable: true,
    //     // 连接抽离的组件
    //     connectedComponent: CustomModal,
    //     draggable: true,
    //   },
    // },
  },
);
// const handleView = () => {
//   headerTabs.value[3]!.disabled = false;
//   currentTab.value = 3;
// };
onMounted(() => {
  // ChcGridApi.query();
});
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleView" class="mr-[0.5rem]">
          汇总查询
        </Button> -->
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_collectSearch"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <Summarize ref="summarizeRef" />
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
