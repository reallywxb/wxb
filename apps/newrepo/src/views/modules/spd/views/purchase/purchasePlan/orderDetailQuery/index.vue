<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';

import { ExportActionIcon, viewActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { Page } from '@vben/common-ui';
import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import { addFormOptions } from './addFormOptions';
import { closeLineDo, urgeOrderDo } from './api';
import actionLogModal from './modals/actionLogModal.vue';
import FormModal from './modals/FormModal.vue';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig?: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage?: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab?: PageTab;
  }>(),
  {},
);

const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

const [OrgFormModal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  connectedComponent: FormModal,
});

const extParams = ref<{}>({});
const totalAmount = ref(0);

const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
          ['dateApprove', ['dateReceivedFrom', 'dateReceivedTo'], 'YYYY-MM-DD'],
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
          // AI-GENERATED-BEGIN
          // @date 2026-07-03
          // @prompt 多选配送状态传参需要逗号拼接
          // @description 多选字段 deliveryStatus 返回数组，需转为逗号分隔的字符串以适配后端 formdata 传参
          if (Array.isArray(formValues.deliveryStatus)) {
            formValues.deliveryStatus = formValues.deliveryStatus.join(',');
          }
          // AI-GENERATED-END
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
        { type: 'checkbox', title: '多选', width: 50, align: 'center' },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'lineStatusName',
          minWidth: 120,
          sortable: true,
          title: '订单明细状态',
        },
        {
          field: 'warehouseName',
          minWidth: 150,
          sortable: true,
          title: '采购仓库',
        },
        {
          field: 'targetWarehouse',
          minWidth: 150,
          sortable: true,
          title: '需求仓库',
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
          field: 'uomName',
          minWidth: 60,
          sortable: true,
          title: '单位',
        },
        {
          field: 'baseUomName',
          minWidth: 90,
          sortable: true,
          title: '最小单位',
        },
        // {
        //   field: 'deliveryStatusName',
        //   minWidth: 90,
        //   sortable: true,
        //   title: '配送状态',
        // },
        {
          field: 'asnLineStatusName',
          minWidth: 90,
          sortable: true,
          title: '验收状态',
        },
        {
          field: 'rejectReason',
          minWidth: 90,
          sortable: true,
          title: '拒收原因',
        },
        {
          field: 'qtyOrdered',
          minWidth: 90,
          sortable: true,
          title: '采购数量',
          align: 'right',
        },
        {
          field: 'qtyConfirmed',
          minWidth: 90,
          sortable: true,
          title: '答复数量',
          align: 'right',
        },
        {
          field: 'qtyCancelled',
          minWidth: 90,
          sortable: true,
          title: '缺货数量',
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
          field: 'qtyUnFinished',
          minWidth: 100,
          sortable: true,
          title: '未结算数量',
          align: 'right',
        },
        {
          field: 'priceActual',
          minWidth: 90,
          sortable: true,
          title: '采购价',
          align: 'right',
        },
        {
          field: 'lineAmt',
          minWidth: 90,
          sortable: true,
          title: '采购金额',
          align: 'right',
        },
        {
          field: 'productControlLevelName',
          minWidth: 90,
          sortable: true,
          title: '药品组',
        },
        {
          field: 'vendorCode',
          minWidth: 100,
          sortable: true,
          title: '供应商编码',
        },
        {
          field: 'vendorName',
          minWidth: 100,
          sortable: true,
          title: '供应商',
        },
        {
          field: 'orderPlanNo',
          minWidth: 120,
          sortable: true,
          title: '采购计划单号',
        },
        {
          field: 'orderNo',
          minWidth: 120,
          sortable: true,
          title: '采购订单单号',
        },
        {
          field: 'isBulkPurchase',
          title: '带量采购',
          minWidth: '110',
          sortable: true,
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'receiptTypeName',
          title: '采购类型',
          minWidth: '100',
          sortable: true,
        },
        {
          title: '采购时间',
          field: 'planCommitTime',
          sortable: true,
          minWidth: 30,
          width: 120,
        },
        {
          field: 'dateArrived',
          title: '配送时间',
          width: '100',
          sortable: true,
        },
        {
          field: 'dateReceived',
          title: '验收时间',
          width: '120',
          sortable: false,
        },
        {
          field: 'insurance',
          minWidth: 120,
          sortable: true,
          title: '医保药品编码',
        },
        {
          field: 'manufacturer',
          minWidth: 110,
          sortable: true,
          title: '生产厂家',
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
          width: 100,
        },
      ],
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'dateOrdered',
          label: '采购时间',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(7, 'day')
              .format('YYYY-MM-DD'),
          ],
        },
        // {
        //   component: 'DateGroup',
        //   fieldName: 'dateApprove',
        //   label: '验收时间',
        //   defaultValue: [
        //     dayjs(dayjs().format('YYYY-MM-DD'))
        //       .subtract(7, 'day')
        //       .format('YYYY-MM-DD'),
        //   ],
        // },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              autoChooseFirstOption: true,
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
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/refList.do?id=1000369',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择采购来源',
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
          label: '采购来源',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/refList.do?id=1000291',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择订单明细状态',
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
          fieldName: 'lineStatus',
          label: '订单明细状态',
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
            placeholder: '请输入医保药品编码',
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/vendor.do',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择供应商',
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
          label: '供应商',
        },
        // {
        //   component: 'ChcSelect',
        //   componentProps: () => {
        //     return {
        //       dictUrl: '/baseHandleAction/refList.do?id=1000646',
        //       apiType: 'post',
        //       requestContentType: 'application/x-www-form-urlencoded',
        //       showSearch: true,
        //       placeholder: '请选择配送状态',
        //       paginate: false,
        //       filterByFrontEnd: true,
        //       showChooseAll: '',
        //       defaultValue: [],
        //       immediate: true,
        //       labelField: 'name',
        //       valueField: 'id',
        //       mode: 'multiple',
        //       afterFetch(res: any) {
        //         return { ...res, rows: undefined, records: res.rows };
        //       },
        //     };
        //   },
        //   fieldName: 'deliveryStatus',
        //   label: '配送状态',
        // },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/refList.do?id=1000325',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择验收状态',
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
          fieldName: 'asnLineStatus',
          label: '验收状态',
        },
        {
          component: 'Input',
          fieldName: 'orderId',
          label: '采购订单单号',
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
      dataTableId: '/orderAction/queryDetail.do?page=close',
      id: 'infoDetail',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      beforeFetchFn: (params) => {
        return {
          ...params,
          orderType: 'PO',
        };
      },
      afterFetchFn: (params) => {
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
          connectedComponent: ImportModalComp,
        }),
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

