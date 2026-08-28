<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

// import { useUserStore } from '@vben/stores';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

const urlParams: any = {
  docType: urlParamsObj?.docType || '',
};

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
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
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'qty',
        title: `${urlParams.docType === 'I-' ? '报损' : '报溢'}数量`,
        sortable: true,
        align: 'right',
        minWidth: '100',
      },
      {
        field: 'price',
        title: '采购价',
        minWidth: '100',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'lineAmt',
        title: `${urlParams.docType === 'I-' ? '报损' : '报溢'}金额`,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
        minWidth: '100',
      },
      {
        field: 'vendorName',
        title: '供应商',
        sortable: true,
        align: 'right',
        minWidth: '180',
      },

      {
        field: 'lot',
        title: '批号',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'productionDate',
        title: '生产日期',
        sortable: true,
        minWidth: '110',
      },
      {
        field: 'productArea',
        title: '产地',
        sortable: true,
        minWidth: '110',
      },
      {
        field: 'locatorName',
        title: '货位',
        sortable: true,
        minWidth: '180',
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        sortable: true,
        minWidth: '110',
      },
      {
        field: 'inventoryReasonName',
        title: '损溢原因',
        sortable: true,
        minWidth: '150',
      },
      { field: 'description', title: '备注', minWidth: '150' },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: `/inventoryAction/queryDetail.do?inventoryReason=06`,
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.inventoryId) {
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
      stripe: true,
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
    queryUrl: `/inventoryAction/query.do?page=query&processed=Y&docType=${encodeURIComponent(
      urlParams.docType,
    )}&validation=EXISTS (SELECT 1 FROM M_Inventoryline ol WHERE o.m_inventory_id=ol.m_inventory_id AND ol.InventoryReason='06')`,
    gridColumns: [
      {
        type: 'radio',
        minWidth: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },

      {
        field: 'inventoryNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'movementDate',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },

      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 200,
        sortable: true,
        title: '仓库',
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

      { field: 'productSpec', title: '规格', minWidth: '200', sortable: true },
      { field: 'manufacturer', title: '厂家', minWidth: '150', sortable: true },
      { field: 'uomName', title: '单位', minWidth: '72', sortable: true },
      {
        field: 'qty',
        title: `${urlParams.docType === 'I-' ? '报损' : '报溢'}数量`,
        sortable: true,
        align: 'right',
        minWidth: '100',
      },
      {
        field: 'totalAmt',
        title: `${urlParams.docType === 'I-' ? '报损' : '报溢'}金额`,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
        minWidth: '100',
      },
      {
        field: 'docStatusName',
        minWidth: 120,
        sortable: true,
        title: '申请状态',
      },
      {
        field: 'rejectReason',
        title: '拒绝原因',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'approveUserName',
        minWidth: 100,
        sortable: true,
        title: '审核人',
      },
      {
        field: 'approveTime',
        minWidth: 160,
        title: '审核时间',
        sortable: true,
      },

      {
        field: 'createdByName',
        minWidth: 90,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'createUserName',
        minWidth: 160,
        title: '创建时间',
        sortable: true,
      },

      // {
      //   field: 'description',
      //   minWidth: 150,
      //   sortable: true,
      //   title: '备注',
      // },
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
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            // showSearch: true,
            placeholder: '请选择申请仓库',
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
        fieldName: 'warehouseId',
        label: '申请仓库',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入编码/拼音码/名称',
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.inventoryId) {
          parentTableParams.value.inventoryId = row.inventoryId;
          selectRow.value = row;
          roleGridApi.reload({ inventoryId: row.inventoryId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.inventoryId = undefined;
          roleGridApi.grid.remove();
          selectRow.value = {};
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
          <ChcGrid class="flex-1 overflow-hidden" />
        </template>
        <template #second>
          <RoleGrid />
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
