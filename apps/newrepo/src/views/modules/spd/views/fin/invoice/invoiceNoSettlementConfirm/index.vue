<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Input as AntdInput, Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import {
  invalidatInvoice,
  modifyInovinceNo,
  modifyInvoiceLineNo,
  submitInvoice,
} from '#/views/modules/spd/views/fin/invoice/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import mergeInvoiceModalComp from '../common/modals/mergeInvoiceModal.vue';

const parentTableParams = ref<{ [key: string]: any }>({});
const selectedAmount = ref(0);
const selectedInvoiceIds = ref<Array<number | string>>([]); // 选中的父表invoiceId
// 收货金额合计
const totalReceivedAmount = ref<string>('0.00');
const userStore = useUserStore();
const route = useRoute();
const orgExtraParam = ref({ orgId: userStore.userInfo?.orgId });
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
      cellStyle({ row }: any) {
        if (row.totalAmt < 0) {
          return {
            color: 'red',
          };
        }
      },
    }),
  },
  {
    id: 'invoiceNoSettlementConfirm',
    // api地址
    queryUrl: `invoiceAction/query.do?page=confirmNoSettlement&isReturnDoc=${route.query.isReturnDoc ?? ''}`,
    // showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },

      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orgName',
        title: '机构',
        minWidth: '110',
        sortable: true,
        visible: userStore.userInfo?.isSaas,
      },
      {
        field: 'dateInvoiced',
        title: '发票时间',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'createdDate',
        title: '创建时间',
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
        sortable: true,
        formatter: ({ cellValue }) => handlePriceToFixedTwo(cellValue),
      },
      {
        field: 'receivedAmt',
        title: '收货金额(元)',
        minWidth: '120',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => handlePriceToFixedTwo(cellValue),
      },
      {
        field: 'discountTotalAmt',
        title: '折扣金额(元)',
        minWidth: '120',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => handlePriceToFixedTwo(cellValue),
      },
      {
        field: 'rejectTaxinvoiceNo',
        title: '拒收发票号码',
        minWidth: '150',
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
        field: 'inoutNo',
        title: '入库单号',
        minWidth: '110',
        visible: route.query.isReturnDoc === 'Y',
        sortable: true,
      },
      {
        field: 'isReturnDoc',
        title: '退货',
        minWidth: '60',
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
        field: 'isAdjustDoc',
        title: '是否调差发票',
        minWidth: '100',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : cellValue === 'N' ? '否' : '';
        },
      },
      {
        field: 'isPriceAdj',
        title: '是否调价发票',
        minWidth: '100',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : cellValue === 'N' ? '否' : '';
        },
      },

      {
        field: 'taxInvoiceTypeNo',
        title: '发票代码',
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
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
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
      userStore.userInfo?.isSaas && {
        component: 'ChcSelect',
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/userOrgList.do',
            placeholder: '请选择机构',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            onChange: () => {},
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
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
            placeholder: `请输入`,
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
            placeholder: `请输入`,
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
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择${$t('fin.settlement.settlementInput.warehouseId')}`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            extraParams: userStore.userInfo?.isSaas ? orgExtraParam.value : {},
            // extraParams: {
            //   orgId: userStore.userInfo?.orgId || undefined,
            // },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
            // extraParams: () => ({
            //   orgId: -1,
            // }),
          };
        },
        ...(userStore.userInfo?.isSaas
          ? {
              dependencies: {
                triggerFields: ['orgId'],
                trigger(values) {
                  parentGridApi.formApi.getFieldComponentRef(
                    'warehouseId',
                  ).params.dependencies = {
                    orgId: values.orgId || -1,
                  };
                  parentGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                  parentGridApi.formApi?.setFieldValue('warehouseId', '');
                },
              },
            }
          : null),
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
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          defaultValue: '',
          placeholder: '请选择',
        },
        fieldName: 'isBulkPurchase',
        label: '带量采购',
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
        defaultValue: 'Y',
        fieldName: 'isChecked',
        label: '已收货',
      },
      {
        fieldName: 'isPriceAdj',
        label: '是否调价发票',
        component: 'ChcSelect',
        defaultValue: 'N',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
        },
      },
      {
        fieldName: 'isAdjustDoc',
        label: '是否调差发票',
        component: 'ChcSelect',
        defaultValue: 'N',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
        },
      },
    ].filter(Boolean),
    gridEvents: {
      checkboxChange: onCheckboxChange,
      checkboxAll: onCheckboxChange,
      radioChange: onRadioChange,
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      parentTableParams.value.invoiceId = undefined;
      // parentTableParams.value.invoiceId = undefined;
      selectedInvoiceIds.value = [];
      totalReceivedAmount.value = handlePriceToFixedTwo(params?.totalAmt || 0);
      setTimeout(() => {
        calculateSummarize();
      }, 100);
      return {
        ...params,
        records: params.rows,
      };
    },
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    // childGridLinkKeys: ['userId-id'],
    // childGridApi: childGridApi,
  },
);

// 子表
// 子表查询参数
const INITIAL_QUERY_FORM_OF_CHILD = {
  documentNo: '',
};
const queryFormOfChild = reactive<{
  documentNo: string;
}>({
  ...INITIAL_QUERY_FORM_OF_CHILD,
});
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    gridOptions: {
      cellStyle({ row }: any) {
        // 是否已收货
        const selectedRows = parentGridApi.grid.getCheckboxRecords();
        if (
          selectedRows[0]?.isReturnDoc &&
          (!row.qtyReceived ||
            row.qtyReceived + row.qtyRejectedInvoiced * -1 < row.qtyInvoiced)
        ) {
          return { color: 'red' };
        }
        // 价格差异
        if (row.priceActual !== row.orderPrice) {
          return { color: 'red' };
        }
      },
      columns: [
        {
          type: 'checkbox',
          width: 50,
          align: 'center',
        },
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
          field: 'documentNo',
          title: '源单据号',
          minWidth: '120',
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
          field: 'isOnLine',
          title: '是否线上',
          minWidth: '90',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'isBulkPurchase',
          title: '是否带量',
          minWidth: '90',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
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
          field: 'qtyReceived',
          title: '收货数量',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qtyRejectedInvoiced',
          title: '拒收发票数量',
          minWidth: '120',
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
          format: '0.000',
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
        {
          field: 'applyBpartnerName',
          title: '直配仓库',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'error',
          title: '异常说明',
          minWidth: '150',
          formatter({ row }) {
            let res = '';
            // 是否已收货
            const selectedRows = parentGridApi.grid.getCheckboxRecords();
            if (
              (selectedRows[0]?.isReturnDoc && !row.qtyReceived) ||
              row.qtyReceived + row.qtyRejectedInvoiced * -1 < row.qtyInvoiced
            ) {
              res = '收货数量小于发票数量';
            }
            // 价格差异
            if (row.priceActual !== row.orderPrice) {
              if (res) res += ',';
              res += '发票价格与订单价格不一致';
            }
            return res;
          },
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'invoiceNoSettlementConfirm_son',
    dataTableId: 'invoiceAction/queryLine.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      // 优先使用 invoiceIds（多选），其次使用 invoiceId（单选）
      if (!parentTableParams.value.invoiceId) {
        return false;
      }
      return {
        ...params,
        ...queryFormOfChild,
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
function handleChildSearch() {
  childGridApi.reload({
    documentNo: queryFormOfChild.documentNo,
  });
}
const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '已选发票金额合计',
      value: selectedAmount.value,
      style: 'color: red;',
    },
    {
      label: '收货金额合计',
      value: totalReceivedAmount.value,
      style: 'color: red;',
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

async function onRadioChange({ row }: { row: any }) {
  if (row?.invoiceId) {
    // 父表没数据，子表要清空
    parentTableParams.value.invoiceId = row.invoiceId;
    // 同步更新多选状态
    selectedInvoiceIds.value = [row.invoiceId];
    parentTableParams.value.invoiceId = row.invoiceId;
    childGridApi.reload({
      invoiceId: parentTableParams.value.invoiceId,
      invoiceId: row.invoiceId,
    });
    await parentGridApi.grid.clearCheckboxRow();
    await parentGridApi.grid.setCheckboxRow(row, true);
  } else {
    parentTableParams.value.invoiceId = undefined;
    // parentTableParams.value.invoiceId = undefined;
    selectedInvoiceIds.value = [];
    childGridApi.grid.remove();
  }
  const checkedRows = parentGridApi.grid.getCheckboxRecords();

  const amount = checkedRows.reduce(
    (previousValue, currentValue) => previousValue + currentValue.totalAmt,
    0,
  );
  selectedAmount.value = amount.toFixed(2);
  calculateSummarize();
}

function onCheckboxChange() {
  const checkedRows = parentGridApi.grid.getCheckboxRecords();

  const amount = checkedRows.reduce(
    (previousValue, currentValue) => previousValue + currentValue.totalAmt,
    0,
  );
  selectedAmount.value = amount.toFixed(2);

  // 更新选中的 invoiceId
  selectedInvoiceIds.value = checkedRows.map((item) => item.invoiceId);
  const selectedInvoiceIdsStr = selectedInvoiceIds.value.join(',');

  // 有选中记录时才查询子表
  if (checkedRows.length > 0) {
    parentTableParams.value.invoiceId = selectedInvoiceIdsStr;
    childGridApi.query({
      invoiceId: selectedInvoiceIdsStr,
    });
  } else {
    parentTableParams.value.invoiceId = undefined;
    childGridApi.grid.remove(childGridApi.grid.getFullData());
  }

  calculateSummarize();
}

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
      label: '',
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

function submit() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认提交吗？`,
    onOk: async () => {
      try {
        await submitInvoice({
          invoiceId: JSON.stringify(
            selectedRows.map(({ invoiceId }) => invoiceId),
          ),
        });

        message.success('提交成功');

        parentGridApi.query();
        parentTableParams.value.invoiceId = undefined;
        childGridApi.grid.remove(childGridApi.grid.getFullData());
      } catch {
        message.error('提交失败');
      }
    },
  });
}

