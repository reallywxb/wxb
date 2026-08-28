<script lang="ts" setup>
import { ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    }),
  },
  {
    gridColumns: [
      {
        title: '序号',
        minWidth: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productName',
        title: '药品编码/名称',
        minWidth: 200,
        formatter: ({ row }: any) => {
          return `${row.productCode}/${row.productName}`;
        },
      },
      {
        field: 'productSpec',
        title: '规格/型号',
        minWidth: 150,
        formatter: ({ row }: any) => {
          return `${row.productSpec}${row.modelNo && row.modelNo !== row.productSpec ? `/${row.modelNo}` : ''}`;
        },
      },
      { field: 'manufacturer', title: '厂家', minWidth: 120 },
      { field: 'uomName', title: '单位', minWidth: 40 },
      { field: 'replenishPackageQty', title: '定数', minWidth: 40 },
      { field: 'packageCountOrdered', title: '包数', minWidth: 40 },
      { field: 'qtyOrdered', title: '申请数量', minWidth: 70 },
      { field: 'qtyProcess', title: '指示数量', minWidth: 70 },
      { field: 'qtyPo', title: '缺货数量', minWidth: 70 },
      {
        field: 'qtyOnHand',
        title: '可用数量',
        minWidth: 70,
        formatter: ({ row }: any) => {
          return !row.qtyOnHand || row.qtyOnHand < 0 ? '无' : row.qtyOnHand;
        },
      },
      { field: 'storageQty', title: '总库存', minWidth: 70 },
      { field: 'lot', title: '批号', minWidth: 120 },
      { field: 'guaranteeDate', title: '效期', minWidth: 120 },
      { field: 'defaultVendorName', title: '默认供应商', minWidth: 100 },
      { field: 'description', title: '备注', minWidth: 150 },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/orderAction/queryOutputApproveNew.do?specShowType=from',
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid] = useSpdGrid(
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
        autoLoad: true,
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
    queryUrl:
      '/orderAction/queryNew.do?page=createPick&orderType=WO,SO,MO,WR&productControlLevel=',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'priorityRuleName',
        title: '优先级',
        minWidth: 100,
        sortable: true,
      },
      { field: 'orderNo', title: '申请单号', minWidth: 110 },
      { field: 'priorityTypeName', title: '来源类别', minWidth: 110 },
      { field: 'dateOrdered', title: '申请时间', minWidth: 160 },
      { field: 'orderTypeName', title: '申请类型', minWidth: 100 },
      { field: 'bpartnerName', title: '申请单位', minWidth: 150 },
      { field: 'warehouseName', title: '发货仓库', minWidth: 150 },
      { field: 'deliveryPlanDate', title: '要求送达时间', minWidth: 150 },
      { field: 'createdByName', title: '申请人', minWidth: 100 },
      { field: 'siteDocNo', title: '外部单号', minWidth: 110 },
      { field: 'productControlLevelName', title: '管控类型', minWidth: 100 },
      { field: 'description', title: '备注', minWidth: 150 },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'year')
            .subtract(2, 'week')
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      //
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
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level3=N&readWrite=Y',
            placeholder: '请选择发货仓库',
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
        fieldName: 'warehouseId',
        label: '发货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=3,4',
            placeholder: '请选择申请单位',
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
        fieldName: 'bpartnerId',
        label: '申请单位',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            allowClear: true,
            placeholder: '请选择商品',
            dictUrl: '/productAction/query.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            pageSize: 25,
            showSearch: true,
            filterField: 'productName',
            handleParams: (params: any) => {
              return {
                ...params,
                current: undefined,
                pageNum: params.current,
                pageSize: params.size,
                size: undefined,
              };
            },
            labelField: 'productName',
            valueField: 'productName',
            afterFetch: (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'productName',
        label: '商品',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择优先级`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            defaultValue: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'priorityRule',
        label: '优先级',
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          roleGridApi.query({ orderId: row.orderId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          // roleGridApi.query({ orderId: row.orderId });
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleSearch = () => {
  roleGridApi.query({
    orderId: parentTableParams.value.orderId,
    productName: parentTableParams.value.productName,
  });
};
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
          <ChcGrid class="flex-1 overflow-hidden" />
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
                data-testid="input_product_name_doubleTableTemplate"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search_doubleTableTemplate"
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
