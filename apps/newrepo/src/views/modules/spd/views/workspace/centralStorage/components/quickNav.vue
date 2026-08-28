<script setup lang="ts">
import type { Component } from 'vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { openWindow } from '@vben/utils';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VbenIcon,
} from '@vben-core/shadcn-ui';

defineOptions({
  name: 'QuickNav',
});

const router = useRouter();
interface WorkbenchProjectItem {
  color?: string;
  content: string;
  date: string;
  group: string;
  icon: Component | string;
  title: string;
  url?: string;
}
interface WorkbenchQuickNavItem {
  color?: string;
  icon: Component | string;
  title: string;
  url?: string;
}

const items = ref<WorkbenchQuickNavItem[]>([]);
const navTo = (nav: WorkbenchProjectItem | WorkbenchQuickNavItem) => {
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

const getQuickNavItems = (): Promise<WorkbenchQuickNavItem[]> => {
  const arr: WorkbenchQuickNavItem[] = [
    {
      color: '#8ab947',
      icon: 'ant-design:file-done-outlined',
      title: '采购计划提交',
      url: '/purchase/purchasePlan/buyPlan',
    },
    {
      color: '#1b4af5',
      icon: 'ant-design:contacts-outlined',
      title: '采购计划审核',
      url: '/purchase/purchasePlan/approveWorkflow',
    },
    {
      color: '#4396e5',
      icon: 'ant-design:file-protect-outlined',
      title: '验收入库',
      url: '/purchase/checkPlan/checkWarehouse',
    },
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
const init = async () => {
  getQuickNavItems().then((res) => {
    items.value = res;
  });
};
init();
</script>

<template>
  <Card>
    <CardHeader class="py-4">
      <CardTitle class="xl:text-md 2xl:text-lg">快捷菜单</CardTitle>
    </CardHeader>
    <CardContent class="flex flex-nowrap overflow-y-auto px-2 pb-2">
      <template v-for="(item, index) in items" :key="item.title">
        <div
          class="flex-col-center w-1/8 group flex-1 cursor-pointer lg:hover:shadow-lg 2xl:py-2 2xl:hover:shadow-xl"
          :data-testid="`div_navTo_${index}`"
          @click="navTo(item)"
        >
          <VbenIcon
            :color="item.color"
            :icon="item.icon"
            class="transition-all duration-300 group-hover:scale-125 xl:size-4 2xl:size-7"
          />
          <span
            class="xl:text-md truncate md:text-sm lg:mt-1 2xl:mt-2"
            :style="{ color: item?.color || 'inherit' }"
          >
            {{ item.title }}
          </span>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