function voiding() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  if (selectedRows.length > 1) {
    message.error('发票号不支持批量作废，请只选择一条数据！');
    return;
  }

  invoiceRejectModalApi
    .setData({
      title: '作废原因',
      form: {},
      submit: (params) =>
        invalidatInvoice({
          invoiceId: selectedRows[0].invoiceId,
          ...params,
        }),
    })
    .open();
}

// 父表 - 修改发票号对话框
const [ModifyInvoiceModal, modifyInvoiceModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

// 父表 - 修改发票号
function modifyInvoiceNo() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  if (selectedRows.length > 1) {
    message.error('发票号不支持批量修改，请只选择一条数据！');
    return;
  }

  modifyInvoiceModalApi
    .setData({
      title: '修改发票号',
      form: {
        taxInvoiceNo: selectedRows[0]?.taxInvoiceNo,
        taxInvoiceTypeNo: selectedRows[0]?.taxInvoiceTypeNo,
        dateInvoiced: selectedRows[0]?.dateInvoiced,
      },
      submit: (params: Record<number | string, any>) =>
        modifyInovinceNo({
          ...params,
          invoiceId: parentTableParams.value.invoiceId,
        }),
    })
    .open();
}

// 父表 - 合并发票对话框
const [MergeInvoiceModal, mergeInvoiceModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: mergeInvoiceModalComp,
  draggable: true,
});

