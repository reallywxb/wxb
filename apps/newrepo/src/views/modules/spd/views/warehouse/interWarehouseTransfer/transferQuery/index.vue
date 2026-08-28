<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import LazySearch from '#/utils/LazySearch';

const globalPrintStore = useGlobalPrintStore();
//

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');
const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

const urlParams: any = {
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
};

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi?.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'insurance', title: '医保编码', width: '120', sortable: true },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '120',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
      },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },
      { field: 'productSpec', title: '规格', width: '90', sortable: true },
      { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
      { field: 'uomName', title: '单位', width: '60', sortable: true },
      {
        field: 'qtyOrdered',
        title: '数量',
        width: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyDelivered',
        title: '实发数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyReceived',
        title: '实收数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyRejected',
        title: '拒收数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageNo',
        title: '包装号',
        width: 120,
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: 100,
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: 100,
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: 100,
        sortable: true,
      },
      {
        field: 'pricePO',
        title: '进价',
        width: 100,
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
      },
      {
        field: 'lineStatusName',
        title: '状态',
        width: '80',
        sortable: true,
      },
      {
        field: 'comments',
        title: '关闭说明',
        width: '120',
        sortable: true,
      },
      { field: 'description', title: '备注', width: '150' },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/orderAction//queryLine.do?specShowType=from',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.orderId) {
        return false;
      }

      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: `/orderAction/query.do?orderType=MO&page=workflowApproveorderType=MO&page=query&productControlLevel=${urlParams.productControlLevel}`,
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'dateOrdered',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },
      {
        field: 'toWarehouseName',
        minWidth: 150,
        sortable: true,
        title: '调入仓库',
      },
      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 160,
        sortable: true,
        title: '调出仓库',
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '药品组',
        visible: userStore.userInfo.isProductControlLevel,
      },
      {
        field: 'docStatusName',
        title: '单据状态',
        width: '120',
        visible: !urlParams.hiddenField.includes('priorityTypeName'),
        sortable: true,
      },
      {
        field: 'processStatusName',
        title: '处理状态',
        width: '120',
        visible: urlParams.hiddenField.indexOf('priorityTypeName'),
        sortable: true,
      },
      {
        field: 'createdByName',
        minWidth: 150,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        title: '创建时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'description',
        minWidth: 150,
        title: '备注',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(1, 'week')
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
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择调出仓库',
            paginate: false,
            allowClear: true,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
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
                (ChcGridApi.formApi?.getFieldComponentRef('warehouseId') as any)
                  ?.params;
              if (cond) {
                (
                  ChcGridApi.formApi.getFieldComponentRef('warehouseId') as any
                ).params.dependencies = {
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                (
                  ChcGridApi.formApi?.getFieldComponentRef('warehouseId') as any
                )?.fetchApi();
              }
            });
          },
        },
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '调出仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=N',
            // showSearch: true,
            placeholder: '请选择调入仓库',
            allowClear: true,
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
        fieldName: 'toWarehouseId',
        label: '调入仓库',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          selectRow.value = row;
          roleGridApi.reload({ orderId: row.orderId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          roleGridApi.grid.remove();
          selectRow.value = {};
          // roleGridApi.query({ orderId: row.orderId });
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleSearch = () => {
  roleGridApi.reload({
    orderId: parentTableParams.value.orderId,
    productName: parentTableParams.value.productName,
  });
};

const handlePrint = () => {
  if (!selectRow.value.orderId) {
    message.warn('请选择要打印的调拨单');
    return;
  }
  Modal.confirm({
    title: '打印提示',
    content: '确认打印调拨单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printApplyDoc.do?id=${JSON.stringify(selectRow.value.orderId)}`,
      });
    },
    onCancel() {},
  });
};

const selectRow = ref<any>({});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handlePrint"
                data-testid="button_print_transferQuery"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_product_name_transferQuery"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search_transferQuery"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
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
