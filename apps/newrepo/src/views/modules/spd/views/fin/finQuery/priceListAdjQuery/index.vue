<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

const summary = reactive({
  amountPOAdjLine: 0, // 进价调价金额汇总
  amountAdjLine: 0, // 零售调价金额汇总
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
      showCollapseButton: false,
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
    id: 'priceListAdjQuery',
    // api地址
    queryUrl: 'productAction/queryPriceListAdjDetail.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'sitePriceListAdjId',
        title: '调价单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'docDate',
        title: '调价时间',
        minWidth: '160',
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
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '原零售价',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceListNew',
        title: '新零售价',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'pricePO',
        title: '原采购价',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'pricePONew',
        title: '新采购价',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyAdjLine',
        title: '调价数量',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'amountAdjLine',
        title: '零售调价金额',
        minWidth: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'amountPOAdjLine',
        title: '进价调价金额',
        minWidth: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'adjNo',
        title: '调价文号',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'adjReason',
        title: '调价原因',
        minWidth: '200',
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
        minWidth: '100',
        sortable: true,
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: $t('system.menu.operation'),
      //   width: 230,
      // },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '调价日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
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
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
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
    ],
    afterFetchFn(params: any) {
      Object.assign(summary, {
        amountAdjLine: 0,
        amountPOAdjLine: 0,
      });

      for (const row of params.rows) {
        summary.amountAdjLine += Number.parseFloat(row.amountAdjLine);
        summary.amountPOAdjLine += Number.parseFloat(row.amountPOAdjLine);
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

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '进价调价金额汇总',
      value: summary.amountPOAdjLine?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '零售调价金额汇总',
      value: summary.amountAdjLine?.toFixed(2),
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
          进价调价金额汇总:
          <span
            style="color: red"
            v-text="summary.amountPOAdjLine.toFixed(2)"
          ></span>
          元
        </span>
        <span class="mr-[0.5rem]">
          零售调价金额汇总:
          <span
            style="color: red"
            v-text="summary.amountAdjLine.toFixed(2)"
          ></span>
          元
        </span> -->
      </template>
    </ParentGrid>
  </Page>
</template>
