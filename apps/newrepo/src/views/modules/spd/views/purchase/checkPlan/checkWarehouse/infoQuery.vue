<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
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
import { deepMerge } from '#/utils/util';

import actionLogModal from './modals/actionLogModal.vue';
import ImportModalComp from './modals/importModal.vue';
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
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
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
const selectController = new LazySelect(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query(res);
    isFirstLoaded.value = true;
  });
});

const extParams = ref<{
  asnType?: string;
  orderType?: string;
  // isGift_text?: string;
  // isPrecious_text?: string;
  page?: string;
  returnDoc?: string;
}>({
  // docStatus: "'DR','NA'",
  returnDoc: 'N',
  page: 'query',
  orderType: 'PO',
  asnType: 'PO',
});
const arrivedPrice = ref(0);
const checkPrice = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const isFirstLoaded = ref(false);
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
          ['dateCommit', ['dateCheckFrom', 'dateCheckTo'], 'YYYY-MM-DD'],
        ],
        commonConfig: {
          labelClass: 'w-[90px]',
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
          field: 'mAsnId',
          minWidth: 120,
          sortable: true,
          title: '配送单号',
          slots: { default: 'mAsnId' },
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'inoutNo',
          minWidth: 90,
          sortable: false,
          title: '入库单号',
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'productCode',
          minWidth: 120,
          sortable: true,
          title: '药品编码',
        },
        {
          field: 'productName',
          minWidth: 130,
          sortable: true,
          title: '药品名称',
        },
        {
          field: 'productSpec',
          minWidth: 90,
          sortable: true,
          title: '规格', // 暂无
        },
        {
          field: 'modelNo',
          minWidth: 90,
          sortable: true,
          title: '型号', // 暂无
          visible: false,
        },
        {
          field: 'lot',
          minWidth: 90,
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
          field: 'serNo',
          minWidth: 120,
          sortable: true,
          title: '序列号',
          visible: false, // TODO:medicine cancel 序列号
        },
        {
          field: 'uomName',
          minWidth: 60,
          sortable: true,
          title: '单位',
        },
        {
          field: 'qtyArrived',
          minWidth: 90,
          sortable: true,
          title: '配送数量',
          align: 'right',
        },
        {
          field: 'qtyReceived',
          minWidth: 120,
          sortable: true,
          title: '验收合格数量',
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
          field: 'rejectReason',
          minWidth: 120,
          sortable: true,
          title: '拒收原因',
        },
        {
          field: 'priceActual',
          minWidth: 90,
          sortable: true,
          title: '入库单价',
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
          field: 'certificateNo',
          minWidth: 120,
          sortable: true,
          title: '批准文号',
        },
        {
          field: 'certValidTo',
          minWidth: 120,
          sortable: true,
          title: '注册有效期',
        },
        {
          field: 'manufacturer',
          minWidth: 110,
          sortable: true,
          title: '生产厂家',
        },
        {
          field: 'insurance',
          minWidth: 120,
          sortable: true,
          title: '医保药品编码',
        },
        {
          field: 'productionDate',
          minWidth: 100,
          sortable: true,
          title: '生产日期',
        },
        {
          field: 'disinfectLot',
          minWidth: 110,
          sortable: true,
          title: '灭菌批号',
          visible: false, // TODO:medicine cancel 灭菌批号
        },
        {
          field: 'checkerName',
          minWidth: 150,
          sortable: true,
          title: '验收人',
          formatter({ row }: any) {
            return row.checkerName
              ? `${row.checkerName},${row.checkerName2}`
              : row.checkerName;
          },
        },
        {
          field: 'checkTime',
          minWidth: 140,
          sortable: true,
          title: '验收时间',
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
          field: 'isCrossDocking',
          minWidth: 90,
          sortable: true,
          title: '是否直供',
          formatter({ row }: any) {
            return row.isCrossDocking === 'Y' ? '是' : '否';
          },
        },
        // {
        //   align: 'center',
        //   field: 'action',
        //   slots: { default: 'action' },
        //   fixed: 'right',
        //   headerAlign: 'center',
        //   showOverflow: false,
        //   title: '操作',
        //   width: 100,
        // },
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
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              autoChooseFirstOption: !isFromTraceSearchPage.value,
              dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
              // showSearch: true,
              placeholder: '请选择采购仓库',
              onChange(val: any, option: any) {
                console.warn('warehouseId', val, option);
                selectController.sign();
                // extParams.value.warehouseId_text = option.name;
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
              dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择需求仓库',
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
          fieldName: 'applyBPartnerId',
          label: '需求仓库',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              defaultValue: '',
              dictUrl: '/baseHandleAction/refList.do?id=1000649',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择处理状态',
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
          fieldName: 'qACheckStatus',
          label: '处理状态',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000325',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择验收状态',
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
          fieldName: 'lineStatus',
          label: '验收状态',
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
          fieldName: 'insurance',
          label: '医保药品编码',
          componentProps: {
            placeholder: '请输入药品医保编码',
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,1000480
              dictUrl: '/baseHandleAction/refList.do?id=1000480',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择开票方式',
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
          component: 'Input',
          fieldName: 'asnNo',
          label: '配送单号',
          defaultValue: isFromTraceSearchPage.value
            ? route?.query?.asnId
            : null,
          componentProps: {
            placeholder: '请输入配送单号',
          },
        },
        {
          component: 'Input',
          fieldName: 'lotAndserNo',
          label: '批号/序列号',
          componentProps: {
            placeholder: '请输入批号/序列号',
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
      dataTableId: '/asnAction/queryDetail.do?specShowType=from',
      id: 'checkInfoQuery',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      afterFetchFn: (params) => {
        arrivedPrice.value = params.arrivedPrice || 0;
        checkPrice.value = params.checkPrice || 0;
        let arrivedAmout = 0;
        let checkAmout = 0;
        params.rows?.forEach((item: any) => {
          if (item.lineAmt) {
            arrivedAmout += Number.parseFloat(item.lineAmt);
          }
          if (item.checkPrice) {
            checkAmout += Number.parseFloat(item.checkPrice);
          }
        });
        arrivedPrice.value = Number(arrivedAmout.toFixed(2));
        checkPrice.value = Number(checkAmout.toFixed(2));
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
// const handleBatchChoose = async (records: any[]) => {
//   const formValue = await ChcGridApi.formApi.getValues();
//   let newRow = null;
//   for (const [i, record__] of records.entries()) {
//     const response = await getOrderPlanStorage({
//       warehouseId: formValue.warehouseId,
//       productId: record__.productId,
//     });
//     const record = {
//       userId: userStore.userInfo?.userId,
//       ...record__,
//       ...response,
//     };
//     if (i === 0) {
//       const midRow = await ChcGridApi.grid.insertAt(record, -1);
//       newRow = midRow.row;
//     } else {
//       await ChcGridApi.grid.insertAt(record, -1);
//     }
//   }
//   ChcGridApi.grid.setEditRow(newRow, 'packagePlaned');
// };

const handleDetail = (scope: any) => {
  // importModalApi?.open();
  console.warn(importModalApi);
  console.warn('scope', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      // replenishSource: 'P',
      // handleBatchChoose,
    })
    .open();
};
const handleOrderPlanClick = (scope: any) => {
  console.warn('handleDetail:', handleDetail);
  console.warn('点击单号:', scope.row);
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

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '配送金额',
      value: arrivedPrice.value,
    },
    {
      label: '验收金额',
      value: checkPrice.value,
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
  <div class="h-full">
    <ActionLogModal />
    <ImportModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_infoQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">配送金额：{{ arrivedPrice }}元</span>
        <span style="margin-left: 20px">验收金额：{{ checkPrice }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #mAsnId="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`link_asnId_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.asnNo }}
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
