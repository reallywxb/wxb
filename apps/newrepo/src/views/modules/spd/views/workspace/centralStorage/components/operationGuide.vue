<script setup lang="ts">
import type { Component } from 'vue';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VbenIcon,
} from '@vben-core/shadcn-ui';

import DocModalUi from './docModal.vue';

interface WorkbenchQuickNavItem {
  color?: string;
  icon: Component | string;
  title: string;
  url?: string;
}

defineOptions({
  name: 'OperationGuide',
});

const items = ref<WorkbenchQuickNavItem[]>([]);
const BASE_URL = import.meta.env.VITE_BASE;
const getOperationGuideItems = (): Promise<WorkbenchQuickNavItem[]> => {
  return new Promise((resolve) => {
    const arr: WorkbenchQuickNavItem[] = [
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
const init = async () => {
  getOperationGuideItems().then((res) => {
    items.value = res;
  });
};
init();
const [DocModal, docModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: DocModalUi,
  draggable: true,
});
const handleClick = (item: WorkbenchQuickNavItem) => {
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
    <Card class="box-border w-full">
      <CardHeader class="py-4">
        <CardTitle class="xl:text-md 2xl:text-lg">功能操作指引</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-nowrap overflow-y-auto px-2 pb-2">
        <template v-for="(item, index) in items" :key="item.title">
          <div
            class="flex-col-center group flex-1 cursor-pointer lg:hover:shadow-lg 2xl:py-2 2xl:hover:shadow-xl"
            :data-testid="`div_operationGuide_${index}`"
            @click="handleClick(item)"
          >
            <VbenIcon
              :color="item.color"
              :icon="item.icon"
              class="transition-all duration-300 group-hover:scale-125 lg:size-4 2xl:size-7"
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
  </div>
</template>
