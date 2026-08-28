<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import CustomNotification from './components/notification.vue';
import OperationGuide from './components/operationGuide.vue';
import PurchaseRank from './components/purchaseRank.vue';
import PurchaseTrendChart from './components/purchaseTrendChart.vue';
import QuickNav from './components/quickNav.vue';
import StorageStatusChart from './components/storageStatusChart.vue';
import WarehouseChartCard from './components/warehouseChartCard.vue';
import WarningInfo from './components/warningInfo.vue';

const userStore = useUserStore();
console.warn('userStore', userStore);

// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements

// 中心库库存状态 库房变化
const storageStatusChartRef = useTemplateRef('storageStatusChartRef');
const handleChartWarehouseStatusChange = (warehouseId: number | string) => {
  console.warn('handleChartWarehouseStatusChange', warehouseId);
  nextTick(() => {
    storageStatusChartRef.value?.init({ warehouseId });
  });
};
// 中心库采购趋势 库房变化
const purchaseTrendChartRef = useTemplateRef('purchaseTrendChartRef');
const handleChartWarehousePurchaseTrendChange = (
  warehouseId: number | string,
) => {
  console.warn('handleChartWarehousePurchaseTrendChange', warehouseId);
  nextTick(() => {
    purchaseTrendChartRef.value?.init({ warehouseId });
  });
};
</script>
<template>
  <Page
    content-class="p-[0.5rem] box-border"
    auto-content-height
    header-class="px-3 py-2"
  >
    <div
      class="box-border flex h-full w-full flex-col items-start justify-start gap-y-2"
    >
      <div
        class="box-border flex w-full flex-none flex-row items-start justify-between gap-x-4 lg:h-[96px] 2xl:h-[142px]"
      >
        <QuickNav class="box-border h-full" style="flex: 2" />
        <OperationGuide class="box-border" style="flex: 1" />
      </div>
      <div
        class="box-border flex w-full flex-row items-start justify-between lg:h-[calc((100%_-_96px)_*_3_/_5)] 2xl:h-[calc((100%_-_142px)_*_3_/_5)]"
      >
        <div
          class="mr-2 box-border flex h-full w-2/3 flex-row items-start justify-between"
        >
          <WarehouseChartCard
            title="中心库库存状态"
            type="warehouseStatus"
            @warehouse-change="handleChartWarehouseStatusChange"
            class="mr-2 box-border h-full w-1/2"
          >
            <StorageStatusChart ref="storageStatusChartRef" />
          </WarehouseChartCard>
          <WarehouseChartCard
            title="中心库采购趋势"
            @warehouse-change="handleChartWarehousePurchaseTrendChange"
            type="WarehousePurchaseTrend"
            class="ml-2 box-border h-full w-1/2"
          >
            <PurchaseTrendChart ref="purchaseTrendChartRef" />
          </WarehouseChartCard>
        </div>
        <WarningInfo class="ml-2 box-border h-full w-1/3" title="预警信息" />
      </div>
      <div
        class="box-border flex w-full flex-row items-start justify-between lg:h-[calc((100%_-_142px)_*_2_/_5)] 2xl:h-[calc((100%_-_142px)_*_2_/_5)]"
      >
        <div class="mr-2 box-border h-full w-2/3">
          <PurchaseRank class="h-full" title="全院采购排名" />
        </div>

        <div class="ml-2 box-border h-full w-1/3">
          <CustomNotification title="通知公告" />
        </div>
      </div>
    </div>
  </Page>
</template>
<style lang="less" scoped></style>
