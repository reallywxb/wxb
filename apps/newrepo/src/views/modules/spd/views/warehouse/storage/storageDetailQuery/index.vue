<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
const userStore = useUserStore();
const route = useRoute();
const isFirstLoaded = ref(false); // 是否已初次加载完

// 查询维度选项
const queryDimensionOptions = [
  { label: '批号明细', value: 'detail' },
  { label: '批号汇总', value: 'summary' },
];

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi.query({
    ...formValues,
  });
});

// 汇总行
const summaryRow = reactive<{
  totalQtyOnHand: number | string;
  totalPOAmt: number | string;
  totalPricePOAmt: number | string;
}>({
  totalQtyOnHand: '0.00',
  totalPOAmt: '0.00',
  totalPricePOAmt: '0.00',
});

const [ChcGrid, ChcGridApi, { FormModal, LogModal, handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      rowStyle({ row }: { row: any }) {
        const isNearGuarantee = row.neerGuaranteeDate === 'Y';
        const isShortPo = row?.isShortPo === 'Y';

        if (isNearGuarantee || isShortPo) {
          return {
            color: isNearGuarantee ? 'red' : undefined,
            backgroundColor: isShortPo ? '#ffff00' : undefined,
          };
        }
      },
    }),
  },
  {
    id: 'storageDetailQuery',
    queryUrl: '/storageAction/queryStorageLotByDimension.do',
    gridColumns: [
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productUserCode',
        title: '自定义编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '170',
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
        field: 'qtyOnHand',
        title: '在库数量',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyAvailable',
        title: '可用数量',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'qtyMinOnHand',
        title: '在库最小数量',
        minWidth: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyMinAvailable',
        title: '可用最小数量',
        minWidth: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyMovingIn',
        title: '采购在途',
        minWidth: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'baseUomName',
        title: '最小数量单位',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'qtyMoving',
        title: '院内在途',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyReserved',
        title: '保留数量',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        minWidth: 140,
        sortable: true,
      },
      {
        field: 'priceList',
        title: '当前零售价',
        minWidth: 100,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'priceListAmt',
        title: '库存金额',
        minWidth: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'poAmt',
        title: '进价金额',
        minWidth: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'currentPriceListAmt',
        title: '当前零售金额',
        minWidth: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'storageConditionName',
        title: '存储条件',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'isBulkPurchase',
        title: '带量采购',
        minWidth: 120,
        sortable: true,
        formatter({ cellValue }: any) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'certificateNo',
        title: '批准文号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'insurancePaymentTypeName',
        title: '医保支付类别',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productSign',
        title: '麻精',
        minWidth: 90,
        sortable: true,
        // formatter({ cellValue }: any) {
        //   return cellValue === 'Y' ? '是' : '否';
        // },
      },
      {
        field: 'isDisinfectant',
        title: '消毒液',
        minWidth: 90,
        sortable: true,
        formatter({ cellValue }: any) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      // {
      //   field: 'locatorName',
      //   title: '货位',
      //   minWidth: '130',
      //   sortable: true,
      // },
      {
        field: 'isShortPo',
        title: '是否临采',
        width: 100,
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : cellValue === 'N' ? '否' : '';
        },
      },
      { field: 'totalOnHand', title: '在库总库存', width: 100, sortable: true },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'queryDimension',
        label: '查询维度',
        defaultValue: 'detail',
        componentProps: () => {
          return {
            options: queryDimensionOptions,
            placeholder: '请选择查询维度',
            paginate: false,
            showChooseAll: false,
            allowClear: false,
            immediate: true,
            labelField: 'label',
            valueField: 'value',
            afterFetch(res: any) {
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
        fieldName: 'departmentId',
        label: '院区',
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
              ChcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
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
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(3);
              }
              return { ...res, rows: undefined, records: res.rows };
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
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请输入药品',
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
            placeholder: '',
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
        defaultValue: '',
        fieldName: 'productCategoryId',
        label: '药品类别',
      },
      {
        component: 'ChcSelect',
        fieldName: 'storageStatus',
        label: '库存状态',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            placeholder: '',
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
        defaultValue: '',
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
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'hasCert',
        label: '有无证照',
        defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '有' },
              { value: 'N', label: '无' },
            ],
            placeholder: '',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isBelowLimit',
        label: '低于下限',
        defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'N', label: '否' },
              { value: 'Y', label: '是' },
            ],
            placeholder: '',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productUserCode',
        label: '自定义编码',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请输入自定义编码',
            defaultValue: '',
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'isShowZero',
        label: '显示零库存',
        defaultValue: false,
        componentProps: () => {
          return {
            defaultValue: false,
          };
        },
      },
    ],
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      params.isShowZero = params.isShowZero ? 'Y' : undefined;
      return params;
    },
    afterFetchFn: (params: any) => {
      summaryRow.totalQtyOnHand =
        Math.round((params.summaryRow?.totalQtyOnHand || 0) * 100) / 100;
      summaryRow.totalPOAmt =
        Math.round((params.summaryRow?.totalPOAmt || 0) * 100) / 100;
      summaryRow.totalPricePOAmt =
        Math.round((params.summaryRow?.totalPricePOAmt || 0) * 100) / 100;
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

onMounted(() => {
  console.warn('库存明细查询 onMounted', userStore.userInfo);
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <LogModal />
    <FormModal />
    <ChcGrid>
      <template #toolbar-tools>
        <span>在库数量汇总：{{ summaryRow.totalQtyOnHand }}</span>
        <span class="mx-5"> 库存总金额：{{ summaryRow.totalPOAmt }} </span>
        <span class=""> 进价总金额：{{ summaryRow.totalPricePOAmt }} </span>
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_storageDetailQuery"
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
