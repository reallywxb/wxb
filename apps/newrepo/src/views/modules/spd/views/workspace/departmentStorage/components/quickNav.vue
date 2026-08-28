<script setup lang="ts">
import type { Component } from 'vue';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VbenIcon,
} from '@vben-core/shadcn-ui';

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

defineEmits(['click']);
</script>

<template>
  <Card>
    <CardHeader class="py-4">
      <CardTitle class="text-lg">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent
      class="flex h-[80px] flex-nowrap justify-between overflow-y-auto p-0"
    >
      <template v-for="(item, index) in items" :key="item.title">
        <div
          :class="{
            'rounded-br-xl': index === items.length - 1,
          }"
          class="flex-col-center w-1/8 group min-w-[130px] cursor-pointer py-2 hover:shadow-xl"
          :data-testid="`div_navTo_${index}`"
          @click="$emit('click', item)"
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
</template>
