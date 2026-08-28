<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';

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

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);
// 表格查询的额外参数
const extParams = ref<{
  commitStatus?: string;
  page?: string;
  returnDoc?: string;
}>({ commitStatus: 'CO', returnDoc: 'N', page: 'input' });
const totalAmount = ref(0); // 采购总金额
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab的value值
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
      handleReset: async () => {
        await ChcGridApi.formApi.resetForm();
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
        autoLoad: false, // 表格初始化时自动查询数据
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orderPlanNo',
        minWidth: 120,
        sortable: true,
        title: $t('purchasePlan.buyPlan.orderPlanNo'),
        slots: { default: 'orderPlanNo' },
      },
      {
        field: 'commitTime',
        minWidth: 140,
        sortable: true,
        title: $t('purchasePlan.buyPlan.commitTime'),
      },
      {
        field: 'deliveryPlanDate',
        minWidth: 135,
        sortable: true,
        title: $t('purchasePlan.buyPlan.deliveryPlanDate'),
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: $t('purchasePlan.buyPlan.warehouseName'),
      },
      {
        field: 'applyBPartnerName',
        minWidth: 150,
        sortable: true,
        title: $t('purchasePlan.buyPlan.applyBPartnerName'),
      },
      {
        field: 'priorityRuleName',
        minWidth: 70,
        sortable: true,
        title: $t('purchasePlan.buyPlan.priorityRuleName'),
      },
      {
        field: 'totalAmt',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.totalAmt'),
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
      },
      {
        field: 'lineCount',
        minWidth: 120,
        sortable: true,
        title: $t('purchasePlan.buyPlan.lineCount'),
        align: 'right',
      },
      {
        field: 'totalCount',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.totalCount'),
        align: 'right',
      },
      {
        field: 'sourceTypeName',
        minWidth: 95,
        sortable: true,
        title: $t('purchasePlan.buyPlan.sourceTypeName'),
      },
      {
        field: 'createdByName',
        minWidth: 100,
        sortable: true,
        title: $t('purchasePlan.buyPlan.createdByName'),
      },
      {
        field: 'created',
        minWidth: 135,
        sortable: true,
        title: $t('purchasePlan.buyPlan.created'),
      },
      {
        field: 'commitUserName',
        minWidth: 100,
        sortable: true,
        title: $t('purchasePlan.buyPlan.commitUserName'),
      },
      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: $t('purchasePlan.buyPlan.description'),
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
    ],
    formSchema: [
      {
        // TODO: medicine change 计划提交时间
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
            dictUrl: '/baseHandleAction/refList.do?id=1000369',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.sourceTypeName')}`,
            paginate: false,
            defaultValue: '',
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
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.priorityRuleName')}`,
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
        fieldName: 'priorityRule',
        label: $t('purchasePlan.buyPlan.priorityRuleName'),
      },
      // TODO: medicine delete 高值
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
    dataTableId: '/orderPlanAction/queryByPlan',
    id: 'hasSub',
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      // totalAmount.value = params.totalPrice || 0;
      let amout = 0;
      params.rows?.forEach((item: any) => {
        if (item.totalAmt) {
          amout += Number.parseFloat(item.totalAmt);
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
// 点击采购计划单号
const handleOrderPlanClick = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '查看采购计划',
    sourcePage: props.thisTab.value,
    type: 'view',
  });
};
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #orderPlanNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`button_order_plan_no_${scope.rowIndex}_hasSubmited`"
        >
          {{ scope.row.orderPlanNo }}
        </a>
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_hasSubmited"
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
