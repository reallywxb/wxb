<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
const summary = reactive({
  totalAmt: 0, // 总金额汇总
  totalQty: 0, // 总数量汇总
  lineAmtPricelist: 0, // 零售金额汇总
  lineAmt: 0, // 采购金额汇总
  lineAmtPriceAsi: 0, // 批次采购金额汇总
});
const departmentId = ref<number | string>('');
// 父表
const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // commonConfig: {
      //   labelClass: 'w-[90px]',
      // },
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
    id: 'receiveQueryDetail',
    // api地址
    queryUrl: 'inoutAction/queryFinDetailNew.do?queryType=shipment',
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'movementDate',
        title: '出库日期',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'inoutNo',
        title: '出库单号',
        minWidth: '110',
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
        title: '出库仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '业务单位',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        //			"field": "workTypeName",
        //			"field": "docTypeName",
        title: '出库类型',
        minWidth: '100',
        sortable: true,
      },
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
        field: 'lot',
        title: '批号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '数量',
        minWidth: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价(元)',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '采购金额(元)',
        minWidth: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceAsi',
        title: '批次采购价(元)',
        minWidth: '130',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmtPriceAsi',
        title: '批次采购金额(元)',
        minWidth: '145',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价(元)',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmtPricelist',
        title: '零售金额(元)',
        minWidth: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '发货人',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '商品组',
        visible: userStore.userInfo?.isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productCategoryName',
        title: '商品类别',
        minWidth: '100',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '出库日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        // formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            autoChooseFirstOption: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(val: any) {
              departmentId.value = val;
            },
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
            dictUrl: '/baseHandleAction/warehouse.do',
            // showSearch: true,
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId', 'regionId'],
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
          triggerFields: ['departmentId', 'regionId'],
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
                regionId: values.departmentId,
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
        // formItemClass: 'pl-[10px] pr-[10px]',
        // labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '仓库',
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
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       dictUrl: '/inoutAction/movementType.do?type=out',
      //       placeholder: '请选择',
      //       paginate: false,
      //       showChooseAll: '',
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   defaultValue: '',
      //   fieldName: 'docType',
      //   label: '出库类型',
      // },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            mode: 'multiple',
            maxTagCount: 1,
            options: [
              { value: '', label: '全部' },
              { value: 'C+', label: '科室退回' },
              { value: 'C-', label: '科室消耗' },
              { value: 'M-', label: '调拨出库' },
              { value: 'M+', label: '调拨入库' },
              { value: 'PC-', label: '患者发药' },
              { value: 'PC+', label: '患者退药' },
            ],
            placeholder: '请选择出库类型',
            paginate: false,
            filterByFrontEnd: true,
            onChange(val: any) {
              // 如果选择了全部
              if (val.includes('')) {
                parentGridApi.formApi?.setFieldValue('docType', ['']);
              }
            },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'docType',
        label: '出库类型',
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       dictUrl: '/baseHandleAction/vendor.do',
      // apiType: 'post',
      // requestContentType: 'application/x-www-form-urlencoded',
      //       showSearch: true,
      //       placeholder: '请选择供应商',
      //       paginate: false,
      //       // allowClear: true,
      //       filterByFrontEnd: true,
      //       // onChange(val: any, option: any) {
      //       //   extParams.value.bpartnerId_text = option.name;
      //       // },
      //       // mode: 'multiple',
      //       showChooseAll: '',
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   fieldName: 'vendorId',
      //   label: '供应商',
      // },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=3,4',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择业务单位',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '业务单位',
      },
      {
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/productAction/productControlLevelList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择商品组',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'productControlLevel',
        label: '商品组',
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       defaultValue: '',
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: '请选择',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       // onChange(val: any, option: any) {
      //       //   extParams.value.isPrecious_text = option.label;
      //       // },
      //       showChooseAll: '',
      //       immediate: true,
      //     };
      //   },
      //   fieldName: 'isBulkPurchase',
      //   label: '带量采购',
      // },
      {
        component: 'ChcSelect',
        fieldName: 'productCategoryId',
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
        fieldName: 'isAdj',
        label: '是否调价',
        component: 'ChcSelect',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
        },
        defaultValue: 'N',
      },
    ],
    beforeFetchFn(params) {
      const newParams = { ...params };
      if (
        newParams.docType &&
        Array.isArray(newParams.docType) &&
        newParams.docType.length > 0
      ) {
        newParams.docType = newParams.docType.includes('')
          ? ''
          : newParams.docType.join(',');
      }
      return {
        ...newParams,
      };
    },
    afterFetchFn(params: any) {
      Object.assign(summary, {
        totalAmt: params.summaryRow.totalAmt,
        totalQty: params.summaryRow.totalQty,
        lineAmtPricelist: 0,
        lineAmt: 0,
        lineAmtPriceAsi: 0,
      });

      for (const row of params.rows) {
        summary.lineAmt += Number.parseFloat(row.lineAmt);
        summary.lineAmtPricelist += Number.parseFloat(row.lineAmtPricelist);
        summary.lineAmtPriceAsi += Number.parseFloat(row.lineAmtPriceAsi);
      }
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
      label: '总数量汇总',
      value: summary.totalQty,
      style: 'color: red;',
      noUnit: true,
    },
    {
      label: '总金额汇总',
      value: summary.totalAmt,
      style: 'color: red;',
    },
    {
      label: '批次采购金额汇总',
      value: summary.lineAmtPriceAsi,
      style: 'color: red;',
    },
    {
      label: '采购金额汇总',
      value: summary.lineAmt,
      style: 'color: red;',
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
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
        </Button>
      </template>
      <template #toolbar-tools>
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
        <!-- <span class="mr-[0.5rem]">
          总数量汇总:
          <span style="color: red" v-text="summary.totalQty.toFixed(2)"></span>
          元
        </span>
        <span class="mr-[0.5rem]">
          总金额汇总:
          <span style="color: red" v-text="summary.totalAmt.toFixed(2)"></span>
          元
        </span>

        <span class="mr-[0.5rem]">
          零售金额汇总:
          <span
            style="color: red"
            v-text="summary.lineAmtPricelist.toFixed(2)"
          ></span>
          元
        </span>
        <span class="mr-[0.5rem]">
          批次采购金额汇总:
          <span
            style="color: red"
            v-text="summary.lineAmtPriceAsi.toFixed(2)"
          ></span>
          元
        </span>
        <span class="mr-[0.5rem]">
          采购金额汇总:
          <span style="color: red" v-text="summary.lineAmt.toFixed(2)"></span>
          元
        </span> -->
      </template>
    </ParentGrid>
  </Page>
</template>
