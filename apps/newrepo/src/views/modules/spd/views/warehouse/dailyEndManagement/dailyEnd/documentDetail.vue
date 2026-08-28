<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import inoutDetailModalUI from './modals/inoutDetailModal.vue';

const [inoutDetailModal, inoutDetailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: inoutDetailModalUI,
  draggable: true,
});

const parentData = defineModel<any>('parentData', {
  // required: true,
});

const departmentId = ref<number | string>('');
const extParams = ref<any>({
  summaryCols:
    'beginPOAmt,beginPriceListAmt,inStockPOAmt,inStockPriceListAmt,outStockPOAmt,outStockPriceListAmt,adjPOAmt,adjPriceListAmt,pricePODiffAmt,endPOAmt,endPriceListAmt',
});
const summaryRow = ref<any>([]);
// 父表
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      showFooter: true,
      showOverflow: true,
      // footerData: summaryRow.value,
      footerMethod: () => {
        return summaryRow.value;
      },
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        // enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/dailyEndLotAction/queryDailyEndLot.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', field: 'seq', width: 50, align: 'center' },
      // {
      //   field: 'storageDate',
      //   title: '结转日期',
      //   width: '100',
      //   sortable: true,
      // },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },

      { field: 'productSpec', title: '规格', width: '150', sortable: true },
      { field: 'manufacturer', title: '厂家', minWidth: '150', sortable: true },

      { field: 'uomName', title: '单位', width: '72', sortable: true },
      { field: 'lot', title: '批号', width: '90', sortable: true },
      { field: 'guaranteeDate', title: '有效期', width: '90', sortable: true },
      {
        field: 'beginQty',
        title: '期初数量',
        align: 'right',
        width: '100',
        sortable: true,
      },
      {
        field: 'beginPOAmt',
        title: '期初进价金额',
        align: 'right',
        width: '120',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.beginPOAmt);
        },
      },
      {
        field: 'beginPriceListAmt',
        title: '期初零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.beginPriceListAmt);
        },
      },
      {
        field: 'inStockQty',
        title: '总入库数量',
        align: 'right',
        width: '100',
        slots: { default: 'inStockQty' },
        sortable: true,
      },
      {
        field: 'POQty',
        title: '采购入库数量',
        align: 'right',
        width: '130',
        slots: { default: 'POQty' },
        sortable: true,
      },
      {
        field: 'MIQty',
        title: '调拨入库数量',
        align: 'right',
        slots: { default: 'MIQty' },
        width: '130',
        sortable: true,
      },
      {
        field: 'SRQty',
        title: '科退入库数量',
        slots: { default: 'SRQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'PSRQty',
        title: '销退入库数量',
        slots: { default: 'PSRQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'IIQty',
        title: '报溢入库数量',
        slots: { default: 'IIQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'inStockPOAmt',
        title: '入库进价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.inStockPOAmt);
        },
      },
      {
        field: 'inStockPriceListAmt',
        title: '入库零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.inStockPriceListAmt);
        },
      },
      {
        field: 'outStockQty',
        title: '总出库数量',
        align: 'right',
        width: '130',
        slots: { default: 'outStockQty' },
        sortable: true,
      },
      {
        field: 'PRQty',
        title: '采退出库数量',
        align: 'right',
        slots: { default: 'PRQty' },
        width: '130',
        sortable: true,
      },
      {
        field: 'MOQty',
        title: '调拨出库数量',
        align: 'right',
        slots: { default: 'MOQty' },
        width: '130',
        sortable: true,
      },
      {
        field: 'SOQty',
        title: '科领出库数量',
        slots: { default: 'SOQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'PSOQty',
        title: '销售出库数量',
        slots: { default: 'PSOQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'IOQty',
        title: '报损出库数量',
        slots: { default: 'IOQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'outStockPOAmt',
        title: '出库进价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.outStockPOAmt);
        },
      },
      {
        field: 'outStockPriceListAmt',
        title: '出库零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.outStockPriceListAmt);
        },
      },
      {
        field: 'adjPOAmt',
        title: '进价调整金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.adjPOAmt);
        },
      },
      {
        field: 'adjPriceListAmt',
        title: '零售价调整金额',
        align: 'right',
        width: '140',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.adjPriceListAmt);
        },
      },
      {
        field: 'pricePODiffAmt',
        title: '出库价差金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePODiffAmt);
        },
      },
      {
        field: 'endQty',
        title: '期末数量',
        align: 'right',
        width: '110',
        sortable: true,
      },
      {
        field: 'endPOAmt',
        title: '期末进价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.endPOAmt);
        },
      },
      {
        field: 'endPriceListAmt',
        title: '期末零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.endPriceListAmt);
        },
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '200',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DatePicker',
        fieldName: 'dateFrom',
        componentProps: () => {
          return {
            format: 'YYYY-MM-DD',
            valueFormat: 'YYYY-MM-DD',
            defaultValue: parentData.value.storageDate || '',
          };
        },
        label: '申请时间',
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
            labelField: 'name',
            onChange(val: any) {
              departmentId.value = val;
            },
            valueField: 'id',
            afterFetch(res: any) {
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do',
            // showSearch: true,
            triggerFields: ['departmentId', 'regionId'],
            defaultValue: parentData.value.warehouseId || undefined,
            placeholder: '请选择仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // ChcGridApi.formApi?.setFieldValue(
              //   'warehouseId',
              //   res.rows?.[0]?.id || undefined,
              // );

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId || '-1',
                departmentId: values.departmentId || '-1',
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        fieldName: 'warehouseId',
        label: '仓库',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: {
          defaultValue: parentData.value.productCode
            ? `=${parentData.value.productCode}`
            : undefined,
          placeholder: '请输入编码/拼音码/名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        componentProps: {
          placeholder: '请输入批号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            options: [{ value: 'Y', label: '大于0' }],
            placeholder: '请选择结转数量',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'allHasQty',
        label: '结转数量',
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        selectRow.value = row && row.storageStatus ? row : {};
      },
    },
    afterFetchFn: (params) => {
      const rows = params.rows || [];
      rows.forEach((item: any, index: number) => {
        item.seq = index + 1;
      });
      if (params.summaryRow) {
        // rows.push({ ...params.summaryRow, seq: '合计'  });
        summaryRow.value = [{ ...params.summaryRow, seq: '合计' }];
      }
      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
      };
    },
  },
);

