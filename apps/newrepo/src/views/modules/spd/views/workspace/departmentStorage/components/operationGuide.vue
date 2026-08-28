<script setup lang="ts">
import type { Component } from 'vue';

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
interface Props {
  items?: WorkbenchQuickNavItem[];
  title: string;
}

defineOptions({
  name: 'WorkbenchQuickNav',
});

withDefaults(defineProps<Props>(), {
  items: () => [],
});

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
    <Card class="w-ful box-border">
      <CardHeader class="py-4">
        <CardTitle class="text-lg">{{ title }}</CardTitle>
      </CardHeader>
      <CardContent class="flex h-[80px] flex-nowrap overflow-y-auto p-0">
        <template v-for="(item, index) in items" :key="item.title">
          <div
            class="flex-col-center group w-1/4 min-w-[130px] cursor-pointer py-2 hover:shadow-xl"
            :class="[index === items.length - 1 ? 'rounded-br-xl' : '']"
            :data-testid="`div_operationGuide_${index}`"
            @click="handleClick(item)"
          >
            <VbenIcon
              :color="item.color"
              :icon="item.icon"
              class="size-7 transition-all duration-300 group-hover:scale-125"
            />
            <span
              class="text-md mt-2 truncate"
              :class="[item.color ? `text-[${item.color}]` : '']"
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
