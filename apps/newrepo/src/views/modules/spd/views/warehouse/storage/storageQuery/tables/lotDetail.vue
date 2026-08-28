<script setup lang="ts">
import type { Ref } from 'vue';

import { h, inject, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { IconfontBasicView } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import previewImage from '#/views/modules/spd/views/common/previewImages/index.vue';

import { RouteMappingManager } from '../../routeMapping';
import movingDetailModal from '../modals/movingDetailModal.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const router = useRouter();
const route = useRoute();
const routeManager = new RouteMappingManager(route.name as string);
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const isBelowLimit = urlParams?.isBelowLimit || ''; // 库存预警
const isShowStatus = urlParams?.isShowStatus || 'Y'; // 默认显示库存状态

const fatherTableCheckedRow = inject<Ref<Record<string, any>>>(
  'fatherTableCheckedRow',
);
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
// const isFirstLoaded = ref(false); // 是否已初次加载完
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
        if (row?.neerGuaranteeDate === 'Y') {
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
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  router.push({
                    path: routeManager.getRoute('storageDetailQuery'),
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
                'data-testid': `button_lot_${scope.rowIndex}_lotDetail`,
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
        width: '100',
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
                    path: routeManager.getRoute('storageDetailQuery'),
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
                'data-testid': `button_qty_on_hand_${scope.rowIndex}_lotDetail`,
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
        width: '100',
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
                'data-testid': `button_qty_moving_${scope.rowIndex}_lotDetail`,
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
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        width: 150,
        align: 'right',
        formatter: ({ cellValue }) => {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: false,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '150',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '100',
        visible: isBelowLimit === 'Y' || isShowStatus === 'N',
        sortable: true,
      },

      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 230,
      },
    ],
    id: 'storageQuery_lotDetail',
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
        showPrice: 'Y',
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
// 结算明细modal
const [PreviewImageModal, previewImageModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImage,
  draggable: true,
});
const openLotCert = async (row: any) => {
  console.warn('openLotCert row', row);
  row.loading = true;

  try {
    const res = await requestFormClient.get(
      `/storageAction/viewInspectReport.do?siteCode=${row.productServerCode}&productCode=${row.productCode}&lot=${row.lot}&index=0`,
    );
    const imageList = (res?.filePaths || []).map((item: any, index: number) => {
      return {
        path: item?.path,
        id: index,
      };
    });

    previewImageModalApi
      .setData({
        imageList,
      })
      .open();
  } catch (error) {
    console.warn('openLotCert error', error);
  } finally {
    row.loading = false;
  }
};
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
        showPrice: 'Y',
      });
    }
  },
);
defineExpose({
  query() {
    // 子表请求
    console.warn('批号明细');
    ChcGridApi.reload({
      warehouseId: fatherTableCheckedRow?.value?.warehouseId,
      productId: fatherTableCheckedRow?.value?.productId,
      storageStatus: fatherTableCheckedRow?.value?.storageStatus,
      showPrice: 'Y',
    });
  },
  removeData() {
    ChcGridApi?.grid?.remove();
  },
  reload() {
    ChcGridApi.reload({
      warehouseId: fatherTableCheckedRow?.value?.warehouseId,
      productId: fatherTableCheckedRow?.value?.productId,
      storageStatus: fatherTableCheckedRow?.value?.storageStatus,
      showPrice: 'Y',
    });
  },
});
// 初始化加载
onMounted(() => {
  console.warn('批号明细');
  console.warn('urlParams:', urlParams);
});
const goTracePage = (row: any) => {
  console.warn('goTrace', row);
  router.push({
    path: '/warehouse/storage/productTrace',
    query: {
      autoLoad: 'Y',
      warehouseId: row.warehouseId,
      productName: row.productCode ? `=${row.productCode}` : '',
      vendorId: row.vendorId,
      lot: row.lot ? `=${row.lot}` : '',
      // asiPrice: obj.data.price,
      isReload: 'Y',
    },
  });
};
</script>
<template>
  <div class="h-full">
    <MovingDetailModal />
    <PreviewImageModal />
    <ChcGrid>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="goTracePage(scope.row)"
          :data-testid="`button_trace_${scope.rowIndex}_lotDetail`"
        >
          追溯
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          :loading="scope.row?.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="openLotCert(scope.row)"
          :data-testid="`button_inspect_report_${scope.rowIndex}_lotDetail`"
        >
          检验报告
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
