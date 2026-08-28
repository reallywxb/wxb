<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { usePreferences } from '@vben/preferences';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import approveLogModal from './modals/approveLogModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');

const { contentIsMaximize } = usePreferences();
const [ApproveLogModal, approveLogModalApi] = useVbenModal({
  connectedComponent: approveLogModal,
});

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

const isFirstLoaded = ref(false);
const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  // isPrecious_text?: string;
  page?: string;
  returnDoc?: string;
}>({});
const totalQtyArrived = ref(0);
const totalLineAmt = ref(0);
const totalQtyChecked = ref(0);
const totalCheckPrice = ref(0);
const totalQtyRejected = ref(0);
const totalRejectPrice = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
        ['dateCommit', ['dateCheckFrom', 'dateCheckTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[100px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
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
        autoLoad: false,
      },
    }),
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 70, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'mAsnId',
        minWidth: 120,
        sortable: true,
        title: '配送单号',
        slots: { default: 'mAsnId' },
      },
      {
        field: 'inoutNo',
        minWidth: 90,
        sortable: true,
        title: '入库单号',
      },
      {
        field: 'bpartnerName',
        minWidth: 120,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: '采购仓库',
      },
      {
        field: 'applyBPartnerName',
        minWidth: 150,
        sortable: true,
        title: '需求仓库',
      },
      {
        field: 'receiptTypeName',
        minWidth: 100,
        sortable: true,
        title: '入库类型',
      },
      {
        field: 'qACheckStatusName',
        minWidth: 100,
        sortable: true,
        title: '处理状态',
      },
      {
        field: 'createdByName',
        minWidth: 100,
        sortable: true,
        title: '配送人',
      },
      {
        field: 'dateArrived',
        minWidth: 90,
        sortable: true,
        title: '配送时间',
      },
      {
        field: 'qtyArrived',
        minWidth: 90,
        sortable: true,
        title: '配送数量',
        align: 'right',
      },
      {
        field: 'lineAmt',
        minWidth: 90,
        sortable: true,
        title: '配送金额',
        align: 'right',
      },
      {
        field: 'qtyChecked',
        minWidth: 120,
        sortable: true,
        title: '验收合格数量',
        align: 'right',
      },
      {
        field: 'checkPrice',
        minWidth: 120,
        sortable: true,
        title: '验收合格金额',
        align: 'right',
      },
      {
        field: 'qtyRejected',
        minWidth: 90,
        sortable: true,
        title: '拒收数量',
        align: 'right',
      },
      {
        field: 'rejectPrice',
        minWidth: 90,
        sortable: true,
        title: '拒收金额',
        align: 'right',
      },
      {
        field: 'checkerName',
        minWidth: 100,
        sortable: true,
        title: '验收人',
      },
      {
        field: 'checkTime',
        minWidth: 135,
        sortable: true,
        title: '验收时间',
      },
      {
        field: 'invoiceMethodName',
        minWidth: 100,
        sortable: true,
        title: '开票方式',
        // "hidden": (page=='input'),
      },
      {
        field: 'taxInvoiceNo',
        minWidth: 100,
        sortable: true,
        title: '开票号',
        // "hidden": (page=='input'),
      },
      {
        field: 'isCrossDocking',
        minWidth: 90,
        sortable: true,
        title: '是否直供',
        formatter({ row }: any) {
          return row.isCrossDocking === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'remarks',
        minWidth: 150,
        sortable: true,
        title: '验收备注',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 150,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '配送时间',
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
        label: '验收时间',
        defaultValue: [
          isFromTraceSearchPage.value
            ? null
            : dayjs(dayjs().format('YYYY-MM-DD'))
                .subtract(7, 'day')
                .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: !isFromTraceSearchPage.value,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: '请选择采购仓库',
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
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择需求仓库',
            paginate: false,
            // allowClear: true,
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
        fieldName: 'applyBPartnerId',
        label: '需求仓库',
      },
      {
        component: 'Input',
        fieldName: 'inoutIdAndmAsnId',
        label: '配送/入库单号',
        defaultValue: isFromTraceSearchPage.value
          ? route.query.inoutIdAndmAsnId
          : null,
        componentProps: {
          placeholder: '请输入配送单号/入库单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
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
        fieldName: 'bpartnerId',
        label: '供应商',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择高值',
            paginate: false,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPrecious',
        label: '高值',
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       autoChooseFirstOption: true,
      //       dictUrl: '/baseHandleAction/refList.do?id=1000567',
      // apiType: 'post',
      // requestContentType: 'application/x-www-form-urlencoded',
      //       showSearch: true,
      //       placeholder: '请选择验收状态',
      //       paginate: false,
      //       // allowClear: true,
      //       filterByFrontEnd: true,
      //       // mode: 'multiple',
      //       showChooseAll: '',
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   fieldName: 'asnStatus', // 商品分类
      //   label: '验收状态',
      // },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000480',
            defaultValue: '',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择开票方式',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
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
        fieldName: 'invoiceMethod',
        label: '开票方式',
      },
      {
        component: 'Input',
        fieldName: 'invoiceNo',
        label: '发票号',
        componentProps: {
          placeholder: '请输入发票号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择是否开票',
            paginate: false,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isInvoice',
        label: '是否开票',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '带量采购' },
              { value: 'N', label: '非带量采购' },
            ],
            placeholder: '请选择带量采购',
            paginate: false,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isBulkPurchase',
        label: '带量采购',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '跟台配送' },
              { value: 'N', label: '非跟台配送' },
            ],
            placeholder: '请选择跟台配送',
            paginate: false,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isSurgery',
        label: '是否跟台配送',
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
            placeholder: `请选择是否直供`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isCrossDocking',
        label: '是否直供',
      },
    ],
    // showExportBtn: true,
    dataTableId:
      '/asnAction/query.do?asnType=PO&receiptType=1&qACheckStatus=PC&isGt=N',
    id: 'checkHas',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      const totalObj: any = {
        qtyArrived: 0,
        lineAmt: 0,
        qtyChecked: 0,
        checkPrice: 0,
        qtyRejected: 0,
        rejectPrice: 0,
      };
      const keys = [
        'qtyArrived',
        'lineAmt',
        'qtyChecked',
        'checkPrice',
        'qtyRejected',
        'rejectPrice',
      ];
      params.rows?.forEach((item: any) => {
        keys.forEach((key) => {
          if (item[key]) {
            totalObj[key] += Number.parseFloat(item[key]);
          }
        });
      });
      totalQtyArrived.value = Number(totalObj.qtyArrived);
      totalLineAmt.value = Number(totalObj.lineAmt.toFixed(2));
      totalQtyChecked.value = Number(totalObj.qtyChecked);
      totalCheckPrice.value = Number(totalObj.checkPrice.toFixed(2));
      totalQtyRejected.value = Number(totalObj.qtyRejected);
      totalRejectPrice.value = Number(totalObj.rejectPrice.toFixed(2));
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      console.warn('afterFetchFn:', params.totalPrice);
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
const handleOrderPlanClick = (scope: any) => {
  console.warn('点击采购计划单号:', scope.row, selectController);
  // 这里可以添加跳转到单据明细的逻辑
  // 类似 waitToSubmit.vue 中的编辑功能
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '查看验收入库单',
    sourcePage: props.thisTab.value,
    type: 'view',
  };
};
const handleDetail = (scope: any) => {
  console.warn('scope', scope);
  approveLogModalApi!
    .setData({
      processId: scope.row?.wfProcessId,
      orderPlanId: scope.row?.orderPlanId,
      asnId: scope.row?.asnId,
    })
    .open();
};

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '配送数量',
      value: totalQtyArrived.value,
      noUnit: true,
    },
    {
      label: '配送金额',
      value: totalLineAmt.value,
    },
    {
      label: '验收合格数量',
      value: totalQtyChecked.value,
      noUnit: true,
    },
    {
      label: '验收合格金额',
      value: totalCheckPrice.value,
    },
    {
      label: '拒收数量',
      value: totalQtyRejected.value,
      noUnit: true,
    },
    {
      label: '拒收金额',
      value: totalRejectPrice.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

watch(
  () => currentTab.value,
  async (val: number | string) => {
    if (val === props.thisTab.value) {
      await nextTick();
      ChcGridApi?.formApi?.getValues()?.then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
  { immediate: true },
);
</script>
<template>
  <div
    :style="{
      height: contentIsMaximize ? 'calc(100vh - 38px)' : 'calc(100vh - 158px)',
      overflowY: 'hidden',
    }"
  >
    <ApproveLogModal />
    <ChcGrid>
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleView" class="mr-[0.5rem]">
          查看
        </Button> -->
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_hasCheck"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>

      <template #mAsnId="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`link_mAsnId_${scope.rowIndex}_hasCheck`"
        >
          {{ scope.row.asnNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <!-- <span>配送数量：{{ totalQtyArrived }}元</span>
        <span style="margin-left: 8px">配送金额：{{ totalLineAmt }}元</span>
        <span style="margin-left: 8px">
          验收合格数量：{{ totalQtyChecked }}元
        </span>
        <span style="margin-left: 8px">
          验收合格金额：{{ totalCheckPrice }}元
        </span>
        <span style="margin-left: 8px">拒收数量：{{ totalQtyRejected }}元</span>
        <span style="margin-left: 8px">拒收金额：{{ totalRejectPrice }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #action="scope">
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          :data-testid="`button_acceptance_record_${scope.rowIndex}_hasCheck`"
        >
          验收记录
        </Button>
        <!-- <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
        >
          打印
        </Button> -->
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
