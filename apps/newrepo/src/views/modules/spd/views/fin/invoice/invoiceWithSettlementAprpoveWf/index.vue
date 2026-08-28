<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, reactive, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  approveWorkflow,
  modifyInovince,
  rejectWorkflow,
} from '#/views/modules/spd/views/fin/invoice/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import settlementDetailModalComp from '../common/modals/settlementDetailModal.vue';

const parentTableParams = ref<{ [key: string]: any }>({});
const selectedAmount = ref(0);

// 表格编辑
const editRef = ref(null);
const descriptionState = reactive({
  editable: false,
  invoiceId: null,
  backupText: '',
  isSubmitting: false,
  async submit(row) {
    // 防止重复提交
    if (descriptionState.isSubmitting) {
      return;
    }
    descriptionState.editable = false;
    if (row.description !== descriptionState.backupText) {
      // 标记为提交中
      descriptionState.isSubmitting = true;
      try {
        await modifyInovince({
          invoiceId: descriptionState.invoiceId,
          description: row.description,
        });

        message.success('编辑成功');
        parentGridApi.query();
      } catch {
        row.description = descriptionState.backupText;
      } finally {
        // 提交完成后，重置提交状态
        descriptionState.isSubmitting = false;
      }
    }
  },
  cancel(row) {
    row.description = descriptionState.backupText;
    descriptionState.editable = false;
  },
});

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
      checkboxConfig: {
        trigger: 'cell',
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle(scope: any) {
        if (scope.column.field === 'description') {
          return {
            backgroundColor: '#D7FFF5',
            cursor: 'pointer',
          };
        }
      },
    }),
  },
  {
    id: 'invoiceWithSettlementAprpoveWf',
    // api地址
    queryUrl: 'invoiceAction/query.do?page=workflowApprove&invoiceMethod=2',
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'dateInvoiced',
        title: '发票时间',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'createdDate',
        title: '发票创建时间',
        minWidth: '120',
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
        minWidth: '180',
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
      // {
      //   field: 'isOffline',
      //   title: '是否线下',
      //   minWidth: '100',
      //   hidden: true,
      //   toolbar: '#switchTpl_isOffline',
      //   formatter(value) {
      //     return value === 'Y' ? '是' : '否';
      //   },
      // },
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
        field: 'description',
        title: '备注',
        minWidth: '130',
        sortable: true,
        slots: { default: 'edit_description' },
      },
      {
        field: 'wfNodeName',
        title: '审批节点',
        minWidth: '120',
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: $t('system.menu.operation'),
      //   width: 230,
      // },
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
        component: 'DateGroup',
        fieldName: 'createDate',
        label: '发票创建时间',
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
      checkboxChange: onCheckboxChange,
      checkboxAll: onCheckboxChange,
      radioChange: onRadioChange,
      cellClick: async ({ column, row }) => {
        if (column.field === 'description') {
          descriptionState.editable = true;
          descriptionState.invoiceId = row.invoiceId;
          descriptionState.backupText = row.description;

          setTimeout(() => {
            editRef.value?.focus();
          });
        }
      },
    },
    afterFetchFn: (params) => {
      if (isEmpty(params?.rows)) {
        childGridApi?.grid?.remove();
      }
      parentTableParams.value.invoiceId = undefined;
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
          field: 'insurance',
          title: '医保编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'standardCode',
          title: '贯标编码',
          minWidth: '120',
          sortable: true,
          visible: false, // TODO:medicine cancel 贯标码
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
          field: 'certificateNo',
          title: '批准文号',
          minWidth: '90',
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
          hover: true,
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
        {
          field: 'applyBpartnerName',
          title: '直配仓库',
          minWidth: '120',
          sortable: true,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'invoiceWithSettlementAprpoveWf_son',
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

async function onRadioChange({ row }: { row: any }) {
  if (row?.invoiceId) {
    parentTableParams.value.invoiceId = row.invoiceId;
    childGridApi.reload({
      invoiceId: parentTableParams.value.invoiceId,
    });
    await parentGridApi.grid.clearCheckboxRow();
    await parentGridApi.grid.setCheckboxRow(row, true);
  } else {
    parentTableParams.value.invoiceId = undefined;
    childGridApi.grid.remove();
  }
  const checkedRows = parentGridApi.grid.getCheckboxRecords();
  selectedAmount.value = checkedRows.reduce(
    (previousValue, currentValue) => previousValue + currentValue.totalAmt,
    0,
  );
}

function onCheckboxChange() {
  const checkedRows = parentGridApi.grid.getCheckboxRecords();

  selectedAmount.value = checkedRows.reduce(
    (previousValue, currentValue) => previousValue + currentValue.totalAmt,
    0,
  );
}

// 子表 - 结算数量对话框
const [SettlementDetailModal, settlementDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: settlementDetailModalComp,
  draggable: true,
});

// 父表 - 拒绝对话框
const [InvoiceRejectModal, invoiceRejectModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

/**
 * 页面弹窗表单配置
 */
const rejectionFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'Textarea',
      fieldName: 'rejectReason',
      componentProps: () => {
        return {
          rows: 5,
        };
      },
      label: '拒绝原因',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

function handleApproval() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认批准吗？`,
    onOk: async () => {
      try {
        await approveWorkflow({
          wfActivityId: JSON.stringify(
            selectedRows.map(({ wfActivityId }) => wfActivityId),
          ),
        });

        message.success('批准成功');

        parentGridApi.query();
      } catch {
        message.error('批准失败');
      }
    },
  });
}

function handleReject() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }

  invoiceRejectModalApi
    .setData({
      title: '作废原因',
      form: {},
      submit: (params) =>
        rejectWorkflow({
          wfActivityId: JSON.stringify(
            selectedRows.map(({ wfActivityId }) => wfActivityId),
          ),
          ...params,
        }),
    })
    .open();
}

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
        <InvoiceRejectModal
          :form-options="rejectionFormOptions"
          :after-submit="parentGridApi.query"
        />
        <SettlementDetailModal />
        <ParentGrid>
          <template #edit_description="{ row }">
            <Input
              ref="editRef"
              v-if="descriptionState.editable"
              v-model:value="row.description"
              @click.stop
              @blur="descriptionState.submit(row)"
              @keyup.enter="descriptionState.submit(row)"
              @keyup.esc="descriptionState.cancel(row)"
            />
            <span v-else v-text="row.description"></span>
          </template>
          <template #toolbar-actions>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleApproval"
              data-testid="button_approve"
            >
              批准
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              ghost
              danger
              type="primary"
              class="mr-[0.5rem]"
              @click="handleReject"
              data-testid="button_reject"
            >
              拒绝
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
          </template>
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
