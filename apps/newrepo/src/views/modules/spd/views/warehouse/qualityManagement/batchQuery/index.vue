<script lang="ts" setup>
import { ref } from 'vue';
// import { useRoute } from 'vue-router';

// import { useUserStore } from '@vben/stores';
import { Page } from '@vben/common-ui';

import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

// const route = useRoute();
// const urlParamsObj: any = route.meta?.urlParams;
// // console.log(urlParamsObj, 'urlParamsObj');

// const urlParams: any = {
//   specShowType: urlParamsObj?.specShowType || '',
// };

const departmentId = ref<number | string>('');

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
      stripe: true,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/movementAction/queryDetail.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'movementDate',
        title: '移库时间',
        width: '150',
        sortable: true,
      },
      { field: 'createdByName', title: '移库人', width: '120', sortable: true },
      {
        field: 'lockReasonName',
        title: '锁定原因',
        width: '200',
        sortable: true,
      },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },

      { field: 'productSpec', title: '规格', width: '90', sortable: true },
      { field: 'manufacturer', title: '厂家', minWidth: '200', sortable: true },

      { field: 'uomName', title: '单位', width: '60', sortable: true },
      {
        field: 'movementQty',
        title: '移库数量',
        align: 'right',
        width: '90',
        sortable: true,
      },
      { field: 'locatorName', title: '原货位', width: '120', sortable: true },
      {
        field: 'storageStatusName',
        title: '原存货状态',
        width: '120',
        sortable: true,
      },
      {
        field: 'toLocatorName',
        title: '目标货位',
        width: '120',
        sortable: true,
      },
      {
        field: 'toStorageStatusName',
        title: '目标存货状态',
        width: '150',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
        sortable: true,
      },

      {
        field: 'vendorName',
        title: '供应商',
        width: '200',
        sortable: true,
      },
      {
        field: 'movementNo',
        title: '移库库单号',
        width: '150',
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
        width: '200',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '200',
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
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
            labelField: 'name',
            onChange(val: any) {
              departmentId.value = val;
            },
            valueField: 'id',
            afterFetch(res: any) {
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }

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
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            // showSearch: true,
            triggerFields: ['departmentId', 'regionId'],

            placeholder: '请选择仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                res.rows?.[0]?.id || undefined,
              );

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId || '-1',
                departmentId: values.departmentId || '-1',
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        fieldName: 'warehouseId',
        label: '仓库',
      },
      {
        component: 'Input',
        fieldName: 'movementNo',
        label: '移库单号',
        componentProps: {
          placeholder: '请输入移库单号',
        },
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
        if (row && row.storageStatus) {
          selectRow.value = row;
          btnLable.value =
            selectRow.value.storageStatus === 'D' ? '解锁' : '锁定';
        } else {
          selectRow.value = {};
          btnLable.value = '';
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
        start: undefined,
        limit: 0,
      };
    },
  },
);

const btnLable = ref('');

const selectRow = ref<any>({});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden" />
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
