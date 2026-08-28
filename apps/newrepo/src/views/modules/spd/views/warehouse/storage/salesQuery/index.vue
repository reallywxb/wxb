<script lang="ts" setup>
import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

// 日期默认值：前七天
const defaultDateFrom = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
const defaultDateTo = dayjs().format('YYYY-MM-DD');

const [ChcGrid, _ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
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
    }),
  },
  {
    id: 'salesQuery',
    queryUrl: '/warehouseSalesStorageAction/query',
    gridColumns: [
      {
        type: 'checkbox',
        title: '',
        width: 50,
        align: 'center',
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productUserCode',
        title: '自定义编码',
        width: '130',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '品名',
        width: '200',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '140',
        sortable: true,
      },
      {
        field: 'productStyleName',
        title: '剂型',
        width: '90',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '120',
        sortable: true,
      },
      {
        field: 'lpackageQty',
        title: '大包装数',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'pricePO',
        title: '采购价',
        width: '80',
        align: 'right',
        formatter: ({ cellValue }: { cellValue: number }) => {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        title: '库存',
        width: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyStoreOnHand',
        title: '大库库存',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyOnDelivery',
        title: '采购在途',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'salesQty',
        title: '销售数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'salesDays',
        title: '销售天数',
        width: '90',
        align: 'right',
        sortable: true,
      },

      {
        field: 'vendorName',
        title: '默认供应商',
        width: '160',
        sortable: true,
      },
      {
        field: 'salesDayAvg',
        title: '日均销量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'isRefrigeration',
        title: '是否冷链',
        width: '90',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'productControlLevelName',
        title: '商品组',
        width: '120',
        sortable: true,
      },
      {
        field: 'maintainDays',
        title: '维持天数',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'bulkPurchase',
        title: '带量采购分类',
        width: '120',
        sortable: true,
      },
      {
        field: 'qtyPlaned',
        title: '集采量',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'totalConsume',
        title: '已采量',
        width: '120',
        align: 'right',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '日期',
        defaultValue: [defaultDateFrom, defaultDateTo],
        componentProps: {
          allowClear: false,
        },
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'orgId',
        label: '机构',
        componentProps: {
          dictUrl: '/baseHandleAction/orgList.do?accessAll=N',
          placeholder: `请选择机构`,
          paginate: false,
          autoChooseFirstOption: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: {
          dictUrl:
            '/baseHandleAction/warehouse.do?accessAll=Y&priorityLevel=Y&level3=N',
          placeholder: `请选择仓库`,
          mode: 'multiple',
          maxTagCount: 1,
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'manufacturer',
        label: '厂家',
        componentProps: () => {
          return {
            placeholder: `请输入厂家`,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {
            placeholder: `名称/编码`,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productUserCode',
        label: '自定义编码',
        componentProps: () => {
          return {
            placeholder: `请输入自定义编码`,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productType',
        label: '药品类型',
        componentProps: () => {
          return {
            dictUrl: '/productAction/productCategoryList.do',
            placeholder: `请选择药品类型`,
            paginate: false,
            showChooseAll: false,
            mode: 'multiple',
            maxTagCount: 1,
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
        component: 'ChcSelect',
        fieldName: 'bulkPurchase',
        label: '带量采购分类',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000563',
            placeholder: `请选择带量采购分类`,
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/refList.do?id=1000244',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择药品组',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: false,
            immediate: true,
            mode: 'multiple',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'productControlLevel',
        labelClass: 'pl-2',
        label: '商品组',
      },
      {
        component: 'Checkbox',
        fieldName: 'isShowZero',
        label: '显示0库存',
        defaultValue: true,
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      const warehouseId = Array.isArray(params.warehouseId)
        ? params.warehouseId.join(',')
        : params.warehouseId;
      const productType = Array.isArray(params.productType)
        ? params.productType.join(',')
        : params.productType;
      const isShowZero = [true, 'Y'].includes(params.isShowZero) ? 'Y' : 'N';
      const productControlLevel = Array.isArray(params.productControlLevel)
        ? params.productControlLevel.join(',')
        : params.productControlLevel;
      return {
        ...params,
        warehouseId: warehouseId || undefined,
        productType: productType || undefined,
        isShowZero: isShowZero,
        productControlLevel: productControlLevel || undefined,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
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
