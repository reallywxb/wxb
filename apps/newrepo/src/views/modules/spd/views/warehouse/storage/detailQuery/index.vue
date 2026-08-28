<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, IconfontBasicView } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { router } from '#/router';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { RouteMappingManager } from '../routeMapping';
import { isEmpty } from '@vben/utils';

const userStore = useUserStore();
const route = useRoute();
const routeManager = new RouteMappingManager(route.name as string);
const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as any) || {}; // 路由给过来的参数
console.warn('批次查询 urlParams', urlParams);
console.warn('批次查询 route', route.query);
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi.query({
    ...formValues,
    warehouseId: route.query.warehouseId || formValues?.warehouseId,
    productName: route.query.productName || formValues?.productName,
    isScatter: route.query.isScatter,
    lot: route.query.lot || formValues?.lot,
    vendorId: route.query.vendorId || formValues?.vendorId,
    locatorValue: route.query.locatorValue,
  });
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  if (route.query.autoLoad === 'Y') {
    searchController.sign(3);
  }
});
const someSum = reactive({
  qtyOnHand: 0,
  lineAmt: 0,
  lineAmtPriceAsi: 0,
});
const [ChcGrid, ChcGridApi, { FormModal, LogModal, handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // checkboxConfig: {
      //   highlight: false,
      // },
      // radioConfig: {
      //   trigger: 'row',
      //   highlight: true,
      // },
      stripe: false,
      cellStyle: ({ row }: { row: any }) => {
        if (row.neerGuaranteeDate === 'Y') {
          return { color: 'red' };
        }
        return {};
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'detailQuery',
    // api地址
    queryUrl: `/storageAction/queryStorageDetail.do`,
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
        width: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '140',
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保编码',
        width: '150',
        sortable: true,
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '150',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
      },
      {
        field: 'productionDate',
        title: '生产日期',
        width: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        title: '库存数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyMoving',
        title: '在途数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '200',
        sortable: true,
      },
      {
        field: 'storageConditionName',
        title: '存储条件',
        width: '100',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'receiptDate',
        title: '入库日期',
        width: '100',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        width: '80',
        align: 'right',
        formatter: ({ cellValue }: { cellValue: number }) => {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        width: '80',
        align: 'right',
        formatter: ({ cellValue }: { cellValue: number }) => {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: true,
      },
      {
        field: 'pricePo',
        title: '协议价',
        width: '80',
        align: 'right',
        formatter: ({ cellValue }: { cellValue: number }) => {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '进价金额',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceAsi',
        title: '批次进价',
        width: '90',
        align: 'right',
        formatter: ({ cellValue }: { cellValue: number }) => {
          return cellValue.toFixed(2);
        },
        sortable: true,
      },
      {
        field: 'lineAmtPriceAsi',
        title: '批次进价金额',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '130',
        sortable: true,
      },
      {
        field: 'isPreciousName',
        title: '高值品种',
        width: '90',
        sortable: true,
      },
      {
        field: 'receiptTypeName',
        title: '采购类型',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'invoiceMethodName',
        title: '结算类型',
        width: '100',
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
        field: 'qtyAllocated',
        title: '分配数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'insurancePaymentTypeName',
        title: '医保支付类别',
        width: '120',
        sortable: true,
      },
      {
        field: 'insurancePaymentRate',
        title: '医保自付比例',
        width: '120',
        sortable: true,
      },
      {
        field: 'attributeSetInstanceId',
        title: '批次号',
        width: '100',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        width: '100',
        sortable: true,
      },
      {
        field: 'certificateNo',
        title: '批准文号',
        width: '100',
        sortable: true,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        align: 'center',
        width: 100,
        slots: { default: 'action' },
      },
    ],
    // 表单配置
    formSchema: [
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
        defaultValue: route.query.warehouseId
          ? Number.parseFloat(route.query.warehouseId as string)
          : '',
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
                  ChcGridApi.formApi
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
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        defaultValue: route.query.vendorId
          ? Number.parseFloat(route.query.vendorId as string)
          : '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '',
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
        fieldName: 'locatorValue',
        label: '货位',
        defaultValue: route.query.locatorValue || '',
        componentProps: () => {
          return {
            placeholder: '',
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productControlLevel',
        label: '药品组',
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
        fieldName: 'storageStatus',
        label: '库存状态',

        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
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
        fieldName: 'invoiceMethod',
        label: '结算类型',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000480',
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
        fieldName: 'isBulkPurchase',
        label: '带量采购',
        defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            paginate: false,
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isScatter',
        label: '散件货位',
        defaultValue: route.query.isScatter || '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            paginate: false,
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isPrecious',
        label: '是否高值',
        defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            paginate: false,
            immediate: true,
          };
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      let qtyOnHand = 0;
      let lineAmt = 0;
      let lineAmtPriceAsi = 0;
      (params.rows || []).forEach((item: any) => {
        qtyOnHand += Number.parseFloat(item.qtyOnHand as string) || 0;
        lineAmt += Math.round(
          (Number.parseFloat(item.lineAmt as string) || 0) * 100,
        );
        lineAmtPriceAsi += Math.round(
          (Number.parseFloat(item.lineAmtPriceAsi as string) || 0) * 100,
        );
      });
      someSum.qtyOnHand = qtyOnHand;
      someSum.lineAmt = Math.round(lineAmt) / 100;
      someSum.lineAmtPriceAsi = Math.round(lineAmtPriceAsi) / 100;
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

const goTrace = (row: any) => {
  console.warn('goTrace', row);
  router.push({
    // path: '/warehouse/storage/productTrace',
    path: routeManager.getRoute('inoutProductTrace'),
    query: {
      autoLoad: 'Y',
      warehouseId: row.warehouseId,
      attributeSetInstanceId: row.attributeSetInstanceId,
      isReload: 'Y',
    },
  });
};

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '批次进价金额汇总',
      value: someSum.lineAmtPriceAsi,
    },
    {
      label: '进价金额汇总',
      value: someSum.lineAmt,
    },
    {
      label: '库存数量汇总',
      value: someSum.qtyOnHand,
      noUnit: true,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <LogModal />
    <FormModal />
    <ChcGrid>
      <template #toolbar-tools>
        <!-- <span>批次进价金额汇总:{{ someSum.lineAmtPriceAsi }}</span>
        <span class="mx-5">进价金额汇总:{{ someSum.lineAmt }}</span>
        <span>库存数量汇总:{{ someSum.qtyOnHand }}</span> -->
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
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
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="goTrace(scope.row)"
          :data-testid="`button_trace_${scope.rowIndex}`"
        >
          追溯
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
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
