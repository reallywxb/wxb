<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { IconfontBasicView } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import approvalProcessModalComp from '../common/modals/approvalProcessModal.vue';
import settlementDetailModalComp from '../common/modals/settlementDetailModal.vue';

const parentTableParams = ref<{ [key: string]: any }>({});
const selectedAmount = ref(0);

// 父表
const [ParentGrid, parentGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle({ column, row }: any) {
        if (
          column.field === 'isWorkflowEnd' &&
          (row.isWorkflowEnd === 'N' || row.isWorkflowEnd === 'n')
        ) {
          return {
            color: '#F581B1',
          };
        }
      },
    }),
  },
  {
    id: 'invoiceWithSettlementAprpoveWfLog',
    // api地址
    queryUrl: 'invoiceAction/query.do?page=workflowApproveLog&invoiceMethod=2',
    gridColumns: [
      { type: 'radio', title: '', width: 50, align: 'center', visible: false },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'dateInvoiced',
        title: '发票时间',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '发票金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
        sortable: true,
      },
      {
        field: 'taxInvoiceTypeNo',
        title: '发票代码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'siteInvoiceId',
        title: '发票单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '采购仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'isWorkflowEnd',
        title: '审批是否结束',
        minWidth: '140',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
        // color(f, item) {
        //   if (item.isWorkflowEnd && item.isWorkflowEnd === 'N') {
        //     return '#F581B1';
        //   }
        // },
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 230,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: $t('fin.invoice.invoiceDateRange'),
        defaultValue: [
          dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'taxInvoiceNo',
        label: '发票号码',
        componentProps: () => {
          return {
            placeholder: '请输入',
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'siteInvoiceId',
        label: '发票单号',
        componentProps: () => {
          return {
            placeholder: '请输入',
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: $t('fin.settlement.settlementInput.warehouseId'),
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
            placeholder: `请选择${$t('fin.settlement.settlementInput.warehouseId')}`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: `请选择供应商`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
    ],
    gridEvents: {
      radioChange({ row }: { row: any }) {
        if (row?.invoiceId) {
          selectedAmount.value = row.totalAmt;

          parentTableParams.value.invoiceId = row.invoiceId;
          childGridApi.reload({ invoiceId: row.invoiceId });
        } else {
          selectedAmount.value = 0;
          // 父表没数据，子表要清空
          parentTableParams.value.invoiceId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    gridOptions: {
      cellStyle(scope: any) {
        if (scope.column.field === 'settlementQty') {
          return {
            cursor: 'pointer',
          };
        }
      },
      cellClassName: ({ row }) => {
        // 是否入库
        if (
          !row.settlementQtyLeft ||
          (row.qtyInvoiced > 0 && row.qtyInvoiced < row.settlementQtyLeft) ||
          (row.qtyInvoiced < 0 && row.qtyInvoiced > row.settlementQtyLeft)
        ) {
          return 'red';
        }
        // 价格差异
        if (
          row.isSettlementPriceSame === 'N' ||
          row.isSettlementPriceSame === 'n'
        ) {
          return 'red';
        }
      },
      columns: [
        // {
        //   type: 'checkbox',
        //   width: 50,
        //   align: 'center',
        // },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'productCode',
          title: '药品编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          minWidth: '200',
          sortable: true,
        },
        {
          field: 'productSpec',
          title: '规格',
          minWidth: '90',
          sortable: true,
        },
        {
          field: 'manufacturer',
          title: '厂家',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          minWidth: '60',
          sortable: true,
        },
        {
          field: 'qtyInvoiced',
          title: '发票数量',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'priceActual',
          title: '发票价格',
          minWidth: '90',
          sortable: true,
          align: 'right',
          format: '0.00##',
        },
        {
          field: 'lineAmt',
          title: '发票金额(元)',
          minWidth: '120',
          align: 'right',
          format: '0.00',
          sortable: true,
        },
        {
          field: 'settlementQty',
          title: '结算数量',
          minWidth: '90',
          sortable: true,
          // hover: true,
          align: 'right',
        },
        {
          field: 'settlementQtyLeft',
          title: '未开票数量',
          minWidth: '100',
          sortable: true,
          align: 'right',
        },
        {
          field: 'settlementPrice',
          title: '结算价格',
          minWidth: '90',
          sortable: true,
          align: 'right',
          format: '0.00##',
        },
        // {
        //   field: 'isSettlementPriceSame',
        //   title: '价格是否相同',
        //   hidden: true,
        // },
        {
          field: 'settlementNo',
          title: '结算单号',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'settlementDate',
          title: '结算时间',
          minWidth: '160',
          sortable: true,
        },
        {
          field: 'lot',
          title: '批号',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: '100',
          sortable: true,
        },
        // {
        //   type: 'color',
        //   hidden: true,
        //   render: function (item) {
        //     //是否入库
        //     if (
        //       !item.settlementQtyLeft ||
        //       (item.qtyInvoiced > 0 &&
        //         item.qtyInvoiced < item.settlementQtyLeft) ||
        //       (item.qtyInvoiced < 0 &&
        //         item.qtyInvoiced > item.settlementQtyLeft)
        //     ) {
        //       return 'red';
        //     }
        //     //价格差异
        //     if (
        //       'N' === item.isSettlementPriceSame ||
        //       'n' == item.isSettlementPriceSame
        //     ) {
        //       return 'red';
        //     }
        //   },
        // },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'invoiceWithSettlementAprpoveWfLog_son',
    dataTableId: 'invoiceAction/queryLine.do',
    tableSearchExtraParams: {},
    gridEvents: {
      cellClick: async ({ column }) => {
        if (column.field === 'settlementQty') {
          settlementDetailModalApi.open();
        }
      },
    },
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.invoiceId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 查看审批流程modal
const [ApprovalProcessModal, approvalProcessModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: approvalProcessModalComp,
  draggable: true,
});

// 查看审批流程
const showApprovalProcess = (row: any) => {
  approvalProcessModalApi
    .setData({
      invoiceId: row.invoiceId,
      processId: row.processId,
    })
    .open();
};

// 父表 - 结算数量对话框
const [SettlementDetailModal, settlementDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: settlementDetailModalComp,
  draggable: true,
});

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <SettlementDetailModal />
        <ApprovalProcessModal />
        <ParentGrid>
          <template #toolbar-tools>
            <span>
              已选发票金额合计:
              <span
                style="color: red"
                v-text="selectedAmount.toFixed(2)"
              ></span>
              元
            </span>
          </template>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="showApprovalProcess(scope.row)"
            >
              查看审批流程
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <ChildGrid />
      </template>
    </PageSplit>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-grid--table-container .vxe-table--column.red) {
  color: red;
}
</style>
