<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { EditActionIcon, ExportActionIcon } from '@vben/chc-icons';
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
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { addFormOptions } from './addFormOptions';
import approveLogModal from './modals/approveLogModal.vue';
import FormModal from './modals/FormModal.vue';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();
const urlParams = route.meta?.urlParams || {};

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
// 用于控制表格的查询在所有select下拉框查询完并赋值后触发
const selectController = new LazySelect(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});
const extParams = ref<{
  // commitStatus?: string;
  // page?: string;
  // returnDoc?: string;
}>({
  // commitStatus: 'WC',
  // returnDoc: 'N',
  // page: 'input',
  // warehouseId,
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const isFirstLoaded = ref(false);
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
          // ['dateCommit', ['commitFrom', 'commitTo'], 'YYYY-MM-DD'],
        ],
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        handleSubmit: async (values) => {
          console.warn('values', values);
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          ChcGridApi.reload(formValues);
          // ChcGridApi.formApi.getValues().then((res: any) => {
          //   console.log('getValues', res);
          //   ChcGridApi.query({ ...res });
          // });
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
      // 添加表格事件监听
      gridEvents: {
        // // 单个复选框变化事件
        // checkboxChange: ({ records }: { records: any[] }) => {
        //   calculateSelectedAmount(records);
        // },
        // // 全选/全不选事件
        // checkboxAll: ({ records }: { records: any[] }) => {
        //   calculateSelectedAmount(records);
        // },
      },
    },
    {
      gridColumns: [
        // {
        //   title: '多选',
        //   type: 'checkbox',
        //   width: 50,
        //   align: 'center',
        // },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'mAsnId',
          minWidth: 120,
          sortable: true,
          title: '配送单号',
          slots: { default: 'mAsnId' },
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'qACheckStatusName',
          minWidth: 100,
          sortable: true,
          title: '处理状态',
        },
        {
          field: 'bpartnerName',
          minWidth: 120,
          sortable: true,
          title: '供应商',
        },
        {
          field: 'warehouseName',
          minWidth: 160,
          sortable: true,
          title: '采购仓库',
        },
        {
          field: 'applyBPartnerName',
          minWidth: 160,
          sortable: true,
          title: '需求仓库',
        },
        {
          field: 'lineCount',
          minWidth: 120,
          sortable: true,
          title: '配送品种数量',
          align: 'right',
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

          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.lineAmt);
          },
          align: 'right',
        },
        {
          field: 'createdByName',
          minWidth: 100,
          sortable: true,
          title: '配送人',
        },
        {
          field: 'dateArrived',
          minWidth: 100,
          sortable: true,
          title: '配送时间',
        },
        {
          field: 'invoiceMethodName',
          minWidth: 100,
          sortable: true,
          title: '开票方式',
        },
        {
          field: 'taxInvoiceNo',
          minWidth: 100,
          sortable: true,
          title: '发票号',
        },
        {
          field: 'isSurgery',
          minWidth: 150,
          sortable: true,
          title: '是否跟台配送',
          formatter: (params: any) => {
            return params.row.isSurgery === 'Y' ? '是' : '否';
          },
          visible: false, //  TODO:medicine cancel 是否跟台配送
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
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: '操作',
          width: 220,
        },
      ],
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'dateOrdered',
          label: '配送时间',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(7, 'day')
              .format('YYYY-MM-DD'),
          ],
          formItemClass: 'col-span-1',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
              // showSearch: true,
              placeholder: '请选择采购仓库',
              onChange(val: any, option: any) {
                console.warn('warehouseId', val, option);
                selectController.sign();
              },
              paginate: false,
              showChooseAll: '',
              immediate: true,
              // defaultValue: '',
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
              dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择需求仓库',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              // mode: 'multiple',
              defaultValue: '',
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
              dictUrl: '/baseHandleAction/vendor.do',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择供应商',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              // onChange(val: any, option: any) {
              //   extParams.value.bpartnerId_text = option.name;
              // },
              // mode: 'multiple',
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
          fieldName: 'asnNo',
          label: '配送单号',
          componentProps: {
            placeholder: '请输入配送单号',
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=154',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择优先级',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
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
          fieldName: 'priorityRule',
          label: '优先级',
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
        // {
        //   component: 'ChcSelect',
        //   componentProps: () => {
        //     return {
        //       // autoChooseFirstOption: true,
        //       dictUrl: '/baseHandleAction/refList.do?id=1000649',
        // apiType: 'post',
        // requestContentType: 'application/x-www-form-urlencoded',
        //       showSearch: true,
        //       placeholder: '请选择处理状态',
        //       paginate: false,
        //       // allowClear: true,
        //       filterByFrontEnd: true,
        //       showChooseAll: '',
        //       defaultValue: '',
        //       immediate: true,
        //       labelField: 'name',
        //       valueField: 'id',
        //       afterFetch(res: any) {
        //         return { ...res, rows: undefined, records: res.rows };
        //       },
        //     };
        //   },
        //   fieldName: 'qACheckStatus',
        //   label: '处理状态',
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
      dataTableId:
        '/asnAction/query.do?asnType=PO&receiptType=1&page=check&qACheckStatus=WC&isGt=N',
      id: 'checkHandle',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      afterFetchFn: (params) => {
        // totalAmount.value = params.totalPrice || 0;
        let amout = 0;
        params.rows?.forEach((item: any) => {
          if (item.lineAmt) {
            amout += Number.parseFloat(item.lineAmt);
          }
        });
        totalAmount.value = Number(amout.toFixed(2));
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

// const handleAddNew = () => {
//   parentData.value = {};
//   currentTab.value = headerTabs.value.length - 1;
//   detailInfo.value = {
//     detailTitle: '新建手验收库单',
//     sourcePage: props.thisTab.value,
//     type: 'edit',
//     typeAction: 'add',
//   };
// };

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '配送金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

const handleEdit = (scope: any) => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '编辑验收入库单',
    sourcePage: props.thisTab.value,
    type: 'edit',
    typeAction: 'edit',
  };
};
const handleImport = () => {
  importModalApi?.open();
};

