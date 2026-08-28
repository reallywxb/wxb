<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

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
// const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query({
    warehouseId: route.query.warehouseId,
    productName: route.query.productName,
    vendorId: route.query.vendorId,
    lot: route.query.lot,
    attributeSetInstanceId: route.query.attributeSetInstanceId,
  });

  ChcGridApi.formApi.getFieldComponentRef('warehouseId').params.dependencies = {
    departmentId: '-1',
  };
  ChcGridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();

  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  if (route.query.autoLoad === 'Y') {
    searchController.sign();
  }
});
const summaryData = ref<Record<string, any>>({});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        console.warn('handleSubmit formValues', formValues);
        const params = {
          ...toRaw(formValues),
        };
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        if (
          params.neerGuaranteeDays === '' ||
          params.neerGuaranteeDays === null
        ) {
          params.neerGuaranteeDays = 180;
        }
        console.warn('handleSubmit params', params);
        ChcGridApi.reload(params);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
    dataTableId: 'inoutAction/queryDetail.do?inoutNegative=Y&page=trace',
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
        minWidth: '200',
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
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
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
        field: 'vendorName',
        title: '供应商',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '业务日期',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        title: '业务类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '业务数量',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '当时进价',
        minWidth: '90',
        align: 'right',
        format: '0.00##',
        sortable: true,
        //		}, {
        //			"field": "qtyOnHand",
        //			"title": "当时库存",
        //			"minWidth": "100",
        //			align: "right",
        //			"sortable": true
      },
      {
        field: 'bpartnerName',
        title: '业务对象',
        minWidth: '150',
        align: 'right',
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
        title: '仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'inoutNo',
        title: '出入库单号',
        minWidth: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'receiptTypeName',
        title: '采购类型',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'attributeSetInstanceId',
        title: '批次号',
        minWidth: '100',
        sortable: true,
        //		}, {
        //			"field": "asiPrice",
        //			"title": "当前批次价",
        //			"minWidth": "120",
        //			"sortable": true
      },
      {
        field: 'createdByName',
        title: '操作人',
        minWidth: '100',
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
            placeholder: ``,
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
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        defaultValue: route.query.warehouseId
          ? Number.parseFloat(route.query.warehouseId as string)
          : '',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouse.do?readWrite=Y&regionId={{departmentId}}',
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
        triggerFieldKeys: {
          departmentId: 'regionId',
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            if (
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')?.params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId || '-1', // -1表示查所有
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', '');
            }
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

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
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