const queryparams = (formValues: any) => {
  return {
    warehouseId: formValues.warehouseId || parentData.value.warehouseId,
    productName: formValues.productName || `=${parentData.value.productCode}`,
    dateFrom: formValues.dateFrom || parentData.value.storageDate,
    dateTo: formValues.dateFrom || parentData.value.storageDate,
    departmentId: formValues.departmentId,
    lot: formValues.lot,
    allHasQty: formValues.allHasQty,
  };
};

onMounted(() => {
  if (parentData.value.warehouseId) {
    ChcGridApi.formApi.getValues().then(async (res: any) => {
      const sertchData = queryparams(res);
      ChcGridApi.query(sertchData);
    });
  }
});

const filedName = ref('');
const orderData = ref<any>({});
const handleViewDetail = (row: any, fieldName: string) => {
  orderData.value = row;
  filedName.value = fieldName;
  inoutDetailModalApi.open();
};

const selectRow = ref<any>({});
</script>

<template>
  <Page content-class="p-[0.5rem]" class="h-full">
    <div class="h-full">
      <inoutDetailModal :order-data="orderData" :filed-name="filedName" />
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleExport"
            class="mr-[0.5rem]"
            data-testid="button_export_documentDetail"
          >
            导 出
            <template #icon>
              <ExportActionIcon />
            </template>
          </Button>
        </template>
        <template #inStockQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'inStockQty')"
            :data-testid="`button_inStockQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.inStockQty }}
          </a>
        </template>
        <template #POQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'POQty')"
            :data-testid="`button_POQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.POQty }}
          </a>
        </template>
        <template #MIQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'MIQty')"
            :data-testid="`button_MIQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.MIQty }}
          </a>
        </template>
        <template #SRQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'SRQty')"
            :data-testid="`button_SRQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.SRQty }}
          </a>
        </template>
        <template #PSRQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'PSRQty')"
            :data-testid="`button_PSRQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.PSRQty }}
          </a>
        </template>
        <template #IIQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'IIQty')"
            :data-testid="`button_IIQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.IIQty }}
          </a>
        </template>
        <template #outStockQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'outStockQty')"
            :data-testid="`button_outStockQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.outStockQty }}
          </a>
        </template>
        <template #PRQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'PRQty')"
            :data-testid="`button_PRQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.PRQty }}
          </a>
        </template>
        <template #MOQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'MOQty')"
            :data-testid="`button_MOQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.MOQty }}
          </a>
        </template>
        <template #SOQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'SOQty')"
            :data-testid="`button_SOQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.SOQty }}
          </a>
        </template>
        <template #PSOQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'PSOQty')"
            :data-testid="`button_PSOQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.PSOQty }}
          </a>
        </template>
        <template #IOQty="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleViewDetail(scope.row, 'IOQty')"
            :data-testid="`button_IOQty_${scope.rowIndex}_documentDetail`"
          >
            {{ scope.row.IOQty }}
          </a>
        </template>
      </ChcGrid>
    </div>
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
