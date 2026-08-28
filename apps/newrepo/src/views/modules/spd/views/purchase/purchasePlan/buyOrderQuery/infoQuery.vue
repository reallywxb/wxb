<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
// import { usePreferences } from '@vben/preferences';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import { addFormOptions } from './addFormOptions';
import { urgeOrderDo } from './api';
import ImportModalComp from './importModal.vue';
import FormModal from './modals/FormModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
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
const [OrgFormModal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: FormModal,
});

const extParams = ref<{
  // docStatus?: string;
  // page?: string;
  // returnDoc?: string;
}>({
  // docStatus: "'DR','NA'",
  // returnDoc: 'N',
  // page: 'input',
});
const selectedAmount = ref(0);
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });

onMounted(async () => {
  // 如果从追溯查询页面调过来需要默认查询一次
  if (isFromTraceSearchPage.value) {
    await nextTick();
    ChcGridApi.formApi.getValues().then((res: any) => {
      ChcGridApi.query({ ...res });
    });
  }
});
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
          ['dateApprove', ['dateApprovalFrom', 'dateApprovalTo'], 'YYYY-MM-DD'],
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
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          ChcGridApi.reload(formValues);
          // ChcGridApi.formApi.getValues().then((res: any) => {
          //   console.log('getValues', res);
          //   ChcGridApi.query({ ...res });
          // });
        },
        handleReset: async () => {
          await ChcGridApi.formApi.resetForm();
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(formValues);
          ChcGridApi.reload(formValues);
        },
      }),
      // formOptions: {
      //   fieldMappingTime: [
      //     ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
      //     ['dateApprove', ['dateApprovalFrom', 'dateApprovalTo'], 'YYYY-MM-DD'],
      //   ],
      //   compact: true,
      //   layout: 'horizontal',
      //   submitButtonOptions: {
      //     content: '查询',
      //   },
      // },
      // gridOptions: {
      //   checkboxConfig: {
      //     highlight: true,
      //   },
      //   proxyConfig: {
      //     autoLoad: true,
      //   },
      // },
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
        // 单个复选框变化事件
        checkboxChange: ({ records }: { records: any[] }) => {
          calculateSelectedAmount(records);
        },
        // 全选/全不选事件
        checkboxAll: ({ records }: { records: any[] }) => {
          calculateSelectedAmount(records);
        },
      },
    },
    {
      gridColumns: [
        { type: 'checkbox', title: '多选', width: 50, align: 'center' },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'orderPlanNo',
          minWidth: 120,
          sortable: true,
          title: '采购计划单号',
          slots: { default: 'orderPlanNo' },
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'orderNo',
          minWidth: 120,
          sortable: true,
          title: '采购订单单号',
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'planApproveTime',
          minWidth: 170,
          sortable: true,
          title: '采购计划审核时间',
        },
        {
          field: 'deliveryPlanDate',
          minWidth: 135,
          sortable: true,
          title: '要求送达时间',
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
          field: 'bpartnerName',
          minWidth: 100,
          sortable: true,
          title: '供应商',
        },
        {
          field: 'priorityRuleName',
          minWidth: 70,
          sortable: true,
          title: '优先级',
        },
        {
          field: 'qtyOrdered',
          minWidth: 90,
          sortable: true,
          title: '采购数量',
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
          field: 'qtyReceived',
          minWidth: 90,
          sortable: true,
          title: '验收数量',
          align: 'right',
        },
        {
          field: 'totalAmt',
          minWidth: 90,
          sortable: true,
          title: '金额',
          align: 'right',
        },
        {
          field: 'deliveryStatusName',
          minWidth: 90,
          sortable: true,
          title: '配送状态',
        },
        {
          field: 'receiveStatusName',
          minWidth: 90,
          sortable: true,
          title: '验收状态',
        },
        {
          field: 'sourceTypeName',
          minWidth: 95,
          sortable: true,
          title: '采购来源',
        },
        {
          field: 'planCreatedByName',
          minWidth: 100,
          sortable: true,
          title: '创建人',
        },
        {
          field: 'planCreatedTime',
          minWidth: 100,
          sortable: true,
          title: '创建时间',
        },
        {
          field: 'planCommitUserName',
          minWidth: 100,
          sortable: true,
          title: '提交人',
        },
        {
          field: 'planCommitTime',
          minWidth: 100,
          sortable: true,
          title: '提交时间',
        },
        {
          field: 'planApproveUserName',
          minWidth: 100,
          sortable: true,
          title: '审核人',
        },
        {
          field: 'description',
          minWidth: 150,
          sortable: true,
          title: '备注',
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
        //   width: 180,
        // },
      ],
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'dateOrdered',
          label: '计划提交时间',
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
          component: 'DateGroup',
          fieldName: 'dateApprove',
          label: '计划审核时间',
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
              // showSearch: true,
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
              dictUrl: '/baseHandleAction/refList.do?id=1000369',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择采购来源',
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
          fieldName: 'sourceType',
          label: '采购来源',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000565',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择订单状态',
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
          fieldName: 'orderStatus',
          label: '订单状态',
        },
        {
          // TODO:medicine change 药品
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
          componentProps: {
            placeholder: '请输入药品',
          },
        },
        {
          // TODO:medicine change 医保药品编码
          component: 'Input',
          fieldName: 'insurance',
          label: '医保药品编码',
          componentProps: {
            placeholder: '请输入医保药品编码',
          },
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
          label: '供应商',
        },
        // TODO:medicine delete 高值
        // {
        //   component: 'ChcSelect',
        //   componentProps: () => {
        //     return {
        //       // autoChooseFirstOption: true,
        //       // dictUrl: '/orderPlanAction/commit.do',
        //       options: [
        //         { value: '', label: '全部' },
        //         { value: 'Y', label: '是' },
        //         { value: 'N', label: '否' },
        //       ],
        //       placeholder: '请选择高值',
        //       defaultValue: '',
        //       paginate: false,
        //       filterByFrontEnd: true,
        //       showChooseAll: '',
        //       immediate: true,
        //     };
        //   },
        //   fieldName: 'isPrecious',
        //   label: '高值',
        // },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000646',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择配送状态',
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
          fieldName: 'deliveryStatus',
          label: '配送状态',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000647',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择验收状态',
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
          fieldName: 'receiveStatus',
          label: '验收状态',
        },
        {
          component: 'Input',
          fieldName: 'orderId',
          label: '采购订单单号',
          defaultValue: isFromTraceSearchPage.value
            ? route?.query?.orderId
            : null,
          componentProps: {
            placeholder: '请输入采购订单单号',
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
        '/orderAction/query.do?orderType=PO&isFree=N&page=close&productControlLevel=',
      id: 'infoQ',
      commonFormOptions,
      viewFormOptions,
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
        console.warn('afterFetchFn:', params.totalPrice);
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

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = Number.parseFloat(total.toFixed(2));
  calculateSummarize();
};

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '勾选金额',
      value: selectedAmount.value,
    },
    {
      label: '采购总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

const handleImport = () => {
  importModalApi?.open();
};
// 作废处理函数
const handleCancel = () => {
  console.warn('handleImport', handleImport);
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要关闭的数据');
    return;
  }
  const orderIds = selectedRows.map((row: any) => row.orderId);
  modalApi
    .setData({
      dataTableId: '/orderAction/close.do',
      formData: {
        orderId: JSON.stringify(orderIds),
      },
      openType: 'close',
    })
    .open();
};
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要催单的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '催单',
    content: `确定要催单选中的 ${selectedRows.length} 条单据吗？`,
    onOk: async () => {
      try {
        const orderIds = selectedRows.map((row: any) => row.orderId);
        // const params = new URLSearchParams();
        // params.append('orderIds', JSON.stringify(orderIds));
        const params = {
          orderIds: JSON.stringify(orderIds),
        };
        await urgeOrderDo(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('urgeOrderDourgeOrderDourgeOrderDo', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('催单成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('催单失败');
      }
    },
  });
};
async function refreshTable() {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    ChcGridApi.query({ ...resData });
  });
}
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
    <ImportModal />
    <OrgFormModal
      :after-submit="refreshTable"
      :add-form-options="addFormOptions"
    />
    <ChcGrid>
      <template #orderPlanNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`button_orderPlanId_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.orderPlanNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <!-- <span>勾选金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleCancel"
          data-testid="button_close_order_infoQuery"
        >
          关闭订单
        </Button>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_urge_order_infoQuery"
        >
          催单
        </Button>
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
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
