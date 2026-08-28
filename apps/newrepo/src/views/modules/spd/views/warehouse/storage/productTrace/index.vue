<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
const route = useRoute();
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  console.log(
    'searchController formValues',
    JSON.parse(JSON.stringify(formValues)),
  );
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query({
    ...formValues,
    warehouseId: route.query.warehouseId || formValues?.warehouseId,
    productName: route.query.productName || formValues?.productName,
    vendorId: route.query.vendorId || formValues?.vendorId,
    lot: route.query.lot || formValues?.lot,
    attributeSetInstanceId: route.query.attributeSetInstanceId,
  });
});
onMounted(() => {
  if (route.query.autoLoad === 'Y') {
    searchController.sign(3);
  }
});
const summaryData = ref<Record<string, any>>({});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.leaveDays < 90) {
          return { color: 'red' };
        } else if (row.leaveDays <= 180 && row.leaveDays >= 90) {
          return { color: '#8552a1' };
        } else return '';
      },
    }),
  },
  {
    id: 'productTrace',
    // api地址
    queryUrl: 'inoutAction/queryDetail.do?inoutNegative=Y&page=trace',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '130',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '140',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '130',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '业务日期',
        width: '150',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        title: '业务类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '单据类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '业务数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '当时进价',
        width: 120,
        align: 'right',
        formatter: ({ cellValue }) => {
          return cellValue.toFixed(2);
        },
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '业务对象',
        width: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '150',
        sortable: true,
      },
      {
        field: 'inoutNo',
        title: '出入库单号',
        width: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'leftQty',
        title: '结余数量',
        width: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'receiptTypeName',
        title: '采购类型',
        width: '110',
        sortable: true,
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        width: '110',
        sortable: true,
      },
      {
        field: 'attributeSetInstanceId',
        title: '批次号',
        width: '100',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '操作人',
        width: '100',
        align: 'right',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '起止日期',
        defaultValue: [],
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: `请选择院区`,
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              const defaultWarehouseId = route.query.warehouseId
                ? Number.parseFloat(route.query.warehouseId as string)
                : '';
              if (isEmpty(defaultWarehouseId)) {
                ChcGridApi.formApi?.setFieldValue(
                  'departmentId',
                  isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                );
              } else {
                ChcGridApi.formApi?.setFieldValue('departmentId', '');
              }

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
            placeholder: `请选择仓库`,
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (isFirstLoaded.value) {
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                );
              } else {
                const defaultWarehouseId = route.query.warehouseId
                  ? Number.parseFloat(route.query.warehouseId as string)
                  : '';
                if (isEmpty(defaultWarehouseId)) {
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                  );
                } else {
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    defaultWarehouseId,
                  );
                }
              }

              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return {
                ...res,
                rows: undefined,
                records: (res.rows || []).map((item: any) => ({
                  ...item,
                  id: Number.parseFloat(item.id),
                })),
              };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  ChcGridApi?.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }, 100);
              }
            });
          },
        },
      },

      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: route.query.productName || '',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
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
            placeholder: ``,
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
        fieldName: 'productCategoryId',
        label: '药品类别',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/productCategoryList.do',
            placeholder: ``,
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
        defaultValue: route.query.vendorId
          ? Number.parseFloat(route.query.vendorId as string)
          : '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: (res.rows || []).map((item: any) => ({
                  ...item,
                  id: Number.parseFloat(item.id),
                })),
              };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        defaultValue: route.query.lot || '',
        componentProps: () => {
          return {
            placeholder: `批号`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'attributeSetInstanceId',
        label: '批次号',
        defaultValue: route.query.attributeSetInstanceId || '',
        componentProps: () => {
          return {
            placeholder: `批次号`,
            defaultValue: '',
          };
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      console.warn('beforeFetchFn:', params);
      if (isEmpty(params?.neerGuaranteeDays)) {
        params.neerGuaranteeDays = 180;
      }
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      summaryData.value.movementQty = 0;
      params.rows.forEach((item: any) => {
        summaryData.value.movementQty += item.movementQty || 0;
      });
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '合计',
      value: summaryData.value.movementQty,
      noUnit: true,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid>
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
      <template #toolbar-tools>
        <!-- <span>合计：{{ summaryData.movementQty }}</span> -->
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
      </template>
    </ChcGrid>
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
