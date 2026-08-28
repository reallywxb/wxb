<script lang="ts" setup>
import { ref, toRaw } from 'vue';

import { IconfontBasicView, SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import approvalProcessModalComp from '../common/modals/approvalProcessModal.vue';

const parentTableParams = ref<{ [key: string]: any }>({});
const selectedAmount = ref(0);
const hospitalId = ref(null);

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
      handleSubmit: async () => {
        const formValues = await parentGridApi.formApi.getValues();
        if (!formValues.hospitalId) {
          message.warn('医院必选，请选择医院');
          return;
        }
        parentGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        parentGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle({ column, row }: any) {
        if (row.isWorkflowEnd === 'N' && column.field === 'isWorkflowEnd') {
          return {
            color: '#F581B1',
          };
        }
      },
    }),
  },
  {
    id: 'invoiceNoSettlementAprpoveWfLog',
    // api地址
    queryUrl:
      'invoiceAction/query.do?page=workflowApproveLog&invoiceMethodNotEquals=2',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
        visible: false,
      },
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
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'isWorkflowEnd',
        title: '审批是否结束',
        minWidth: '140',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
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
        field: 'discountTotalAMT',
        title: '折扣金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
        sortable: true,
      },
      {
        field: 'rejectedAmt',
        title: '拒收金额',
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
        title: '单据编号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'isReturnDoc',
        title: '退货',
        minWidth: '80',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isBulkPurchase',
        title: '带量采购',
        minWidth: '80',
      },
      {
        field: 'invoiceMethod',
        title: '开票方式',
        minWidth: '110',
        sortable: true,
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
        label: '单据号码',
        componentProps: () => {
          return {
            placeholder: `请输入`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/hospitalAction/queryHospList?dataType=all',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(val: any, option: any) {
              console.warn('hospitalId', val, option);
              hospitalId.value = val;
            },
            afterFetch(res: any) {
              const rows = res?.data.map(
                (item: { hospitalName: string; orgId: number }) => ({
                  name: item.hospitalName,
                  id: item.orgId,
                }),
              );
              const vendorRef =
                parentGridApi.formApi.getFieldComponentRef?.('vendorId');
              if (vendorRef) {
                vendorRef.params.dependencies = {
                  regionId: rows[0]?.id,
                  hospitalId: rows[0]?.id,
                };

                vendorRef.fetchApi();
              }

              const warehouseRef =
                parentGridApi.formApi.getFieldComponentRef?.('warehouseId');
              if (warehouseRef) {
                warehouseRef.params.dependencies = {
                  regionId: rows[0]?.id,
                  hospitalId: rows[0]?.id,
                };

                warehouseRef.fetchApi();
              }

              return { ...res, rows: undefined, records: rows };
            },
          };
        },
        fieldName: 'hospitalId',
        label: '医院',
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
        dependencies: {
          triggerFields: ['hospitalId'],
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
        dependencies: {
          triggerFields: ['hospitalId'],
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
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择',
        },
        defaultValue: '',
        fieldName: 'isBulkPurchase',
        label: '带量采购',
      },
    ],
    gridEvents: {
      radioChange({ row }: { row: any }) {
        if (row?.invoiceId) {
          selectedAmount.value = row.totalAmt;

          parentTableParams.value.invoiceId = row.invoiceId;
          childGridApi.reload({
            invoiceId: row.invoiceId,
            productName: productName.value,
          });
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
      cellStyle({ row }: any) {
        // 价格差异
        // 是否入库
        if (
          !row.qtyASNLineMatched ||
          row.qtyASNLineMatched < row.qtyInvoiced ||
          row.priceActual !== row.orderPrice
        ) {
          return { color: 'red' };
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
          minWidth: '150',
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
          minWidth: '80',
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
          field: 'qtyASNLineMatched',
          title: '验收数量',
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
          field: 'orderPrice',
          title: '订单价格',
          minWidth: '90',
          sortable: true,
          align: 'right',
          format: '0.00##',
        },
        {
          field: 'discountPrice',
          title: '折扣价格',
          minWidth: '90',
          sortable: true,
          align: 'right',
          format: '0.00##',
        },
        {
          field: 'lineAmt',
          title: '金额(元)',
          minWidth: '100',
          align: 'right',
          format: '0.00##',
          sortable: true,
        },
        {
          field: 'discountLineAMT',
          title: '折扣金额(元)',
          minWidth: '110',
          align: 'right',
          format: '0.000',
          sortable: true,
        },
        {
          field: 'lot',
          title: '批号',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: '110',
          sortable: true,
        },
        // {
        //   type: 'color',
        //   hidden: true,
        //   render: function (item) {
        //     //是否入库
        //     if (
        //       !item.qtyASNLineMatched ||
        //       item.qtyASNLineMatched < item.qtyInvoiced
        //     ) {
        //       return 'red';
        //     }
        //     //价格差异
        //     if (item.priceActual != item.orderPrice) {
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
    id: 'invoiceNoSettlementAprpoveWfLog_son',
    dataTableId: 'invoiceAction/queryLine.do',
    tableSearchExtraParams: {},
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

const productName = ref('');

function handleChildSearch() {
  childGridApi.reload({
    invoiceId: parentTableParams.value.invoiceId,
    productName: productName.value,
  });
}
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
              :data-testid="`button_viewApprovalProcess_${scope.rowIndex}`"
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
        <ChildGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="编码/拼音码/名称"
              @keyup.enter="handleChildSearch"
              allow-clear
              data-testid="input_productName"
            />
            <Button
              type="primary"
              @click="handleChildSearch"
              data-testid="button_childSearch"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
</template>
