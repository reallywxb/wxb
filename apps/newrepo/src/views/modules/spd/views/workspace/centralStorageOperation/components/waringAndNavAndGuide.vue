<script setup lang="ts">
import type { Component } from 'vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty, openWindow } from '@vben/utils';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VbenIcon,
} from '@vben-core/shadcn-ui';

import { Badge as AntBadge } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';

import DocModalUi from './docModal.vue';

interface WarningInfoItem {
  color?: string;
  icon: Component | string;
  title: string;
  url?: string;
  field: string;
  count?: number | string;
}

defineOptions({
  name: 'WaringAndNavAndGuide',
});

const router = useRouter();
const warningInfoItems = ref<WarningInfoItem[]>([
  {
    icon: 'carbon:warning',
    title: '近效期预警',
    field: 'countExpWarn',
    color: '#6ec3ba',
    url: '/warehouse/storage/nearGuaranteeQuery',
    count: 0,
  },
  {
    icon: 'mdi:chart-bar',
    title: '证照预警',
    field: 'countLicenseWarn',
    color: '#ffbf6b',
    url: '/operation/qualificationCertificates/ctStatistics',
    count: 0,
  },
  {
    icon: 'carbon:warning-other',
    title: '库存预警',
    field: 'countStockWarn',
    color: '#b8e1dd',
    url: '/warehouse/storage/warning',
    count: 0,
  },
  // {
  //   icon: 'carbon:package',
  //   title: '中心库入库交接',
  //   field: 'drugList',
  //   color: '#7728f5',
  //   url: '/deption/orderPut/handover',
  //   count: 0,
  // },
]);
const getWarningInfoItems = async (): Promise<Record<string, number>[]> => {
  try {
    const res = await requestFormClient.post(
      '/dashboardAction/queryWarnDataCount.do',
      {
        type: 2,
      },
    );

    if (isEmpty(res?.data)) {
      return [];
    }

    return res.data;
  } catch (error) {
    console.error('获取预警信息失败', error);
    return [];
  }
};
interface QuickNavItem {
  color?: string;
  icon: Component | string;
  title: string;
  url?: string;
}
const quickNavItems = ref<QuickNavItem[]>([]);
const getQuickNavItems = (): Promise<QuickNavItem[]> => {
  const arr: QuickNavItem[] = [
    {
      color: '#8ab947',
      icon: 'ant-design:file-done-outlined',
      title: '采购计划提交',
      url: '/purchase/purchasePlan/buyPlan',
    },
    // {
    //   color: '#1b4af5',
    //   icon: 'ant-design:contacts-outlined',
    //   title: '采购计划审核',
    //   url: '/purchase/purchasePlan/approveWorkflow',
    // },
    // {
    //   color: '#4396e5',
    //   icon: 'ant-design:file-protect-outlined',
    //   title: '验收入库',
    //   url: '/purchase/checkPlan/checkWarehouse',
    // },
    {
      color: '#f4ce98',
      icon: 'ant-design:file-text-outlined',
      title: '手工入库',
      url: '/purchase/checkPlan/manualCheck',
    },
    {
      color: '#a36df7',
      icon: 'lucide:package-search',
      title: '库存查询',
      url: '/warehouse/storage/storageQuery',
    },
    {
      color: '#c3c34c',
      icon: 'lucide:file-search',
      title: '出库指示',
      url: '/warehouse/orderApprove/applyPick',
    },
    {
      color: '#94be56',
      icon: 'ant-design:login-outlined',
      title: '库房请退录入',
      url: '/warehouse/warehouseOrder/orderReturnInput',
    },
    // {
    //   color: '#1645f5',
    //   icon: 'carbon:task-approved',
    //   title: '库房请退审批',
    //   url: '/warehouse/warehouseOrder/orderReturnApproval',
    // },
  ];
  // 异步获取数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(arr);
    }, 1000);
  });
};
const operationGuideItems = ref<QuickNavItem[]>([]);
const BASE_URL = import.meta.env.VITE_BASE;
const getOperationGuideItems = (): Promise<QuickNavItem[]> => {
  return new Promise((resolve) => {
    const arr: QuickNavItem[] = [
      {
        color: '#81b338',
        icon: 'carbon:shopping-cart',
        title: '采购',
        url: `/${BASE_URL}/docs/purchase.html`,
      },
      {
        color: '#f4ce98',
        icon: 'carbon:stamp',
        title: '验收',
        url: `/${BASE_URL}/docs/checkPlan.html`,
      },
      {
        color: '#e4a2a9',
        icon: 'carbon:delivery-truck',
        title: '出库',
        url: `/${BASE_URL}/docs/outbound.html`,
      },
      {
        color: '#bd3124',
        icon: 'carbon:trash-can',
        title: '退货',
        url: `/${BASE_URL}/docs/returnGoods.html`,
      },
    ];
    setTimeout(() => {
      resolve(arr);
    });
  });
};
const init = () => {
  Promise.all([
    getWarningInfoItems(),
    getQuickNavItems(),
    getOperationGuideItems(),
  ]).then((res) => {
    const [warningInfoItemsRes, quickNavItemsRes, operationGuideItemsRes] = res;
    if (!isEmpty(warningInfoItemsRes)) {
      const d = warningInfoItemsRes[0];
      warningInfoItems.value = warningInfoItems.value.map((item) => ({
        ...item,
        count: d ? d[item.field] : 0,
      }));
    }
    quickNavItems.value = quickNavItemsRes;
    operationGuideItems.value = operationGuideItemsRes;
  });
};
init();

