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
const orderType = urlParams?.orderType || '';
const movementType = urlParams?.movementType || '';
const returnNegative = urlParams?.returnNegative || ''; // 退货显示负数
const isExchange = urlParams?.isExchange || '';
// const isProductControlLevel = computed(() => {
//   return userStore?.userInfo?.isProductControlLevel || false;
// });
console.warn('userStore', userStore);

console.warn('urlParams', urlParams);
// const isFirstLoaded = ref(false); // 是否已初次加载完
const someSum = reactive({
  movementQty: 0,
  lineAmt: 0,
});
const columns: any[] = [
  {
    type: 'seq',
    width: '50',
    align: 'center',
    title: '序号',
  },
  {
    field: 'inoutNo',
    title: '出库单号',
    width: '130',
    sortable: true,
  },
  {
    field: 'movementDate',
    title: '出库时间',
    width: '160',
    sortable: true,
  },
  {
    field: 'productCode',
    title: '药品编码',
    width: '120',
    sortable: true,
  },
  {
    field: 'insurance',
    title: '医保药品编码',
    width: '120',
    sortable: true,
  },
  // {
  //   field: 'standardCode',
  //   title: '贯标编码',
  //   width: '120',
  //   sortable: true,
  // },
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
  // {
  //   field: 'modelNo',
  //   title: '型号',
  //   width: '200',
  //   sortable: true,
  // },
  {
    field: 'manufacturer',
    title: '生产厂家',
    width: '200',
    sortable: true,
  },
  // {
  //   field: 'productControlLevelName',
  //   title: '管控类型',
  //   visible: isProductControlLevel.value,
  //   width: '100',
  //   sortable: true,
  // },
  {
    field: 'uomName',
    title: '单位',
    width: '60',
    sortable: true,
  },
  {
    field: 'movementQty',
    title: '数量',
    width: '60',
    sortable: true,
    align: 'right',
  },
  {
    field: 'lot',
    title: '批号',
    width: '120',
    sortable: true,
    cellType: 'string',
  },
  {
    field: 'guaranteeDate',
    title: '效期',
    width: '120',
    sortable: true,
  },
  {
    field: 'taxInvoiceNo',
    title: '发票号',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'taxInvoiceDate',
    title: '发票日期',
    minWidth: '120',
    sortable: true,
  },
  {
    field: 'bpartnerName',
    title: orderType === 'PR' ? '采退供应商' : '收货单位',
    width: '130',
    sortable: true,
  },
  {
    field: 'orderPrice',
    title: '采退价',
    width: 100,
    sortable: true,
    align: 'right',
  },
  {
    field: 'vendorName',
    title: '购进供应商',
    width: '150',
    sortable: true,
  },
  {
    field: 'costPrice',
    title: '购进价',
    width: '100',
    sortable: true,
    align: 'right',
  },
  {
    field: 'lineAmt',
    title: '汇总金额',
    width: '100',
    sortable: true,
    align: 'right',
  },
  {
    field: 'orderNo',
    title: '订单号',
    width: '100',
    sortable: true,
  },
  // {
  //   field: 'poOrderNo',
  //   title: '原订单号',
  //   hover: true,
  //   visible: orderType === 'SR',
  //   width: '100',
  //   sortable: true,
  //   slots: {
  //     default: (scope: any) => {
  //       return h(
  //         Button,
  //         {
  //           type: 'link',
  //           size: 'small',
  //           'data-testid': `button_view_${scope.rowIndex}`,
  //           onClick: () => {
  //             console.warn('单元格点击 scope', scope);
  //             // TOTO: 旧项目代码 采退订单查询页面无接受页面参数相关代码
  //             router.push({
  //               path: '/purchase/pr/orderQuery',
  //               query: {
  //                 autoLoad: 'Y',
  //                 orderNo: scope.row.poOrderNo,
  //                 isReload: 'Y',
  //               },
  //             });
  //           },
  //         },
  //         {
  //           default: () => '原订单号',
  //         },
  //       );
  //     },
  //   },
  // },
  {
    field: 'departmentName',
    title: '院区',
    width: '150',
    sortable: true,
  },
  {
    field: 'warehouseName',
    title: '发货仓库',
    width: '100',
    sortable: true,
  },
  {
    field: 'confirmUsername',
    title: '发货人',
    width: '120',
    sortable: true,
  },
  {
    field: 'description',
    title: '备注',
    width: '100',
    sortable: true,
  },
].filter((item) => {
  if (
    item.field === 'action' ||
    item.type === 'radio' ||
    item.type === 'checkbox'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
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
    queryUrl: `/inoutAction/queryDetail.do?page=poOutput&orderType=${encodeURIComponent(orderType)}&movementType=${encodeURIComponent(
      movementType,
    )}&returnNegative=${returnNegative}&isExchange=${isExchange}`,
    gridColumns: columns,
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '出库时间',
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
        fieldName: 'warehouseId',
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
                'warehouseId',
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
        fieldName: 'inoutNo',
        label: '出库单号',
        componentProps: () => {
          return {
            placeholder: '',
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
    ],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      someSum.movementQty = 0;
      someSum.lineAmt = 0;
      ((params.rows || []) as any[]).forEach((item: any) => {
        someSum.movementQty += item.movementQty * 1 || 0;
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
      label: '金额汇总',
      value:
        someSum.lineAmt === 0 ? '-' : handlePriceToFixedTwo(someSum.lineAmt),
      noUnit: true,
    },
    {
      label: '数量汇总',
      value:
        someSum.movementQty === 0
          ? '-'
          : handlePriceToFixedTwo(someSum.movementQty),
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
        <!-- <span class="mr-5">
          金额汇总:{{
            someSum.lineAmt === 0 ? '-' : handlePriceToFixedTwo(someSum.lineAmt)
          }}
        </span>
        <span>
          数量汇总:{{
            someSum.movementQty === 0
              ? '-'
              : handlePriceToFixedTwo(someSum.movementQty)
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
