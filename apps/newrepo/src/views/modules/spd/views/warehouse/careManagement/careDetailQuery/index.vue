<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
console.warn('userStore.userInfo', userStore.userInfo);
const route = useRoute();

const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    chcGridApi.formApi?.getFieldComponentRef &&
    typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
    chcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};
const fetchSelectOptions = (fieldName: string, params: Record<string, any>) => {
  const c = isFieldComponentRefExist(fieldName);
  if (c) {
    const refInst = chcGridApi.formApi.getFieldComponentRef(
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
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateRange', ['careDateFrom', 'careDateTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
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
      cellStyle: ({ row }: { row: any }) => {
        // 效期小于180天显示红色
        if (row.guaranteeDate) {
          const guaranteeDate = new Date(row.guaranteeDate);
          const currentDate = new Date();
          const daysDiff = Math.ceil(
            (guaranteeDate.getTime() - currentDate.getTime()) / 86_400_000,
          );
          if (daysDiff < 180) {
            return { color: 'red' };
          }
        }
        return {};
      },
    }),
  },
  {
    id: 'careDetailQuery',
    // api地址
    queryUrl: '/productCareAction/queryProductCareDetail.do?page=input',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCareNo',
        title: '养护单号',
        width: '110',
        sortable: true,
      },
      {
        field: 'caredTime',
        title: '养护时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '养护仓库',
        width: '200',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        width: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
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
      {
        field: 'modelNo',
        title: '型号',
        width: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: true,
      },
      {
        field: 'storageQty',
        title: '库存数量',
        width: '90',
        align: 'right',
        sortable: true,
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
        field: 'vendorName',
        title: '供应商',
        width: '180',
        sortable: true,
      },
      {
        field: 'carelevelName',
        title: '养护级别',
        width: 100,
        sortable: true,
      },
      {
        field: 'checkResultName',
        title: '检查结果',
        width: '100',
        sortable: true,
      },
      {
        field: 'careMeasuresName',
        title: '养护措施',
        width: '100',
        sortable: true,
      },
      {
        field: 'qualitystateName',
        title: '质量状况',
        width: '110',
        sortable: true,
      },
      {
        field: 'processproposalName',
        title: '处理建议',
        width: '100',
        sortable: true,
      },
      {
        field: 'checkQty',
        title: '抽检数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '养护时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
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
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: false,
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
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
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y', // 这里注释是因为和下面的依赖触发冲突
            placeholder: '请选择仓库',
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('isFieldComponentRefExist warehouseId', c);
            if (c) {
              const refInst = chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${values?.departmentId || -1}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst.fetchApi();
                }
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
              }
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'docStatus',
        label: '状态',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000586',
            placeholder: '请选择状态',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            autoChooseFirstOption: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn(res: any) {
      return { ...res, rows: undefined, records: res.rows };
    },
  },
);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid />
  </Page>
</template>
