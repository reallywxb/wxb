<script setup lang="ts">
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
} from '@vben/common-ui';

import { nextTick, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import applicationProgressChart from './components/applicationProgressChart.vue';
import CustomNotification from './components/notification.vue';
import OperationGuide from './components/operationGuide.vue';
import PurchaseRank from './components/purchaseRank.vue';
import QuickNav from './components/quickNav.vue';
import StorageStatusChart from './components/storageStatusChart.vue';
import TechnicalSupport from './components/technicalSupport.vue';
import WarehouseChartCard from './components/warehouseChartCard.vue';
import WarningInfo from './components/warningInfo.vue';

const userStore = useUserStore();
console.warn('userStore', userStore);

const quickNavItems = ref<WorkbenchQuickNavItem[]>([]);
const getQuickNavItems = (): Promise<WorkbenchQuickNavItem[]> => {
  const arr: WorkbenchQuickNavItem[] = [
    {
      color: '#8ab947',
      icon: 'ant-design:container-outlined',
      title: '库房请领录入',
      url: '/warehouse/warehouseOrder/orderInput',
    },
    {
      color: '#1b4af5',
      icon: 'fluent-mdl2:document-approval',
      title: '库房请领审批',
      url: '/warehouse/warehouseOrder/orderApprove',
    },
    {
      color: '#4396e5',
      icon: 'carbon:list-checked',
      title: '入库验收',
      url: '/deption/orderPut/checkIn',
    },
    // {
    //   color: '#f4ce98',
    //   icon: 'carbon:certificate-check',
    //   title: '低值消耗登记',
    //   url: '/deption/lowConsume/lowConsumeRegistry',
    // },
    // {
    //   color: '#a36df7',
    //   icon: 'ant-design:select-outlined',
    //   title: '高值消耗登记',
    //   url: '/deption/highConsume/highConsumeRegistry',
    // },
    {
      color: '#c3c34c',
      icon: 'lucide:file-search',
      title: '库存查询',
      url: '/warehouse/storage/storageQuery',
    },
    {
      color: '#94be56',
      icon: 'ant-design:login-outlined',
      title: '库房请退录入',
      url: '/warehouse/warehouseOrder/orderReturnInput',
    },
    {
      color: '#1645f5',
      icon: 'carbon:task-approved',
      title: '库房请退审批',
      url: '/warehouse/warehouseOrder/orderReturnApproval',
    },
  ];
  // 异步获取数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(arr);
    }, 1000);
  });
};
const operationGuideItems = ref<WorkbenchQuickNavItem[]>([]);
const BASE_URL = import.meta.env.VITE_BASE;
const getOperationGuideItems = (): Promise<WorkbenchQuickNavItem[]> => {
  return new Promise((resolve) => {
    const arr: WorkbenchQuickNavItem[] = [
      {
        color: '#81b338',
        icon: 'ant-design:container-outlined',
        title: '请领',
        url: `/${BASE_URL}/docs/pleaseReceive.html`,
      },
      {
        color: '#f4ce98',
        icon: 'ant-design:login-outlined',
        title: '请退',
        url: `/${BASE_URL}/docs/pleaseReturn.html`,
      },
      {
        color: '#e4a2a9',
        icon: 'carbon:chart-waterfall',
        title: '消耗',
        url: `/${BASE_URL}/docs/consume.html`,
      },
      {
        color: '#bd3124',
        icon: 'mdi:swap-horizontal-variant',
        title: '调拨',
        url: `/${BASE_URL}/docs/allocation.html`,
      },
    ];
    setTimeout(() => {
      resolve(arr);
    });
  });
};
const init = () => {
  Promise.all([getQuickNavItems(), getOperationGuideItems()]).then((res) => {
    const [quickNavItemsRes, operationGuideItemsRes] = res;
    quickNavItems.value = quickNavItemsRes;
    operationGuideItems.value = operationGuideItemsRes;
  });
};
init();

const router = useRouter();

// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}

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
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div class="flex flex-col lg:flex-row">
      <div class="w-2/3">
        <QuickNav :items="quickNavItems" title="快捷菜单" @click="navTo" />
      </div>
      <div class="w-1/3 pl-4">
        <OperationGuide
          :items="operationGuideItems"
          title="功能操作指引"
          class="box-border w-full"
        />
      </div>
    </div>
    <div class="flex h-[calc((100%-144px))]">
      <div class="w-2/3 pt-2">
        <div class="flex h-[50%]">
          <div class="mr-4 flex-1">
            <WarehouseChartCard
              title="科室库库存状态"
              type="storageStatus"
              @warehouse-change="handleChartWarehouseStatusChange"
            >
              <StorageStatusChart ref="storageStatusChartRef" />
            </WarehouseChartCard>
          </div>
          <div class="flex-1">
            <WarehouseChartCard
              title="申领进度"
              type="purchaseTrend"
              @warehouse-change="handleChartWarehousePurchaseTrendChange"
            >
              <applicationProgressChart ref="purchaseTrendChartRef" />
            </WarehouseChartCard>
          </div>
        </div>
        <div class="h-[50%] pt-2">
          <PurchaseRank class="box-border w-full" title="科室消耗Top10" />
        </div>
      </div>
      <div class="w-1/3 pl-4 pt-2">
        <WarningInfo
          :items="operationGuideItems"
          class="box-border w-full"
          title="预警信息"
          action="nurse"
        />
        <div class="h-[50%] pt-2">
          <CustomNotification title="通知公告" action="nurse" />
        </div>
        <!-- -->
        <div class="h-[calc(50%-136px)] pt-2">
          <TechnicalSupport class="box-border h-full w-full" />
        </div>
      </div>
    </div>
    <!-- <div class="flex h-[calc((100%-144px)/2)] flex-col pt-2 lg:flex-row">
      <div class="flex w-2/3"></div>
      <div class="w-1/3 pl-4">


      </div>
    </div>
    <div class="flex h-[calc((100%-144px)/2)] flex-col pt-2 lg:flex-row">
      <div class="h-full w-1/3 pl-4">


      </div>
    </div> -->
  </Page>
</template>
<style lang="less" scoped></style>
