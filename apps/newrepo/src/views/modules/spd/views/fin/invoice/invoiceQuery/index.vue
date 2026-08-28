<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

const route = useRoute();
const userStore = useUserStore();
const parentTableParams = ref<{ [key: string]: any }>({});
// 收货金额合计
const totalInvoiceAmount = ref<string>('0.00');
const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '发票合计金额',
      value: totalInvoiceAmount.value,
      style: 'color: red;',
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
// 父表
const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
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
    id: 'invoiceQuery',
    // api地址
    queryUrl: 'invoiceAction/query.do?page=query',
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
        field: 'createdDate',
        title: '发票创建时间',
        minWidth: '120',
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
        field: 'matchedAmt',
        title: '入库金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
        sortable: true,
      },
      {
        field: 'rejectedAmt',
        title: '拒收金额(元)',
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
        minWidth: '70',
      },

      {
        field: 'isRejectDoc',
        title: '拒收',
        minWidth: '60',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isPriceAdj',
        title: '调价票',
        minWidth: '70',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAdjustDoc',
        title: '调差票',
        minWidth: '70',
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
        defaultValue: [
          route.query.invoiceId
            ? null
            : dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
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
        component: 'DateGroup',
        fieldName: 'completeTime',
        label: '复核时间',
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
        label: '药品',
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
        component: 'Input',
        fieldName: 'invoiceId',
        label: '发票单号',
        componentProps: () => {
          return {
            placeholder: '请输入',
          };
        },
        defaultValue: route.query.invoiceId,
      },
      {
        component: 'Select',
        componentProps: () => ({
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'WA', label: '待确认' },
            { value: 'WU', label: '待提交' },
            { value: 'CO', label: '已确认' },
            { value: 'NA', label: '未批准' },
            { value: 'VO', label: '已作废' },
          ],
          placeholder: '请选择',
        }),
        defaultValue: route.query.invoiceId ? '' : 'CO',
        fieldName: 'docStatus',
        label: '发票状态',
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
        componentProps: () => ({
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: '1', label: '货票同行' },
            { value: '2', label: '结算单' },
            { value: '3', label: '后开票' },
          ],
          placeholder: '请选择',
        }),
        defaultValue: '',
        fieldName: 'invoiceMethod',
        label: '开票方式',
      },
      {
        fieldName: 'isPriceAdj',
        label: '是否调价发票',
        component: 'ChcSelect',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          defaultValue: '',
        },
      },
      {
        fieldName: 'isAdjustDoc',
        label: '是否调差发票',
        component: 'ChcSelect',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          defaultValue: '',
        },
      },
      {
        fieldName: 'isReturnDoc',
        label: '是否退货',
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择',
          defaultValue: '',
        },
      },
    ],
    gridEvents: {
      radioChange({ row }: { row: any }) {
        if (row?.invoiceId) {
          parentTableParams.value.invoiceId = row.invoiceId;
          childGridApi.reload({
            invoiceId: row.invoiceId,
            productName: productName.value,
          });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.invoiceId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      totalInvoiceAmount.value = handlePriceToFixedTwo(params?.totalAmt || 0);
      setTimeout(() => {
        calculateSummarize();
      }, 100);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表查询参数
const INITIAL_QUERY_FORM_OF_CHILD = {
  documentNo: '',
};
const queryFormOfChild = reactive<{
  documentNo: string;
}>({
  ...INITIAL_QUERY_FORM_OF_CHILD,
});
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
          title: '数量',
          minWidth: '80',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qtyMatched',
          title: '入库数量',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qtyRejected',
          title: '拒收数量',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'priceActual',
          title: '价格',
          minWidth: '80',
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
    id: 'invoiceQuery_son',
    dataTableId: 'invoiceAction/queryLine.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
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

const productName = ref('');

function handleChildSearch() {
  childGridApi.reload({
    invoiceId: parentTableParams.value.invoiceId,
    productName: productName.value,
    ...queryFormOfChild,
  });
}

onMounted(() => {
  parentGridApi.formApi.setFieldValue('invoiceId', route.query.invoiceId);

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
        <ParentGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleExport"
              class="mr-[0.5rem]"
              data-testid="button_export"
            >
              导出
              <template #icon>
                <ExportActionIcon />
              </template>
            </Button>
          </template>
          <template #toolbar-tools>
            <Summarize ref="summarizeRef" />
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
            <Input
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
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
</template>
