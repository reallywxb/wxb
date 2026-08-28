<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, viewActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

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

import actionLogModal from './modals/actionLogModal.vue';

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
const route = useRoute();
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});
// 定义操作记录弹窗
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

onMounted(async () => {
  // 如果从追溯查询页面调过来需要默认查询一次
  if (isFromTraceSearchPage.value) {
    await nextTick();
    ChcGridApi.formApi.getValues().then((res: any) => {
      ChcGridApi.query(res);
    });
  }
});
// 表格查询的额外参数
const extParams = ref<{
  page?: string;
  returnDoc?: string;
}>({
  returnDoc: 'N',
  page: 'input',
});
const totalAmount = ref(0); // 采购总金额
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab的value值
const isFirstLoaded = ref(false); // 是否已初次加载完
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ['dateCommit', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
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
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'commitStatusName',
        minWidth: 90,
        sortable: false,
        title: $t('purchasePlan.buyPlan.commitStatusName'),
      },
      {
        field: 'orderPlanNo',
        minWidth: 120,
        sortable: true,
        title: $t('purchasePlan.buyPlan.orderPlanNo'),
        slots: { default: 'orderPlanNo' },
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: $t('purchasePlan.buyPlan.productCode'),
      },
      {
        field: 'productName',
        minWidth: 100,
        sortable: true,
        title: $t('purchasePlan.buyPlan.productName1'),
      },
      {
        field: 'productSpec',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.productSpec'),
      },
      // {
      //   field: 'modelNo',
      //   minWidth: 90,
      //   sortable: true,
      //   title: $t('purchasePlan.buyPlan.modelNo'),
      // },
      {
        field: 'uomName',
        minWidth: 60,
        sortable: true,
        title: $t('purchasePlan.buyPlan.uomName'),
      },
      // TODO:medicine add 最小单位
      {
        field: 'minUomName',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.minUomName'),
      },
      {
        field: 'qtyPlaned',
        minWidth: 100,
        sortable: true,
        title: $t('purchasePlan.buyPlan.qtyPlaned'),
        align: 'right',
      },
      {
        field: 'price',
        minWidth: 100,
        sortable: true,
        title: $t('purchasePlan.buyPlan.price'),
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
      },
      {
        field: 'lineAmt',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.totalAmt'),
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
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
        field: 'vendorName',
        minWidth: 100,
        sortable: true,
        title: $t('purchasePlan.buyPlan.bpartnerId'),
      },
      {
        field: 'isGift',
        minWidth: 90,
        sortable: true,
        title: `是否${$t('purchasePlan.buyPlan.isGift')}`,
        formatter: (row: any) => {
          return row.isGift === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'manufacturer',
        minWidth: 110,
        sortable: true,
        title: $t('purchasePlan.buyPlan.manufacturer'),
      },
      {
        field: 'lPackageQty',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.lPackageQty'),
        align: 'right',
      },
      {
        field: 'mPackageQty',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.mPackageQty'),
        align: 'right',
      },
      {
        field: 'insurance',
        minWidth: 120,
        sortable: true,
        title: $t('purchasePlan.buyPlan.insurance'),
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
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: $t('purchasePlan.buyPlan.dateOrdered'),
        defaultValue: [
          isFromTraceSearchPage.value
            ? null
            : dayjs(dayjs().format('YYYY-MM-DD'))
                .subtract(7, 'day')
                .format('YYYY-MM-DD'),
        ],
      },

      {
        component: 'DateGroup',
        fieldName: 'dateCommit',
        label: $t('purchasePlan.buyPlan.dateCommit'),
        defaultValue: [
          isFromTraceSearchPage.value
            ? null
            : dayjs(dayjs().format('YYYY-MM-DD'))
                .subtract(7, 'day')
                .format('YYYY-MM-DD'),
        ],
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: !isFromTraceSearchPage.value,
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
        defaultValue: '',
        fieldName: 'applyBPartnerId',
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
            filterByFrontEnd: true,
            showChooseAll: '',
            defaultValue: '',
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
            placeholder: `请选择${$t('purchasePlan.buyPlan.commitStatusName')}`,
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
        fieldName: 'commitStatus',
        label: $t('purchasePlan.buyPlan.commitStatusName'),
      },
      {
        component: 'Input',
        fieldName: 'orderPlanNo',
        label: $t('purchasePlan.buyPlan.orderPlanNo'),
        defaultValue: isFromTraceSearchPage.value
          ? route?.query?.orderPlanNo
          : null,
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
      // TODO:medcine delete 高值
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: `请选择${$t('purchasePlan.buyPlan.isPrecious')}`,
      //       defaultValue: '',
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
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'vendorId',
        label: $t('purchasePlan.buyPlan.vendorId'),
      },
      // TODO:medcine delete 赠品
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: '请选择赠品',
      //       defaultValue: '',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       immediate: true,
      //     };
      //   },
      //   fieldName: 'isGift',
      //   label: '赠品',
      // },
      // TODO:medcine delete 活跃状态
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       defaultValue: '',
      //       dictUrl: '/baseHandleAction/refList.do?id=319',
      //       apiType: 'post',
      //       requestContentType: 'application/x-www-form-urlencoded',
      //       showSearch: true,
      //       placeholder: '请选择活跃状态',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   fieldName: 'isActive',
      //   label: '活跃状态',
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
    dataTableId:
      '/orderPlanAction/queryLine.do?isFree=N&isSurgery=N&showOrder=Y',
    id: 'detail',
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    // 用于获取 totalAmount
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
// 查看操作记录
const handleDetail = (scope: any) => {
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
    })
    .open();
};
// 点击计划单号
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
    <ActionLogModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_detailQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #orderPlanNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`button_order_plan_no_${scope.rowIndex}_detailQuery`"
        >
          {{ scope.row.orderPlanNo }}
        </a>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          :data-testid="`button_action_log_${scope.rowIndex}_detailQuery`"
        >
          操作记录
          <template #icon>
            <viewActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
