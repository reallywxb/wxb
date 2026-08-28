<script setup lang="ts">
import type { Ref } from 'vue';

import { h, inject, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import movingDetailModal from '../modals/movingDetailModal.vue';

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

// 在途明细弹窗
const [MovingDetailModal, MovingDetailModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: movingDetailModal,
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
      {
        field: 'lot',
        title: '批号',
        width: '120',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '80',
        sortable: true,
      },
      // {
      //   field: 'unitPackQty',
      //   title: '定数',
      //   width: '60',
      //   align: 'right',
      //   sortable: true,
      // },
      {
        field: 'packageCountOnHand',
        title: '在库包数',
        width: 120,
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
                      lot: scope.row.lot ? `=${scope.row.lot}` : '',
                      vendorId: scope.row.vendorId,
                      locatorValue: `=${scope.row.locatorValue}`,
                      storageStatus: scope.row.storageStatus,
                      packageStatus:
                        scope.column.field === 'packageCountOnHand' ||
                        scope.column.field === 'qtyOnHand'
                          ? 'S'
                          : 'M',
                      unitPackQty: scope.row.unitPackQty,
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_package_count_on_hand_${scope.rowIndex}_packageTable`,
              },
              { default: () => scope.row.packageCountOnHand },
            );
          },
        },
      },
      {
        field: 'qtyOnHand',
        title: '在库数量',
        width: 120,
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
                    path: '/warehouse/storage/detailQuery',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: `=${scope.row.productCode}`,
                      lot: scope.row.lot ? `=${scope.row.lot}` : '',
                      locatorValue: `=${scope.row.locatorValue}`,
                      vendorId: scope.row.vendorId,
                      storageStatus: scope.row.storageStatus,
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_qty_on_hand_${scope.rowIndex}_packageTable`,
              },
              { default: () => scope.row.qtyOnHand },
            );
          },
        },
      },
      {
        field: 'packageCountMoving',
        title: '在途包数',
        width: 120,
        align: 'right',
        sortable: true,
        // 禅道1601
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
                      lot: scope.row.lot ? `=${scope.row.lot}` : '',
                      vendorId: scope.row.vendorId,
                      locatorValue: `=${scope.row.locatorValue}`,
                      storageStatus: scope.row.storageStatus,
                      packageStatus:
                        scope.column.field === 'packageCountOnHand' ||
                        scope.column.field === 'qtyOnHand'
                          ? 'S'
                          : 'M',
                      unitPackQty: scope.row.unitPackQty,
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_package_count_moving_${scope.rowIndex}_packageTable`,
              },
              { default: () => scope.row.packageCountMoving },
            );
          },
        },
      },
      {
        field: 'qtyMoving',
        title: '在途数量',
        width: 150,
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
                  MovingDetailModalApi.setData({
                    row: scope.row,
                    tabVal: 'lot',
                  }).open();
                },
                'data-testid': `button_qty_moving_${scope.rowIndex}_packageTable`,
              },
              { default: () => scope.row.qtyMoving },
            );
          },
        },
      },
      {
        field: 'price',
        title: '进价',
        // width: '70',
        align: 'right',
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        // width: '200',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        // width: '100',
        sortable: true,
      },
    ],
    id: 'storageQuery_package',
    queryUrl: '/packageAction/queryPackageCount.do',
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
    console.warn('currentTab thisTab', props.thisTab.value);
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
    console.warn('定数明细');
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
  console.warn('定数明细');
  console.warn('urlParams:', urlParams);
});
</script>
<template>
  <div class="h-full">
    <MovingDetailModal />
    <ChcGrid />
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
