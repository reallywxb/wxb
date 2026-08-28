<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import commonFormModalComp from './modals/modifyInvoiceModal.vue';
import dayjs from 'dayjs';
import LazySearch from '#/utils/LazySearch';

// 初始的表单值（用于重置时恢复）
const initialFormValues = ref<Record<string, any>>({});

const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  initialFormValues.value = { ...toRaw(formValues) };
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  chcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  chcGridApi?.formApi?.setValues({
    ...toRaw(initialFormValues.value),
  });
  chcGridApi.formApi.setLatestSubmissionValues({
    ...toRaw(initialFormValues.value),
  });
  chcGridApi.query({ ...toRaw(initialFormValues.value) });
};
const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ['movementRange', ['movementDateFrom', 'movementDateTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',

      submitButtonOptions: {
        content: '查询',
      },
      handleReset: handleFormReset,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        trigger: 'row',
        highlight: true,
        reserve: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle({ row }: any) {
        if (row?.qtyInvoiced < 0) {
          return { color: 'red' };
        }
        return {};
      },
    }),
  },
  {
    id: 'priceAdjustInventoryExport',
    queryUrl: '/invoiceAction/queryDetail',
    formSchema: [
      {
        fieldName: 'dateRange',
        label: '发票日期',
        component: 'DateGroup',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
      },
      {
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi?.formApi?.setFieldValue(
                'departmentId',
                res?.rows?.[0]?.id || '',
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            showSearch: true,
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond = !!(
                chcGridApi?.formApi?.getFieldComponentRef &&
                typeof chcGridApi?.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi?.formApi?.getFieldComponentRef('warehouseId') &&
                chcGridApi?.formApi?.getFieldComponentRef('warehouseId').params
              );
              if (cond) {
                const refInst =
                  chcGridApi?.formApi?.getFieldComponentRef('warehouseId');
                refInst.params.dependencies = {
                  departmentId: values?.departmentId || -1,
                  regionId: values?.regionId || -1,
                };
                chcGridApi?.formApi?.setFieldValue('warehouseId', '');
                refInst?.fetchApi?.();
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
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
          defaultValue: '',
        }),
        fieldName: 'docStatus',
        label: '发票状态',
      },
      {
        fieldName: 'returnDoc',
        label: '退货标记',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            placeholder: '全部',
            defaultValue: '',
            allowClear: true,
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'bpartnerId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '请选择供应商',
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
          return {};
        },
      },
      {
        fieldName: 'productName',
        label: '商品',
        component: 'Input',
        componentProps: () => {
          return {};
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
    ],
    gridColumns: [
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'dateInvoiced',
        title: '发票日期',
        minWidth: 110,
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号码',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'docStatus',
        title: '状态',
        minWidth: 80,
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
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
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: 60,
        sortable: true,
      },

      {
        field: 'qtyInvoiced',
        title: '数量',
        minWidth: 80,
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceActual',
        title: '价格',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lineAmt',
        title: '金额',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: 100,
        sortable: true,
      },

      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 100,
        sortable: true,
      },
    ],
    showZoomBtn: true,
    showCustomBtn: true,
    beforeFetchFn(params) {
      return {
        ...params,
        showPositive: 'N',
        isPriceAdj: 'Y',
      };
    },
    afterFetchFn: (res: any) => {
      return {
        ...res,
        records: res.rows,
      };
    },
  },
);

const [ModifyInvoiceModal, modifyInvoiceModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  connectedComponent: commonFormModalComp,
  draggable: true,
});

function handleModifyInvoiceNo() {
  const selectedRows = chcGridApi.grid.getCheckboxRecords(true);
  if (selectedRows.length === 0) {
    message.warning('请先选择数据');
    return;
  }

  modifyInvoiceModalApi
    .setData({
      rows: toRaw(selectedRows),
      callback: async () => {
        const formValues = await chcGridApi?.formApi?.getValues();
        chcGridApi.query({ ...formValues });
      },
    })
    .open();
}
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ModifyInvoiceModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleModifyInvoiceNo"
        >
          修改发票号
        </Button>
        <Button type="primary" class="mr-[0.5rem]" @click="handleExport">
          导出
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
