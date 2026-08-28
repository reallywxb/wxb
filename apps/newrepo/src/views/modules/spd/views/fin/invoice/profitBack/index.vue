<script lang="ts" setup>
import { onMounted } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
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
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'profitBack',
    // api地址
    queryUrl: 'profitBackAction/queryDetail.do',
    gridColumns: [
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
        minWidth: '150',
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
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productCategoryName',
        title: '类别',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '75',
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
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'dateInvoiced',
        title: '发票日期',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'completeTime',
        title: '复核日期',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'qtyInvoiced',
        title: '发票数量',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'invoceLineAmt',
        title: '发票金额',
        minWidth: '100',
        align: 'right',
        format: '0.00##',
        sortable: true,
      },
      {
        field: 'inoutId',
        title: '入库单号',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '入库日期',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '入库数量',
        minWidth: '120',
        summary: true,
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '入库金额',
        minWidth: '120',
        summary: true,
        align: 'right',
        format: '0.00##',
        sortable: true,
      },
      {
        field: 'discountLineAmt',
        title: '折后金额',
        minWidth: '100',
        summary: true,
        align: 'right',
        format: '0.00##',
        sortable: true,
      },
      {
        field: 'profitBackAmt',
        title: '返利金额',
        minWidth: '100',
        align: 'right',
        summary: true,
        format: '0.00##',
        sortable: true,
      },
      {
        field: 'profitBackRate',
        title: '返点',
        minWidth: '90',
        summary: true,
        align: 'right',
        format: '0.00##',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '130',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      userStore.userInfo?.isSaas
        ? {
            component: 'ChcSelect',
            componentProps: () => {
              return {
                dictUrl: '/sys/org/pageOrgList',
                disabled: true,
                paginate: false,
              };
            },
            fieldName: 'orgId',
            label: '机构',
            rules: 'required',
          }
        : undefined,
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
        component: 'DateGroup',
        fieldName: 'movementDate',
        label: '入库时间',
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'bpartnerId',
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
        component: 'ChcSelect',
        fieldName: 'productCategory',
        label: '商品类别',
        componentProps: () => {
          return {
            dictUrl: '/productAction/productCategoryList.do',
            placeholder: `请选择商品类别`,
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
        fieldName: 'invoiceNo',
        label: '发票号',
        componentProps: () => {
          return {
            placeholder: ``,
            defaultValue: '',
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
        fieldName: 'documentNo',
        label: '源单据号',
        component: 'Input',
        componentProps: () => {
          return {};
        },
      },
    ].filter(Boolean),
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
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
    </ParentGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-grid--toolbar-wrapper .vxe-buttons--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
