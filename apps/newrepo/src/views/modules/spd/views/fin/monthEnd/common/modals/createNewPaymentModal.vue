<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { createPayment } from '#/views/modules/spd/views/fin/payment/api';

import commonFormModalComp from './commonFormModal.vue';

const props = defineProps<{
  afterSubmit: () => void;
}>();

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
      checkboxConfig: {
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
    id: 'createNewPayment',
    // api地址
    queryUrl: 'invoiceAction/query.do?page=createPayment',
    gridColumns: [
      {
        type: 'checkbox',
        title: '',
        width: 50,
        align: 'center',
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'completeTime',
        title: '复核时间',
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
        field: 'dateInvoiced',
        title: '发票日期',
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
        field: 'leftAmt',
        title: '未付金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
        sortable: true,
      },
      {
        field: 'payAmt',
        title: '付款金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
        sortable: true,
      },
      {
        field: 'matchedAmt',
        title: '入库金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
        sortable: true,
      },
      {
        field: 'paidAmt',
        title: '已付金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
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
        label: '复核时间',
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
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
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
        defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
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
        fieldName: 'taxInvoiceNo',
        label: '发票号码',
        componentProps: () => {
          return {
            placeholder: `请输入`,
            defaultValue: '',
          };
        },
      },
    ],
    gridEvents: {
      checkboxChange: onCheckboxChange,
      checkboxAll: onCheckboxChange,
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
          field: 'billDate',
          title: '记账日期',
          minWidth: '100',
          sortable: true,
        },
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
          minWidth: '130',
          sortable: true,
        },
        {
          field: 'modelNo',
          title: '型号',
          minWidth: '130',
          sortable: true,
          visible: false,
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
          minWidth: '70',
          sortable: true,
        },
        {
          field: 'qtyInvoiced',
          title: '数量',
          minWidth: '80',
          sortable: true,
          align: 'right',
        },
        {
          field: 'priceActual',
          title: '价格',
          minWidth: '80',
          sortable: true,
          align: 'right',
        },
        {
          field: 'lineMatchedAmt',
          title: '金额',
          minWidth: '80',
          sortable: true,
          align: 'right',
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
    id: 'createNewPayment_son',
    dataTableId: 'invoiceAction/queryLine.do',
  },
);

function onCheckboxChange() {
  const checkedRows = parentGridApi.grid.getCheckboxRecords();

  if (checkedRows.length === 0) {
    // 父表没数据，子表要清空
    parentTableParams.value.invoiceId = undefined;
    childGridApi.grid.remove(childGridApi.grid.getFullData());
  } else {
    parentTableParams.value.invoiceId = checkedRows
      .map(({ invoiceId }) => invoiceId)
      .join(',');

    childGridApi.query({
      invoiceId: parentTableParams.value.invoiceId,
    });
  }
}

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onConfirm: showSubModal,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      setTimeout(() => {
        parentGridApi.query();
      }, 200);
    }
  },
});

// 父表 - 修改发票号对话框
const [SubModal, subModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

// 父表 - 修改发票号
function showSubModal() {
  const checkedRows = parentGridApi.grid.getCheckboxRecords();

  if (checkedRows.length === 0) {
    message.error('请选择支付的发票！');
    return;
  }

  subModalApi
    .setData({
      title: '修改发票号',
      form: {
        total: checkedRows.reduce((pre, cur) => pre + cur.payAmt, 0),
      },
      submit: ({
        startDate,
        endDate,
        description,
      }: Record<number | string, any>) => {
        return createPayment({
          lineData: JSON.stringify(
            checkedRows.map(({ invoiceId, payAmt }) => ({
              invoiceId,
              payAmt,
            })),
          ),
          startDate,
          endDate,
          description,
          productControlLevel: '',
          orgRegionId: '',
        });
      },
    })
    .open();
}

const subModalFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'total',
      label: '付款金额',
      disabled: true,
    },
    {
      component: 'DatePicker',
      fieldName: 'startDate',
      label: '开始时间',
      rules: 'required',
      defaultValue: dayjs()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD'),
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'endDate',
      label: '结束时间',
      rules: 'required',
      defaultValue: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '备注',
      componentProps: () => {
        return {
          rows: 5,
          placeholder: '请输入',
        };
      },
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
</script>
<template>
  <Modal
    class="h-[800px] w-[75%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="新建付款"
  >
    <Page
      content-class="p-[0.5rem]"
      auto-content-height
      header-class="px-3 py-2"
    >
      <PageSplit
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
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
          </ParentGrid>
        </template>
        <template #second>
          <ChildGrid />
        </template>
      </PageSplit>
    </Page>
    <SubModal
      :form-options="subModalFormOptions"
      :after-submit="
        () => {
          modalApi.close();
          props.afterSubmit();
        }
      "
    />
  </Modal>
</template>
