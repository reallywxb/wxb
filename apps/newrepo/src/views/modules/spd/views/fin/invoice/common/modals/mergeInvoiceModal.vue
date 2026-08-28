<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { mergeInvoice } from '#/views/modules/spd/views/fin/invoice/api';

const props = defineProps<{
  afterSubmit: () => void;
  cols?: { dict?: boolean; id: string }[];
  formOptions?: VbenFormProps;
}>();

const userStore = useUserStore();

const mergeInvoiceId = ref('');

const [Grid, gridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
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
    }),
  },
  {
    id: 'invoiceActionQuery',
    // api地址
    queryUrl: 'invoiceAction/query.do?page=query',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orgName',
        title: '机构',
        minWidth: '110',
        sortable: true,
        visible: userStore.userInfo?.isSaas,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'dateInvoiced',
        title: '发票时间',
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
        field: 'totalAmt',
        title: '发票金额(元)',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'matchedAmt',
        title: '入库金额(元)',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'rejectedAmt',
        title: '拒收金额(元)',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'taxInvoiceTypeNo',
        title: '发票代码',
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
        field: 'isRejectDoc',
        title: '拒收',
        minWidth: '80',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'docStatusName',
        title: '单据状态',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'invoiceMethod',
        title: '开票方式',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'confirmUserName',
        title: '审核人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'confirmTime',
        title: '审核时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'completeUserName',
        title: '复核人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'completeTime',
        title: '复核时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'billDate',
        title: '记账日期',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'siteInvoiceId',
        title: '发票单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'rejectReason',
        title: '作废原因',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: $t('fin.invoice.invoiceDateRange'),
        formItemClass: 'col-span-1',
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
        label: '商品',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
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
        component: 'Select',
        componentProps: () => ({
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'WA', label: '待确认' },
            { value: 'WU', label: '待提交' },
            { value: 'NA', label: '未批准' },
          ],
          placeholder: '请选择',
        }),
        defaultValue: 'WU',
        fieldName: 'docStatus',
        label: '发票状态',
      },
    ],
    gridEvents: {
      radioChange({ row }: { row: any }) {
        mergeInvoiceId.value = row.invoiceId;
      },
    },
    tableSearchExtraParams: {
      orgId: userStore.userInfo?.orgId,
    },
  },
);

const data: any = ref({});

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    setTimeout(() => {
      data.value = modalApi.getData<Record<string, any>>();
      gridApi.formApi.getValues().then((res: any) => {
        gridApi.query({
          ...res,
          validation: `i.invoiceMethod != '2' and i.C_Invoice_ID not in (${data.value.invoiceId.join(',')})`,
        });
      });
    });
  },
  async onConfirm() {
    try {
      await mergeInvoice({
        mergeInvoiceId: mergeInvoiceId.value,
        invoiceId: JSON.stringify(
          modalApi.getData<{ invoiceId: Array<number> }>().invoiceId,
        ),
      });

      message.success('操作成功');

      modalApi.close();
      props.afterSubmit();
    } catch {}
  },
});
</script>

<template>
  <Modal class="h-[800px] w-[75%]" title="调整结算价">
    <div class="h-full">
      <Grid />
    </div>
  </Modal>
</template>
