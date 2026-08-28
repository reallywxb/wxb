<script lang="ts" setup>
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
let docType = urlParams?.docType || '';
if (docType === 'I ') {
  docType = 'I+';
}
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};

const fetchSelectOptions = (fieldName: string, params: Record<string, any>) => {
  const c = isFieldComponentRefExist(fieldName);
  if (c) {
    const refInst = ChcGridApi.formApi.getFieldComponentRef(
      fieldName,
    ) as unknown as SelectComponentRef;
    if (refInst && refInst.params) {
      Object.assign(refInst.params, params);
      if (typeof refInst?.fetchApi === 'function') {
        refInst.fetchApi();
      }
    }
  }
};
let fatherGridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    type: 'checkbox',
    title: '多选',
    width: 50,
    align: 'center',
  },
  {
    field: 'departmentName',
    title: '院区',
    width: '150',
    sortable: true,
  },
  {
    field: 'warehouseName',
    title: `${docType === 'I-' ? '报损' : '报溢'}仓库`,
    width: '170',
    sortable: true,
  },
  {
    field: 'productCode',
    title: '药品编码',
    width: '120',
    sortable: true,
  },
  {
    field: 'productName',
    title: '药品名称',
    width: '200',
    sortable: true,
  },
  {
    field: 'productSpec',
    title: '规格',
    width: '110',
    sortable: true,
  },
  {
    field: 'manufacturer',
    title: '厂家',
    width: '120',
    sortable: true,
  },
  {
    field: 'uomName',
    title: '单位',
    width: '72',
    sortable: true,
  },
  {
    field: 'price',
    title: '采购价',
    width: '90',
    align: 'right',
    sortable: true,
    formatter: ({ cellValue }) => {
      return cellValue.toFixed(2);
    },
  },
  {
    field: 'qty',
    title: `${docType === 'I-' ? '报损' : '报溢'}数量`,
    width: '100',
    align: 'right',
    sortable: true,
  },
  {
    field: 'lineAmt',
    title: `${docType === 'I-' ? '报损' : '报溢'}金额`,
    width: '100',
    align: 'right',
    sortable: true,
    formatter: ({ cellValue }) => {
      return cellValue.toFixed(2);
    },
  },
  {
    field: 'lot',
    title: '批号',
    width: '110',
    sortable: true,
  },
  {
    field: 'guaranteeDate',
    title: '效期',
    width: '110',
    sortable: true,
  },
  {
    field: 'productionDate',
    title: '生产日期',
    width: '110',
    sortable: true,
  },
  {
    field: 'productArea',
    title: '产地',
    width: '110',
    sortable: true,
  },
  {
    field: 'vendorName',
    title: '供应商',
    width: '180',
    sortable: true,
  },
  {
    field: 'storageStatusName',
    title: '存货状态',
    width: '100',
    sortable: true,
  },
  {
    field: 'locatorName',
    title: '货位',
    width: '130',
    sortable: true,
  },
  {
    field: 'inventoryNo',
    title: '申请单号',
    width: '100',
    sortable: true,
  },
  {
    field: 'commitUserName',
    title: '申请人',
    width: '100',
    sortable: true,
  },
  {
    field: 'commitTime',
    title: '申请时间',
    width: '160',
    sortable: true,
  },
  {
    field: 'approveUserName',
    title: '审核人',
    width: '100',
    sortable: true,
  },
  {
    field: 'approveTime',
    title: '审核时间',
    width: '160',
    sortable: true,
  },
  {
    field: 'inventoryReasonName',
    title: '损溢原因',
    width: '150',
    sortable: true,
  },
  {
    field: 'description',
    title: '备注',
    width: '150',
  },
];
fatherGridColumns = fatherGridColumns.filter((item) => {
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
      stripe: false,
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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'outDetailQuery',
    // api地址
    queryUrl: `inventoryAction/queryDetail.do?page=query&processed=Y&docType=${encodeURIComponent(
      docType,
    )}`,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '盘点时间',
        defaultValue: [
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'), // 七天前
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请输入药品名称',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
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
            defaultValue: '',
            autoChooseFirstOption: false,
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign();
                nextTick(() => {
                  fetchSelectOptions('warehouseId', {
                    dictUrl: `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${-1}`,
                  });
                });
              }
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
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            paginate: false,
            showChooseAll: '',
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            onChange(value: any) {
              console.warn('warehouseId onChange', value);
              searchController.sign();
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('isFieldComponentRefExist warehouseId', c);
            if (c) {
              const refInst = ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${values?.departmentId || -1}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst.fetchApi();
                  ChcGridApi?.formApi?.setFieldValue('warehouseId', undefined);
                }
              }
            }
          },
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
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
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
