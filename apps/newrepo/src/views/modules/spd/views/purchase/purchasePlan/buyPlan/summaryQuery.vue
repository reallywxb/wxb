<script setup lang="ts">
import { nextTick, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { $t } from '#/locales';

import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { commonFormOptions, viewFormOptions } from './options';


const extParams = ref<{}>({}); // 表格查询的额外参数
const totalAmount = ref(0); // 采购总金额
const totalType = ref(1); // 查询维度 默认值为1
// 包含所有columns项的数组
const commonGridColumns = [
  { title: '序号', type: 'seq' as const, width: 50, align: 'center' as const },
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
    // TODO:medicine change 药品编码
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    // TODO:medicine change 药品名称
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
  // {
  //   field: 'modelNo',
  //   minWidth: 90,
  //   sortable: true,
  //   title: '型号',
  // },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'uomName',
    minWidth: 60,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 60,
    sortable: true,
    title: '数量',
    align: 'right' as const,
  },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
    align: 'right' as const,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.price);
    },
  },
  {
    field: 'totalOrderAmount',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right' as const,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.totalOrderAmount);
    },
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    // TODO:medicine change 医保药品编码
    field: 'insurance',
    minWidth: 130,
    sortable: true,
    title: '医保药品编码',
  },
  {
    field: 'isCrossDocking',
    minWidth: 90,
    sortable: true,
    title: $t('purchasePlan.buyPlan.isCrossDocking'),
    formatter({ row }: any) {
      return row.isCrossDocking === 'Y' ? '是' : '否';
    },
  },
];
// 根据不同业务需求，从总columns内筛选需要的
const getColumns = (type = 1) => {
  return type === 1
    ? commonGridColumns.filter((item) => {
        return item.field !== 'applyBPartnerName';
      })
    : commonGridColumns;
};
// 生成表格组件
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async () => {
        if (totalType.value === 2) {
          ChcGridApi.setGridOptions({
            columns: getColumns(2),
          });
        } else {
          ChcGridApi.setGridOptions({
            columns: getColumns(1),
          });
        }
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
      handleReset: async () => {
        await ChcGridApi.formApi.resetForm();
        ChcGridApi.formApi.setValues({
          totalType: 1,
        });
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(formValues);
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {},
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    gridColumns: getColumns(1),
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            options: [
              // TODO: medicine change 按药品汇总
              { value: 1, label: $t('purchasePlan.buyPlan.totalType1') },
              { value: 2, label: $t('purchasePlan.buyPlan.totalType2') },
            ],
            placeholder: `请选择${$t('purchasePlan.buyPlan.totalType')}`,
            paginate: false,
            filterByFrontEnd: true,
            onChange(val: any) {
              totalType.value = val; // 更新查询维度值
            },
            immediate: true,
          };
        },
        fieldName: 'totalType',
        label: $t('purchasePlan.buyPlan.totalType'),
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: $t('purchasePlan.buyPlan.dateOrdered1'),
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
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: `请选择${$t('purchasePlan.buyPlan.warehouseName')}`,
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
        fieldName: 'warehouseId',
        label: $t('purchasePlan.buyPlan.warehouseName'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.applyBPartnerName')}`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'applyBPartnerId',
        defaultValue: '',
        label: $t('purchasePlan.buyPlan.applyBPartnerName'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=1000369',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.sourceTypeName')}`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'sourceType',
        label: $t('purchasePlan.buyPlan.sourceTypeName'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=1000644',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.commitStatus')}`,
            paginate: false,
            filterByFrontEnd: true,
            onChange() {},
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'commitStatus',
        label: $t('purchasePlan.buyPlan.commitStatus'),
      },
      {
        component: 'Input',
        fieldName: 'orderPlanNo',
        label: $t('purchasePlan.buyPlan.orderPlanNo'),
        componentProps: {
          placeholder: `请输入${$t('purchasePlan.buyPlan.orderPlanNo')}`,
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: $t('purchasePlan.buyPlan.productName'),
        componentProps: {
          placeholder: `请输入${$t('purchasePlan.buyPlan.productName')}`,
        },
      },
      {
        component: 'Input',
        fieldName: 'insurance',
        label: $t('purchasePlan.buyPlan.insurance'),
        componentProps: {
          placeholder: `请输入${$t('purchasePlan.buyPlan.insurance')}`,
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.vendorId')}`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'vendorId',
        label: $t('purchasePlan.buyPlan.vendorId'),
      },
      // TODO:medicine delete 高值
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       defaultValue: '',
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: `请选择${$t('purchasePlan.buyPlan.isPrecious')}`,
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       immediate: true,
      //     };
      //   },
      //   fieldName: 'isPrecious',
      //   label: $t('purchasePlan.buyPlan.isPrecious'),
      // },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: `请选择${$t('purchasePlan.buyPlan.isGift')}`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isGift',
        label: $t('purchasePlan.buyPlan.isGift'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: `请选择${$t('purchasePlan.buyPlan.isCrossDocking')}`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isCrossDocking',
        label: $t('purchasePlan.buyPlan.isCrossDocking'),
      },
    ],
    dataTableId: '/orderPlanAction/totalDetail.do',
    id: 'summary',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      // totalAmount.value = params.totalPrice || 0;
      let amout = 0;
      params.rows?.forEach((item: any) => {
        if (item.totalOrderAmount) {
          amout += Number.parseFloat(item.totalOrderAmount);
        }
      });
      totalAmount.value = Number(amout.toFixed(2));
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '采购总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_summaryQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span>采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
