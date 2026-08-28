<script setup lang="ts">
import { nextTick, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, InputNumber } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { isEmpty } from '@vben/utils';

import dayjs from 'dayjs';

import PackageDetailModalComp from './components/packageDetailModal.vue';
import Summarize from './components/summarize.vue';

const route = useRoute();

const urlParams: { [key: string]: any } = route.meta?.urlParams || {};

// AI-GENERATED-BEGIN
// @date: 2026-06-29
// @description: 表单提交处理函数
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
// AI-GENERATED-END

const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};

const [
  ChcGrid,
  chcGridApi,
  { handleExport, PackageDetailModal, packageDetailModalApi },
] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
    },
    // 添加表格事件监听
    gridEvents: {
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        }
      },
    },
  },
  {
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },

      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      // AI-GENERATED-BEGIN
      // @date: 2026-06-29
      // @description: 自定义编码字段，需确认后端是否返回此字段
      // AI-GENERATED-END
      {
        field: 'productUserCode',
        title: '自定义编码',
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
        field: 'medicineName',
        title: '通用名',
        minWidth: '130',
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
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '数量',
        minWidth: '75',
        // 注意：仅耗材系统有包装明细
        // slots: {
        //   default: 'movementQtyDefault',
        // },
        sortable: true,
        align: 'right',
      },
      {
        field: 'price',
        title: '采购价',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'lineAmt',
        title: '采购金额',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceList',
        title: '零售价',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'lineAmtPricelist',
        title: '零售金额',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '入库时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        label: '院区',
        fieldName: 'departmentId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        label: '收货仓库',
        fieldName: 'warehouseId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            afterFetch: (res: any) => {
              chcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger: async (values: Record<string, any>) => {
            await nextTick();
            const c =
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
            if (c) {
              const refInst = chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dependencies = {
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                await chcGridApi?.formApi?.setFieldValue('warehouseId', undefined);
                chcGridApi?.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            }
          },
        },
      },
      {
        label: '申请类型',
        fieldName: 'queryOrderType',
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'WO', label: '库房请领' },
              { value: 'WR', label: '库房请退' },
              { value: 'MO', label: '库间调拨' },
              { value: 'SO', label: '科室请领' },
              { value: 'SR', label: '科室请退' },
            ],
            placeholder: '请选择申请类型',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        label: '供应商',
        fieldName: 'vendorId',
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do?readWrite=N',
            placeholder: '请选择供应商',
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
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          allowClear: true,
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productControlLevel',
        label: '药品组',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/productAction/productControlLevelList.do',
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
      },
      {
        label: '药品类别',
        fieldName: 'productCategoryId',
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/productCategoryList.do',
            placeholder: '请选择药品类别',
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
      },
    ],
    queryUrl: `/inoutAction/queryDetailGroupByProduct?page=input&orderType=${encodeURIComponent('WO,MO,WR')}&returnDoc=${encodeURIComponent('')}`,
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'inboundSummaryQuery',
    autoSelectFirstRow: false,
    beforeFetchFn: (params) => {
      return params;
    },
    afterFetchFn: (params) => {
      summarizeRef.value.refreshNumber(params.summaryRow); // 更新合计信息
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'PackageDetailModal-packageDetailModalApi': {
        // 连接抽离的组件
        connectedComponent: PackageDetailModalComp,
      },
    },
  },
);
const summarizeRef = ref();

const handleMovementQtyClick = async (scope: any) => {
  const formValues = await chcGridApi?.formApi?.getValues();
  packageDetailModalApi!
    .setData({
      row: { ...scope.row },
      formValues: {
        ...formValues,
      },
    })
    .open();
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <PackageDetailModal />
    <ChcGrid>
      <template #movementQtyDefault="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleMovementQtyClick(scope)"
          :data-testid="`button_movementQty_${scope.rowIndex}`"
        >
          {{ scope.row.movementQty }}
        </a>
      </template>
      <template #qtyProcessDefault="scope">
        <InputNumber
          v-model:value="scope.row.qtyProcess"
          class="w-full"
          :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}`"
        />
      </template>
      <template #toolbar-tools>
        <Summarize ref="summarizeRef" />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
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
