<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { cloneDeep, isEmpty, isFunction, isObject } from '@vben/utils';

import { Button, InputNumber } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import { formSchema } from './options';
import PackageDetailModalComp from './packageDetailModal.vue';
import Summarize from './summarize.vue';

const route = useRoute();
const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const orderType = urlParams.orderType || '';
const movementType = urlParams.movementType || '';
const returnNegative = urlParams.returnNegative || '';
const isExchange = urlParams.isExchange || '';
const isNarcotic = urlParams.isNarcotic || undefined;
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  chcGridApi.query({ ...formValues });
});
onMounted(() => {
  if (isFromTraceSearchPage.value) {
    searchController.sign(3);
  }
});
const extParams = ref<any>({
  isNarcotic,
  specShowType: 'warehouse',
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};

// 辅助函数
function resolvePropsFn(cp: any): () => any {
  return isFunction(cp) ? cp : () => (isObject(cp) ? cp : {});
}

// 处理表单院区和仓库级联
const handleFormSchema = () => {
  // 深拷贝
  const schema = cloneDeep(formSchema);
  schema?.forEach((item: any) => {
    if (item.fieldName === 'departmentId') {
      const baseFn = resolvePropsFn(item.componentProps);
      item.componentProps = () => {
        const props = baseFn() as any;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props,
          allowClear: true,
          afterFetch: (res: any, ...rest: any[]) => {
            chcGridApi.formApi?.setFieldValue(
              'departmentId',
              isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
            );
            const result = isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
            if (!isFirstLoaded.value) {
              searchController.sign(1);
            }
            return result;
          },
        };
      };
    }
    if (item.fieldName === 'warehouseId') {
      const baseFn = resolvePropsFn(item.componentProps);
      item.componentProps = () => {
        const props = baseFn() as any;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props,
          immediate: false,
          afterFetch: (res: any, ...rest: any[]) => {
            chcGridApi.formApi?.setFieldValue(
              'warehouseId',
              isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
            );
            const result = isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
            if (!isFirstLoaded.value) {
              searchController.sign(2);
            }
            return result;
          },
        };
      };
      item.dependencies = {
        triggerFields: ['departmentId', 'regionId'],
        trigger(values: Record<string, any>) {
          nextTick(() => {
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
                chcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
              }
            }
          });
        },
      };
    }
    // 如果是追溯查询页面跳转并且（4）并且将置空申请时间、仓库信息并自动填入申请单号进行查询。
    if (isFromTraceSearchPage.value) {
      if (item.fieldName === 'date') {
        item.defaultValue = [];
      }
      if (item.fieldName === 'inoutNo') {
        item.defaultValue = route.query?.inoutNo;
      }
    }
  });
  return schema;
};

const [
  ChcGrid,
  chcGridApi,
  { handleExport, PackageDetailModal, packageDetailModalApi },
] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      // virtualYConfig: {
      //   enabled: false,
      // },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {
        // summarizeRef.value.refreshNumber(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ checked }: any) => {
        if (checked) {
          // summarizeRef.value.refreshNumber(
          //   chcGridApi.grid.getCheckboxRecords(),
          // );
        } else {
          // summarizeRef.value.refreshNumber([]);
        }
      },
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
          // summarizeRef.value.refreshNumber([row]);
        }
      },
    },
  },
  {
    gridColumns: [
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
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
        visible: false,
      },
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        field: 'movementDate',
        title: '出库时间',
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
        field: 'insurance',
        title: '医保编码',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        minWidth: '150',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        visible: !!isProductControlLevel,
        minWidth: '100',
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
        minWidth: '75',
        slots: {
          default: 'movementQtyDefault',
        },
        // "hover":true,
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
        title: '金额',
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
        field: 'bpartnerName',
        title: orderType === 'PR' ? '供应商' : '收货单位',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'inoutNo',
        title: '出库单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'pickCreatedByName',
        title: '拣货指示人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'poOrderNo',
        title: '原订单号',
        // "hover":true,
        visible: orderType === 'SR',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '发货仓库',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'confirmUsername',
        title: isProductControlLevel ? '发货人' : '第一发货人',
        visible: !!isProductControlLevel,
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'confirmUsername2',
        title: '第二发货人',
        visible: !!isProductControlLevel,
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '100',
        sortable: true,
      },
    ],
    formSchema: handleFormSchema(),
    dataTableId: `inoutAction/queryOutDetail.do?page=output&orderType=${encodeURIComponent(
      orderType,
    )}&movementType=${encodeURIComponent(movementType)}&returnNegative=${
      returnNegative
    }&isExchange=${isExchange}`,
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: false,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      const newParams = { ...params };
      console.warn('newParams', newParams);
      if (
        newParams.queryOrderType &&
        Array.isArray(newParams.queryOrderType) &&
        newParams.queryOrderType.length > 0
      ) {
        newParams.queryOrderType = newParams.queryOrderType
          .map((val: string) => `'${val}'`)
          .join(',');
      }
      return newParams;
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
      // 'ScatterCreateModal-scatterCreateModalApi': {
      //   connectedComponent: ScatterCreateComp,
      // },
    },
  },
);
const summarizeRef = ref();

const handleMovementQtyClick = (scope: any) => {
  packageDetailModalApi!
    .setData({
      // warehouseId: scope.row?.warehouseId,
      // orderPlanLineId: scope.row?.orderPlanLineId,
      ...scope.row,
      type: 'view',
      // checkStatus: type === 'qtyArrived' ? '' : 'Y',
      title: '包装明细查看',
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
