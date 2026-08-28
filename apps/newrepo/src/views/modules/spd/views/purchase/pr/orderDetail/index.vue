<script lang="ts" setup>
import { nextTick, reactive, ref } from 'vue';
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
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('userStore', userStore);

console.warn('urlParams', urlParams);
// const isFirstLoaded = ref(false); // 是否已初次加载完
const someSum = reactive({
  qtyOrdered: 0,
  lineAmt: 0,
});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
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
    }),
  },
  {
    id: 'orderDetail',
    // api地址
    queryUrl:
      '/orderAction/queryDetail.do?orderType=PR&page=query&specShowType=from&docStatus=CO',
    gridColumns: [
      {
        type: 'seq',
        title: '序号',
        width: '50',
        align: 'center',
      },
      {
        field: 'dateOrdered',
        title: '采退时间',
        width: '120',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '采退供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '100',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      // {
      //   field: 'modelNo',
      //   title: '型号',
      //   width: '90',
      //   sortable: true,
      // },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '100',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '退货数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceActual',
        title: '退货价格',
        align: 'right',
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
        width: '100',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '退货金额',
        width: '100',
        align: 'right',
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
        cellType: 'string',
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '80',
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        width: '120',
        sortable: true,
      },

      {
        field: 'taxinvoiceDate',
        title: '发票日期',
        sortable: true,
        minWidth: '120',
      },
      {
        field: 'vendorName',
        title: '购进供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'returnTypeName',
        title: '退货类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'returnReason',
        title: '退货原因',
        width: '140',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '采退订单号',
        width: '125',
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
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '采退时间',
        defaultValue: [],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        defaultValue: '',
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
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'bpartnerId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: true,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            allowClear: true,
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'bpartnerId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
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
                ChcGridApi.formApi?.getFieldComponentRef('bpartnerId') &&
                ChcGridApi.formApi?.getFieldComponentRef('bpartnerId').params;
              if (cond) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'bpartnerId',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('bpartnerId', undefined);
                ChcGridApi.formApi
                  ?.getFieldComponentRef('bpartnerId')
                  ?.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do?mode=vendor',
            placeholder: '',
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
        componentProps: () => {
          return {
            placeholder: '请输入药品',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '采退单号',
        componentProps: () => {
          return {
            placeholder: '',
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
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      someSum.qtyOrdered = 0;
      someSum.lineAmt = 0;
      ((params.rows || []) as any[]).forEach((item: any) => {
        someSum.qtyOrdered += item.qtyOrdered * 1 || 0;
        someSum.lineAmt += item.lineAmt * 1 || 0;
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
      label: '数量汇总',
      value:
        someSum.qtyOrdered === 0
          ? '-'
          : handlePriceToFixedTwo(someSum.qtyOrdered),
      noUnit: true,
    },
    {
      label: '金额汇总',
      value:
        someSum.lineAmt === 0 ? '-' : handlePriceToFixedTwo(someSum.lineAmt),
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
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
        <!-- <span>
          数量汇总:{{
            someSum.qtyOrdered === 0
              ? '-'
              : handlePriceToFixedTwo(someSum.qtyOrdered)
          }}
        </span>
        <span class="ml-5">
          金额汇总:{{
            someSum.lineAmt === 0 ? '-' : handlePriceToFixedTwo(someSum.lineAmt)
          }}
        </span> -->
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
