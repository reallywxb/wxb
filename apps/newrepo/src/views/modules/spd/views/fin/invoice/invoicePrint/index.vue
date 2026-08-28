<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
const parentTableParams = ref<{ [key: string]: any }>({});

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
    id: 'invoicePrint',
    // api地址
    queryUrl: 'invoiceAction/query.do?page=print',
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
        // format: '0.00',
        sortable: true,
        formatter: ({ cellValue }: { cellValue: number | string }) => {
          return handlePriceToFixedTwo(cellValue);
        },
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
      // {
      //   field: 'confirmNo',
      //   title: '复核流水号',
      //   minWidth: '120',
      //   sortable: true,
      // },
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
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId'],
            paginate: false,
            onChange(val: any, option: any) {
              console.warn(val, option);
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values) {
            if (
              parentGridApi.formApi?.getFieldComponentRef &&
              typeof parentGridApi.formApi?.getFieldComponentRef ===
                'function' &&
              parentGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              parentGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              parentGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
              };
              parentGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              parentGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '采购仓库',
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
        component: 'Select',
        componentProps: () => ({
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择',
          defaultValue: '',
        }),
        fieldName: 'isPrinted',
        label: '已打印',
      },
      {
        component: 'Input',
        fieldName: 'confirmNo',
        label: '复核流水号',
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
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'invoicePrint_son',
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
  });
}

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
// 打印损溢结果
const handlePrint = () => {
  const row = parentGridApi.grid.getRadioRecord(true);
  console.warn('handlePrintPlanResultDoc row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const headerId = row.invoiceId;
  Modal.confirm({
    title: '打印提示',
    content: '确认打印发票单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/invoiceAction/printInvoiceDoc.do?id=${[headerId]}`,
      });
    },
    onCancel() {},
  });
};
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
          <!--          <template #toolbar-actions>-->
          <!--            <Button type="primary" @click="handleExport" class="mr-[0.5rem]">-->
          <!--              打印-->
          <!--              <template #icon>-->
          <!--                <ExportActionIcon />-->
          <!--              </template>-->
          <!--            </Button>-->
          <!--          </template>-->
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handlePrint"
              class="mr-[0.5rem]"
              data-testid="button_print"
            >
              打印发票
              <template #icon>
                <SvgPrintFillIcon />
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
<style scoped>
::v-deep(.vxe-grid--toolbar-wrapper .vxe-buttons--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
