<script setup lang="ts">
import type { Ref } from 'vue';

import { h, inject, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import movingDetailModal from '../modals/movingDetailModal.vue';
import prepareDetailModal from '../modals/prepareDetailModal.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const router = useRouter();
const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const isBelowLimit = urlParams?.isBelowLimit || ''; // 库存预警
const isShowStatus = urlParams?.isShowStatus || 'Y'; // 默认显示库存状态

const fatherTableCheckedRow = inject<Ref<Record<string, any>>>(
  'fatherTableCheckedRow',
);
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
const [MovingDetailModal, MovingDetailModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: movingDetailModal,
});
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
      {
        field: 'lot',
        title: '批号',
        width: '120',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              'span',
              {
                class: 'cursor-default',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  router.push({
                    path: '/warehouse/storage/detailQuery',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: `=${scope.row.productCode}`,
                      lot: scope.row.lot ? `=${scope.row.lot}` : '',
                      storageStatus: scope.row.storageStatus,
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `span_lot_${scope.rowIndex}_lotSummaryTable`,
              },
              { default: () => scope.row.lot },
            );
          },
        },
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: 200,
        sortable: true,
      },
      {
        field: 'qtyMaxOnHand',
        title: '在库数量',
        align: 'right',
        width: 120,
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
                      storageStatus: scope.row.storageStatus,
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_qty_on_hand_${scope.rowIndex}_lotSummaryTable`,
              },
              { default: () => scope.row.qtyMaxOnHand },
            );
          },
        },
      },
      // {
      //   field: 'qtyMaxAvailable',
      //   title: '可用数量',
      //   width: '120',
      //   align: 'right',
      //   sortable: true,
      // },
      {
        field: 'uomName',
        title: '单位',
        width: '90',
        sortable: true,
      },
      {
        field: 'qtyMinOnHand',
        title: '在库最小数量',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyMinAvailable',
        title: '可用最小数量',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'baseUomName',
        title: '最小数量单位',
        width: '120',
        sortable: true,
      },
      {
        field: 'qtyMaxMoving',
        title: '在途数量',
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
                  MovingDetailModalApi.setData({
                    row: scope.row,
                    tabVal: 'lotSummary',
                    modalTitle: '在途明细',
                  }).open();
                },
                'data-testid': `button_qty_moving_${scope.rowIndex}_lotSummaryTable`,
              },
              { default: () => scope.row.qtyMaxMoving },
            );
          },
        },
      },
      {
        field: 'qtyMinMoving',
        title: '在途最小数量',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyBundleAvailable',
        title: '整件可用',
        align: 'right',
        width: '90',
        sortable: false,
      },
      {
        field: 'qtyBundleOnHand',
        title: '整件在库',
        align: 'right',
        width: '90',
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
                      storageStatus: scope.row.storageStatus,
                      packageStatus:
                        scope.column.field === 'qtyBundleOnHand' ? 'S' : 'M',
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_qty_bundle_on_hand_${scope.rowIndex}_lotSummaryTable`,
              },
              { default: () => scope.row.qtyBundleOnHand },
            );
          },
        },
      },
      {
        field: 'qtyBundlePrepared',
        title: '整件预配',
        width: '90',
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
                    tabVal: 'lotSummary',
                    modalTitle: '整件预配明细',
                    queryParams: {
                      warehouseId: scope.row.warehouseId,
                      productId: scope.row.productId,
                      lot: scope.row.lot || '',
                      storageStatus: scope.row.storageStatus,
                      isBundle: 'Y',
                    },
                  }).open();
                },
                'data-testid': `button_qty_bundle_prepared_${scope.rowIndex}_lotSummaryTable`,
              },
              { default: () => scope.row.qtyBundlePrepared },
            );
          },
        },
      },
      {
        field: 'qtyScatterAvailable',
        title: '散件可用',
        align: 'right',
        width: '90',
        sortable: false,
      },
      {
        field: 'qtyScatterOnHand',
        title: '散件在库',
        align: 'right',
        width: '90',
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
                      storageStatus: scope.row.storageStatus,
                      isScatter: 'Y',
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_qty_scatter_on_hand_${scope.rowIndex}_lotSummaryTable`,
              },
              { default: () => scope.row.qtyScatterOnHand },
            );
          },
        },
      },
      {
        field: 'qtyScatterPrepared',
        title: '散件预配',
        width: '90',
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
                    tabVal: 'lotSummary',
                    modalTitle: '散件预配明细',
                    queryParams: {
                      warehouseId: scope.row.warehouseId,
                      productId: scope.row.productId,
                      lot: scope.row.lot || '',
                      storageStatus: scope.row.storageStatus,
                      isBundle: 'N',
                    },
                  }).open();
                },
                'data-testid': `button_qty_scatter_prepared_${scope.rowIndex}_lotSummaryTable`,
              },
              { default: () => scope.row.qtyScatterPrepared },
            );
          },
        },
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '90',
        visible: isBelowLimit === 'Y' || isShowStatus === 'N',
        sortable: true,
      },
    ],
    id: 'storageQuery_lotSummary',
    queryUrl: '/storageAction/queryStorageLot.do',
    beforeFetchFn: (params) => {
      if (!fatherTableCheckedRow?.value?.productId) {
        return false;
      }
      if (isBelowLimit === 'Y' && !params.sort) {
        params.sort = 'asi.GuaranteeDate';
        params.dir = 'asc';
      }
      if (!fatherTableCheckedRow?.value?.productId) {
        return false;
      }
      return {
        ...params,
        warehouseId: fatherTableCheckedRow?.value?.warehouseId,
        productId: fatherTableCheckedRow?.value?.productId,
        storageStatus: fatherTableCheckedRow?.value?.storageStatus,
        showPrice: 'N',
        showVendor: 'N',
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
        showPrice: 'N',
        showVendor: 'N',
      });
    }
  },
);
defineExpose({
  query() {
    // 子表请求
    console.warn('批号汇总');

    ChcGridApi.reload({
      warehouseId: fatherTableCheckedRow?.value?.warehouseId,
      productId: fatherTableCheckedRow?.value?.productId,
      storageStatus: fatherTableCheckedRow?.value?.storageStatus,
      showPrice: 'N',
      showVendor: 'N',
    });
  },
  reload() {
    ChcGridApi.reload({
      warehouseId: fatherTableCheckedRow?.value?.warehouseId,
      productId: fatherTableCheckedRow?.value?.productId,
      storageStatus: fatherTableCheckedRow?.value?.storageStatus,
      showPrice: 'N',
      showVendor: 'N',
    });
  },
  removeData() {
    ChcGridApi?.grid?.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('批号汇总');
  console.warn('urlParams:', urlParams);
});
</script>
<template>
  <div class="h-full">
    <MovingDetailModal />
    <PrepareDetailModal />
    <ChcGrid />
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