// 父表 - 合并发票
function mergeInvoice() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }

  mergeInvoiceModalApi
    .setData({
      invoiceId: selectedRows.map(({ invoiceId }) => invoiceId),
    })
    .open();
}

// 子表 - 拆分发票行
function splitInvoiceLine() {
  const selectedRows = childGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条行记录！');
    return;
  }
  // console.log('selectedRows', selectedRows);
  // 判断选中的行是否属于同一个 invoiceId
  const invoiceId = [...new Set(selectedRows.map((row) => row.invoiceId))];
  if (invoiceId.length > 1) {
    message.error('所选单据包含不同订单，不支持拆分开具发票，请重新选择！');
    return;
  }

  modifyInvoiceModalApi
    .setData({
      title: '拆分发票行',
      form: {},
      submit: (params: Record<number | string, any>) =>
        modifyInvoiceLineNo({
          ...params,
          invoiceId: parentTableParams.value.invoiceId,
          invoiceLineId: JSON.stringify(
            selectedRows.map(({ invoiceLineId }) => invoiceLineId),
          ),
        }),
    })
    .open();
}

/**
 * 页面弹窗表单配置
 */
const modificationFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'taxInvoiceNo',
      label: '发票号码',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'taxInvoiceTypeNo',
      label: '发票代码',
      // rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'dateInvoiced',
      label: '发票日期',
      rules: 'required',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
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
        <MergeInvoiceModal :after-submit="parentGridApi.query" />
        <ModifyInvoiceModal
          :form-options="modificationFormOptions"
          :after-submit="parentGridApi.query"
        />
        <InvoiceRejectModal
          :form-options="rejectionFormOptions"
          :after-submit="parentGridApi.query"
        />
        <ParentGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="submit"
              data-testid="button_submit"
            >
              提交
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              danger
              ghost
              type="primary"
              @click="voiding"
              class="mr-[0.5rem]"
              data-testid="button_voiding"
            >
              作废
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              @click="modifyInvoiceNo"
              class="mr-[0.5rem]"
              data-testid="button_modifyInvoiceNo"
            >
              修改发票号
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              @click="mergeInvoice"
              class="mr-[0.5rem]"
              data-testid="button_mergeInvoice"
            >
              合并发票
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
          </template>
          <template #toolbar-tools>
            <!-- <span>
              已选发票金额合计:
              <span
                style="color: red"
                v-text="selectedAmount"
              ></span>
              元
            </span> -->
            <Summarize ref="summarizeRef" />
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <ChildGrid>
          <template #toolbar-actions>
            <div class="mr-4 flex items-center justify-start">
              <AntdInput
                v-model:value="queryFormOfChild.documentNo"
                class="mr-[0.5rem] w-[240px]"
                placeholder="请输入源单据号"
                @keyup.enter="handleChildSearch"
                allow-clear
                data-testid="input_documentNo"
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
            </div>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="splitInvoiceLine"
              data-testid="button_splitInvoiceLine"
            >
              拆分发票行
            </Button>
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
