<script setup lang="ts">
import { nextTick, ref, toRaw, watch } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import actionLogModal from './modals/actionLogModal.vue';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

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
// actionLogModalApi
const [ActionLogModal] = useVbenModal({
  connectedComponent: actionLogModal,
});

const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query(res);
    isFirstLoaded.value = true;
  });
});

const extParams = ref<{
  orderType: string;
  page?: string;
  returnDoc?: string;
}>({
  returnDoc: 'N',
  orderType: 'PO',
  page: 'query',
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });

const isFirstLoaded = ref(false);
const [ChcGrid, ChcGridApi, { handleExport, ImportModal }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['createdFrom', 'createdTo'], 'YYYY-MM-DD'],
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
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
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
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'asnId',
        minWidth: 120,
        sortable: true,
        title: '配送单号',
        slots: { default: 'asnId' },
      },
      {
        field: 'mInoutId',
        minWidth: 120,
        sortable: true,
        title: '入库单号',
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'productName',
        minWidth: 100,
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
        field: 'qtyArrived',
        minWidth: 100,
        sortable: true,
        title: '入库数量',
        align: 'right',
      },
      {
        field: 'priceActual',
        minWidth: 100,
        sortable: true,
        title: '入库单价',
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 90,
        sortable: true,
        title: '批号',
      },
      {
        field: 'guaranteeDate',
        minWidth: 120,
        sortable: true,
        title: '效期',
      },
      {
        field: 'serNo',
        minWidth: 120,
        sortable: true,
        title: '序列号',
      },
      {
        field: 'taxInvoiceNo',
        minWidth: 120,
        sortable: true,
        title: '发票号',
      },
      {
        field: 'taxInvoiceDate',
        minWidth: 120,
        sortable: true,
        title: '发票日期',
      },
      {
        field: 'lineAmt',
        minWidth: 90,
        sortable: true,
        title: '金额',
        align: 'right',
      },
      {
        field: 'manufacturer',
        minWidth: 110,
        sortable: true,
        title: '生产厂家',
      },
      {
        field: 'lPackageQty',
        minWidth: 110,
        sortable: true,
        title: '大包装数',
        align: 'right',
      },
      {
        field: 'mPackageQty',
        minWidth: 110,
        sortable: true,
        title: '中包装数',
        align: 'right',
      },
      {
        field: 'qtyOnhand',
        minWidth: 180,
        sortable: true,
        title: '需求库房库存数量',
        align: 'right',
      },
      {
        field: 'insurance',
        minWidth: 120,
        sortable: true,
        title: '医保药品编码',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '创建时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
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
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择采购仓库',
            onChange() {
              searchController.sign();
            },
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
        label: '采购仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择需求仓库',
            paginate: false,
            filterByFrontEnd: true,
            onChange() {
              searchController.sign();
            },
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
        label: '需求仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=131',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择单据状态',
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
        fieldName: 'docStatus',
        label: '单据状态',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000650',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择入库类型',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.vendorId_text2 = option.name;
            // },
            // mode: 'multiple',
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
        fieldName: 'receiptType', // 暂无字段
        label: '入库类型',
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
        component: 'Input',
        fieldName: 'insurance', // 暂无字段
        label: '医保药品编码',
        componentProps: {
          placeholder: '请输入医保药品编码',
        },
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
            placeholder: '请选择高值',
            defaultValue: '',
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
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
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
        fieldName: 'bpartnerId',
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'taxInvoiceNo',
        label: '发票号',
        componentProps: {
          placeholder: '请输入发票号',
        },
      },
      {
        component: 'Input',
        fieldName: 'mInoutId',
        label: '入库单号',
        componentProps: {
          placeholder: '请输入入库单号',
        },
      },
    ],
    dataTableId: '/asnAction/queryDetail.do',
    id: 'manualInfoDetailQuery',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmount.value = params.totalPrice || 0;
      console.warn('afterFetchFn:', params.totalPrice);
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
    },
  },
);

// const handleDetail = (scope: any) => {
//   // importModalApi?.open();
//   // console.warn(importModalApi);
//   // console.warn('scope', scope);
//   actionLogModalApi!
//     .setData({
//       warehouseId: scope.row?.warehouseId,
//       orderPlanLineId: scope.row?.orderPlanLineId,
//     })
//     .open();
// };

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

const handleOrderPlanClick = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '查看手工入库单',
    sourcePage: props.thisTab.value,
    type: 'view',
  });
};
// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: number, oldVal: number) => {
    const detailPageConfig = props.getDetailPageConfig();
    if (
      val === props.thisTab.value &&
      (oldVal !== detailPageConfig.detailPageValue ||
        (oldVal === detailPageConfig.detailPageValue &&
          detailPageConfig.detailPageType !== 'view'))
    ) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <ImportModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button type="primary" @click="handleExport" class="mr-[0.5rem]">
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #asnId="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
        >
          {{ scope.row.asnId }}
        </a>
      </template>
      <!-- <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
        >
          操作记录
        </Button>
      </template> -->
    </ChcGrid>
  </div>
</template>
<style scoped></style>
