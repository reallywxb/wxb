<script lang="ts" setup>
import { h, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { IconfontBasicView } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const searchController = new LazySearch(1, async () => {
  await nextTick();
  // 获取url参数
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  if (urlParams?.autoLoad === 'Y') {
    searchController.sign();
  }
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
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
    id: 'countQuery',
    // api地址
    queryUrl: '/packageAction/queryPackageCount.do',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '120',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
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
        width: '150',
        sortable: true,
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
        field: 'unitPackQtyText',
        title: '每包装数',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCount',
        title: '包数',
        width: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyText',
        title: '数量',
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
        field: 'locatorName',
        title: '货位',
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
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '150',
        sortable: true,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        width: 150,
        align: 'center',
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                type: 'primary',
                ghost: true,
                class: 'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px]',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  router.push({
                    path: '/warehouse/package/query',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: scope.row.productCode,
                      lot: scope.row.lot,
                      vendorId: scope.row.vendorId,
                      unitPackQty: scope.row.unitPackQty,
                      locatorId: scope.row.locatorId,
                      packageStatus: 'S',
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_package_detail_${scope.rowIndex}`,
              },
              {
                default: () => '包装明细',
                icon: () => h(IconfontBasicView),
              },
            );
          },
        },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        defaultValue: route.query.warehouseId
          ? Number.parseFloat(route.query.warehouseId as string)
          : '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: urlParams?.productName || '',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        defaultValue: route.query.lot || '',
      },
      {
        component: 'Input',
        fieldName: 'vendor',
        label: '供应商编码',
        componentProps: () => {
          return {
            placeholder: '编码/名称/搜索码',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'packageType',
        label: '包装类型',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000309',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'locatorValue',
        label: '货位',
        componentProps: () => {
          return {
            placeholder: '',
          };
        },
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      params.packageStatus = 'S';
      return params;
    },
    afterFetchFn: (params) => {
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
    <ChcGrid />
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
