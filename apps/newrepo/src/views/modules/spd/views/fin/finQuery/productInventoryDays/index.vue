<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
const departmentId = ref<number | string>('');
const isMounted = ref(true);
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
        // autoLoad: !route.query.warehouseId,
        autoLoad: false,
      },
    }),
  },
  {
    id: 'queryProductTurnOver',
    // api地址
    queryUrl: 'inoutAction/queryProductTurnOver.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '150',
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
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'vendorProductQty',
        title: '供应商',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'inoutQty',
        title: '出库量',
        minWidth: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'inoutAmt',
        title: '出库金额(元)',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'beginInoutAmt',
        title: '期初库存金额(元)',
        minWidth: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'endInoutAmt',
        title: '期末库存金额(元)',
        minWidth: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'turnOverDays',
        title: '库存周转天数',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '日期',
        defaultValue: [
          route.query.dateFrom ||
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(1, 'month')
              .add(1, 'day')
              .format('YYYY-MM-DD'),
          route.query.dateTo || dayjs().format('YYYY-MM-DD'),
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
              if (res.rows?.length && route.query.departmentName) {
                const department = res.rows.find(
                  (item: any) => item.name === route.query.departmentName,
                );
                if (department) {
                  parentGridApi.formApi?.setFieldValue(
                    'departmentId',
                    department.id,
                  );
                }
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
              if (isMounted.value) {
                isMounted.value = false;
                return;
              }
              parentGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
        defaultValue: route.query.warehouseId || null,
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
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

onMounted(() => {
  if (route.query.warehouseId) {
    parentGridApi.formApi.getValues().then((res: any) => {
      parentGridApi.query({ ...res });
    });
  }
});
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
    </ParentGrid>
  </Page>
</template>