const handleWarningInfoItemClick = (nav: WarningInfoItem) => {
  console.warn('handleWarningInfoItemClick', nav);
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
};
const handleQuickNavItemClick = (nav: QuickNavItem) => {
  console.warn('handleWarningInfoItemClick', nav);
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
};
const [DocModal, docModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: DocModalUi,
  draggable: true,
});
const handleOperationGuideItemClick = (item: QuickNavItem) => {
  console.warn('handleClick', item);
  docModalApi
    .setData({
      modalTitle: item.title,
      url: item.url,
    })
    .open();
};
</script>

<template>
  <div>
    <DocModal />
    <Card
      class="box-border flex h-full w-full flex-col items-center justify-start"
    >
      <CardHeader class="card-header w-full py-2">
        <CardTitle class="xl:text-md 2xl:text-lg">预警信息</CardTitle>
      </CardHeader>
      <CardContent
        class="flex w-full flex-1 flex-wrap items-start justify-between px-2 pb-0"
      >
        <template v-for="(item, index) in warningInfoItems" :key="item.title">
          <div
            class="item flex-col-center group w-1/4 cursor-pointer py-1 hover:shadow-xl"
            :data-testid="`div_warningInfo_${index}`"
            @click="handleWarningInfoItemClick(item)"
          >
            <AntBadge :count="item?.count">
              <VbenIcon
                :color="item.color"
                :icon="item.icon"
                class="item-icon transition-all duration-300 group-hover:scale-125 lg:size-4 2xl:size-7"
              />
            </AntBadge>
            <span
              class="item-title truncate md:mt-1 2xl:mt-2"
              :style="{ color: item?.color || 'inherit' }"
            >
              {{ item.title }}
            </span>
          </div>
        </template>
      </CardContent>
      <CardHeader class="card-header w-full py-2">
        <CardTitle class="xl:text-md 2xl:text-lg">快捷菜单</CardTitle>
      </CardHeader>
      <CardContent
        class="flex w-full flex-1 flex-wrap items-start justify-between px-2 pb-0"
      >
        <template v-for="(item, index) in quickNavItems" :key="item.title">
          <div
            class="item flex-col-center group cursor-pointer py-1 hover:shadow-xl"
            :style="{
              width: `${(1 / quickNavItems.length) * 100}%`,
            }"
            :data-testid="`div_navTo_${index}`"
            @click="handleQuickNavItemClick(item)"
          >
            <VbenIcon
              :color="item.color"
              :icon="item.icon"
              class="item-icon transition-all duration-300 group-hover:scale-125 xl:size-4 2xl:size-7"
            />
            <span
              class="item-title truncate lg:mt-1 2xl:mt-2"
              :style="{ color: item?.color || 'inherit' }"
            >
              {{ item.title }}
            </span>
          </div>
        </template>
      </CardContent>
      <CardHeader class="card-header w-full py-2">
        <CardTitle class="xl:text-md 2xl:text-lg">功能操作指引</CardTitle>
      </CardHeader>
      <CardContent
        class="flex w-full flex-1 flex-wrap items-start justify-between px-2 pb-0"
      >
        <template
          v-for="(item, index) in operationGuideItems"
          :key="item.title"
        >
          <div
            class="item flex-col-center group cursor-pointer py-1 hover:shadow-xl"
            :style="{
              width: `${(1 / operationGuideItems.length) * 100}%`,
            }"
            :data-testid="`div_operationGuide_${index}`"
            @click="handleOperationGuideItemClick(item)"
          >
            <VbenIcon
              :color="item.color"
              :icon="item.icon"
              class="item-icon transition-all duration-300 group-hover:scale-125 xl:size-4 2xl:size-7"
            />
            <span
              class="item-title truncate lg:mt-1 2xl:mt-2"
              :style="{ color: item?.color || 'inherit' }"
            >
              {{ item.title }}
            </span>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
<style lang="less" scoped>
// lg:1024
@media (min-width: 1024px) {
}
// w2xl:1536
@media (min-width: 1440px) {
  .card-header {
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .item {
    // padding-top: 0px;
    // padding-bottom: 0px;
    padding: 0px;
    .item-icon {
      width: 20px;
      height: 20px;
    }
    .item-title {
      margin-top: 4px;
      font-size: 12px;
    }
  }
}
@media (min-width: 1920px) {
  .card-header {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  .item {
    .item-icon {
      width: 28px;
      height: 28px;
    }
    .item-title {
      margin-top: 8px;
      font-size: 14px;
    }
  }
}
</style>