const handleOrderPlanClick = (scope: any) => {
  console.warn('点击采购计划单号:', scope.row);
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
const handleReject = (scope: any) => {
  console.warn('handleReject:', scope.row);
  modalApi
    .setData({
      dataTableId: '/asnAction/rejectAsn.do',
      formData: {
        asnId: JSON.stringify(scope.row.asnId),
        // packageNo: JSON.stringify(scope.row.packageNo),
      },
      openType: 'close',
    })
    .open();
};

// 作废处理函数
const handleAppLog = (scope: any) => {
  approveLogModalApi!
    .setData({
      processId: scope.row?.wfProcessId,
      orderPlanId: scope.row?.orderPlanId,
      asnId: scope.row?.asnId,
    })
    .open();
};
watch(
  () => currentTab.value,
  (val: number | string) => {
    if (val === props.thisTab.value) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);

const [OrgFormModal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: FormModal,
});
const [ApproveLogModal, approveLogModalApi] = useVbenModal({
  connectedComponent: approveLogModal,
});

async function refreshTable() {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    ChcGridApi.query({ ...resData });
  });
}

onMounted(() => {
  console.warn('urlParams:', urlParams, handleImport);
});
</script>
<template>
  <div class="h-full">
    <ImportModal />
    <ApproveLogModal />
    <OrgFormModal
      :after-submit="refreshTable"
      :add-form-options="addFormOptions"
    />
    <ChcGrid>
      <template #mAsnId="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`link_asn_id_${scope.rowIndex}_handleCheck`"
        >
          {{ scope.row.asnNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">配送金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleAddNew" class="mr-[0.5rem]">
          新 建
          <template #icon>
            <AddActionIcon />
          </template>
        </Button> -->
        <!-- <Button type="primary" @click="handleApprove" class="mr-[0.5rem]">
          提 交
        </Button> -->
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_handleCheck"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          style="color: #f5317a; border-color: #f5317a"
          ghost
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleAppLog(scope)"
          :data-testid="`button_app_log_${scope.rowIndex}_handleCheck`"
        >
          验收记录
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope)"
          :data-testid="`button_edit_${scope.rowIndex}_handleCheck`"
        >
          验 收
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleReject(scope)"
          :data-testid="`button_reject_${scope.rowIndex}_handleCheck`"
        >
          拒收
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
