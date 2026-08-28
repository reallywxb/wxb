<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import ConsumableAge from './components/consumableAge.vue';
import CustomNotification from './components/notification.vue';
import RefuseAnalysis from './components/refuseAnalysis.vue';
import ReturnAnalysis from './components/returnAnalysis.vue';
import TodayOutboundSituation from './components/todayOutboundSituation.vue';
import TopBar from './components/topBar.vue';
import WaringAndNavAndGuide from './components/waringAndNavAndGuide.vue';

const userStore = useUserStore();
console.warn('userStore', userStore);

// 中心库采购趋势 库房变化
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
      <TopBar class="box-border h-[75px] w-full" />
      <div
        class="box-border flex h-[calc((100%_-_75px_-_16px)_*_1_/_2)] w-full flex-row items-start justify-between"
      >
        <TodayOutboundSituation class="mr-2 box-border h-full w-1/3" />
        <RefuseAnalysis class="mx-2 box-border h-full w-1/3" />
        <WaringAndNavAndGuide class="ml-2 box-border h-full w-1/3" />
      </div>
      <div
        class="box-border flex h-[calc((100%_-_75px_-_16px)_*_1_/_2)] w-full flex-row items-start justify-between"
      >
        <ReturnAnalysis class="mr-2 box-border h-full w-1/3" />
        <ConsumableAge class="mx-2 box-border h-full w-1/3" />
        <div class="ml-2 box-border h-full w-1/3">
          <CustomNotification
            class="ml-2 box-border h-full w-1/3"
            title="通知公告"
          />
        </div>
      </div>
    </div>
  </Page>
</template>
<style lang="less" scoped></style>