const handleDetail = (scope: any) => {
  console.warn(importModalApi);
  console.warn('scope', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderLineId: scope.row?.orderLineId,
    })
    .open();
};

const handleCloseLine = async (scope: any) => {
  console.warn('scope', scope);
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要关闭的数据');
    return;
  }
  const orderLineId = selectedRows.map((row: any) => row.orderLineId);
  modalApi
    .setData({
      dataTableId: '/orderAction/closeLine.do',
      formData: {
        orderLineId: JSON.stringify(orderLineId),
      },
      openType: 'close',
    })
    .open();
};

const handleApprove = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要催单的数据');
    return;
  }

  Modal.confirm({
    title: '催单',
    content: `确定要催单选中的 ${selectedRows.length} 条单据吗？`,
    onOk: async () => {
      try {
        const orderIds = selectedRows.map((row: any) => row.orderId);
        const params = {
          orderIds: JSON.stringify(orderIds),
        };
        await urgeOrderDo(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('催单', res);
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

const currentTab = defineModel<number>('currentTab', { required: true });
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div class="h-full">
      <ActionLogModal />
      <ImportModal />
      <OrgFormModal
        :after-submit="refreshTable"
        :add-form-options="addFormOptions"
      />
      <ChcGrid class="h-full">
        <template #toolbar-actions>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleCloseLine"
            data-testid="button_close_detailQuery"
          >
            关闭
          </Button>
          <Button
            type="primary"
            @click="handleApprove"
            class="mr-[0.5rem]"
            data-testid="button_urge_detailQuery"
          >
            催单
          </Button>
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
          <Summarize ref="summarizeRef" />
        </template>

        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleDetail(scope)"
            data-testid="button_operation_record_detailQuery"
          >
            操作记录
            <template #icon>
              <viewActionIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
    </div>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
