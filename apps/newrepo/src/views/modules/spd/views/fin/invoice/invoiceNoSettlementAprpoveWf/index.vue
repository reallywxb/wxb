<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { ref, toRaw } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

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
  rejectWorkflow,
} from '#/views/modules/spd/views/fin/invoice/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';
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
    }),
  },
  {
    id: 'invoiceNoSettlementAprpoveWf',
    // api地址
    queryUrl:
      'invoiceAction/query.do?page=workflowApprove&invoiceMethodNotEquals=2',
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
        minWidth: '120',
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
        field: 'wfNodeName',
        title: '审批节点',
        minWidth: '120',
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
        field: 'isAdjustDoc',
        title: '调差',
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
      // {
      //   field: 'isOffline',
      //   title: '是否线下',
      //   minWidth: '100',
      //   hidden: true,
      //   toolbar: '#switchTpl_isOffline',
      //   formatter(value) {
      //     return 'Y' === value ? '是' : '否';
      //   },
      // },
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
        fieldName: 'hospitalId',
        label: '医院',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/hospitalAction/queryHospList?dataType=all',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'hospitalName',
            valueField: 'orgId',
            onChange(val: any, option: any) {
              console.warn('hospitalId', val, option);
              hospitalId.value = val;
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res?.data || [] };
            },
          };
        },
      },
      {
        // 采购仓库
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: $t('fin.settlement.settlementInput.warehouseId'),
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
            placeholder: `请选择${$t('fin.settlement.settlementInput.warehouseId')}`,
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            triggerFields: ['hospitalId'],
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            console.warn('trigger values:', values);
            const cond = !!(
              parentGridApi.formApi &&
              parentGridApi.formApi.getFieldComponentRef
            );
            if (cond) {
              const warehouseIdRef =
                parentGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('warehouseId');
              if (warehouseIdRef) {
                if (values?.hospitalId) {
                  warehouseIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  await warehouseIdRef.fetchApi();

                  parentGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    undefined,
                  );
                } else {
                  warehouseIdRef.clearOptions();
                  parentGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    undefined,
                  );
                }
              }
            }
          },
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
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['hospitalId'],
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
        label: '商品',
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
        fieldName: 'isAdjustDoc',
        label: '调差',
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
      childGridApi.grid.reloadData([]);
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
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'modelNo',
          title: '型号',
          minWidth: '150',
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
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'certificateNo',
          title: '批准文号',
          minWidth: '90',
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
    id: 'invoiceNoSettlementAprpoveWf_son',
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
  const selectedRow = parentGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认批准吗？`,
    onOk: async () => {
      try {
        await approveWorkflow({
          wfActivityId: JSON.stringify([selectedRow.wfActivityId]),
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
  const selectedRow = parentGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }

  invoiceRejectModalApi
    .setData({
      title: '作废原因',
      form: {},
      submit: (params) =>
        rejectWorkflow({
          wfActivityId: JSON.stringify([selectedRow.wfActivityId]),
          ...params,
        }),
    })
    .open();
}

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
        <InvoiceRejectModal
          :form-options="rejectionFormOptions"
          :after-submit="parentGridApi.query"
        />
        <ParentGrid>
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
