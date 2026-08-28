<script setup lang="ts">
import type { Ref } from 'vue';

import { h, inject, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import prepareDetailModal from '../modals/prepareDetailModal.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const router = useRouter();
const route = useRoute();

const urlParams = route.meta?.urlParams || {}; // 路由给过来的参数

const fatherTableCheckedRow = inject<Ref<Record<string, any>>>(
  'fatherTableCheckedRow',
);
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
const [PrepareDetailModal, PrepareDetailModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: prepareDetailModal,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.neerGuaranteeDate === 'Y') {
          return { color: 'red' };
        }
        return {};
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      // {
      //   field: 'unitPackQty',
      //   title: '定数',
      //   // width: '60',
      //   align: 'right',
      //   sortable: true,
      // },
      {
        field: 'packageCountAvailable',
        title: '可用包数',
        // width: '80',
        align: 'right',
        sortable: false,
      },
      {
        field: 'packageCountOnHand',
        title: '在库包数',
        // width: 120,
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  router.push({
                    // path: '/warehouse/storage/detailQuery',
                    path: '/warehouse/package/query',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: `=${scope.row.productCode}`,
                      //	          			  lot:data.data.lot?'='+data.data.lot:'',
                      //	            		  vendorId:data.data.vendorId,
                      //	            		  locatorValue:'='+data.data.locatorValue,
                      storageStatus: scope.row.storageStatus,
                      packageStatus:
                        scope.column.field === 'packageCountOnHand' ||
                        scope.column.field === 'qtyOnHand'
                          ? 'S'
                          : 'M',
                      unitPackQty: scope.row.unitPackQty,
                    },
                  });
                },
                'data-testid': `button_package_count_on_hand_${scope.rowIndex}_packageSummaryTable`,
              },
              { default: () => scope.row.packageCountOnHand },
            );
          },
        },
      },
      {
        field: 'packageCountPrepared',
        title: '预配包数',
        // width: '80',
        align: 'right',
        sortable: false,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  PrepareDetailModalApi.setData({
                    row: scope.row,
                    tabVal: 'packageSummary',
                    modalTitle: '预配明细',
                    queryParams: {
                      warehouseId: scope.row.warehouseId,
                      productId: scope.row.productId,
                      storageStatus: scope.row.storageStatus,
                      unitPackQty: scope.row.unitPackQty,
                    },
                  }).open();
                },
                'data-testid': `button_package_count_prepared_${scope.rowIndex}_packageSummaryTable`,
              },
              { default: () => scope.row.packageCountPrepared },
            );
          },
        },
      },
      {
        field: 'packageCountPicking',
        title: '拣货中包数',
        // width: '100',
        align: 'right',
        sortable: false,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  router.push({
                    path: '/warehouse/package/query',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: `=${scope.row.productCode}`,
                      storageStatus: scope.row.storageStatus,
                      unitPackQty: scope.row.unitPackQty,
                      isPicking: 'Y', // 已被拣货
                    },
                  });
                },
                'data-testid': `button_package_count_picking_${scope.rowIndex}_packageSummaryTable`,
              },
              { default: () => scope.row.packageCountPicking },
            );
          },
        },
      },
      {
        field: 'packageCountMoving',
        title: '在途包数',
        // width: 120,
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  router.push({
                    path: '/warehouse/package/query',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: `=${scope.row.productCode}`,
                      //	          			  lot:data.data.lot?'='+data.data.lot:'',
                      //	            		  vendorId:data.data.vendorId,
                      //	            		  locatorValue:'='+data.data.locatorValue,
                      storageStatus: scope.row.storageStatus,
                      packageStatus:
                        scope.column.field === 'packageCountOnHand' ||
                        scope.column.field === 'qtyOnHand'
                          ? 'S'
                          : 'M',
                      unitPackQty: scope.row.unitPackQty,
                    },
                  });
                },
                'data-testid': `button_package_count_moving_${scope.rowIndex}_packageSummaryTable`,
              },
              { default: () => scope.row.packageCountMoving },
            );
          },
        },
      },
    ],
    id: 'storageQuery_packageSummary',
    queryUrl: '/packageAction/queryUnitPackStorage.do',
    beforeFetchFn: (params) => {
      if (!fatherTableCheckedRow?.value?.productId) {
        return false;
      }
      return {
        ...params,
        warehouseId: fatherTableCheckedRow?.value?.warehouseId,
        productId: fatherTableCheckedRow?.value?.productId,
        storageStatus: fatherTableCheckedRow?.value?.storageStatus,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn('currentTab', val, oldVal);
    if (val === props.thisTab.value && !isEmpty(fatherTableCheckedRow?.value)) {
      ChcGridApi.reload({
        warehouseId: fatherTableCheckedRow?.value?.warehouseId,
        productId: fatherTableCheckedRow?.value?.productId,
        storageStatus: fatherTableCheckedRow?.value?.storageStatus,
      });
    }
  },
);
defineExpose({
  query() {
    // 子表请求
    console.warn('定数汇总');
    ChcGridApi.reload({
      warehouseId: fatherTableCheckedRow?.value?.warehouseId,
      productId: fatherTableCheckedRow?.value?.productId,
      storageStatus: fatherTableCheckedRow?.value?.storageStatus,
    });
  },
  reload() {
    ChcGridApi.reload({
      warehouseId: fatherTableCheckedRow?.value?.warehouseId,
      productId: fatherTableCheckedRow?.value?.productId,
      storageStatus: fatherTableCheckedRow?.value?.storageStatus,
    });
  },
  removeData() {
    ChcGridApi?.grid?.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('定数汇总');
  console.warn('urlParams:', urlParams);
});
</script>
<template>
  <div class="h-full">
    <PrepareDetailModal />
    <ChcGrid />
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
