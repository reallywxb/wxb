<script setup lang="ts">
import { ref } from 'vue';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VbenIcon,
} from '@vben-core/shadcn-ui';

const items = ref<
  {
    icon: string;
    title: string;
  }[]
>([
  {
    title: '400-88-999',
    icon: 'eva:phone-fill',
  },
  {
    title: 'support@spd-system.com',
    icon: 'ic:round-email',
  },
  {
    title: '工作时间： 8：00-18：00',
    icon: 'lets-icons:time',
  },
]);
</script>

<template>
  <div>
    <Card class="h-full">
      <CardHeader class="py-4">
        <CardTitle class="text-lg">技术支持</CardTitle>
      </CardHeader>
      <CardContent class="flex h-[calc(100%-60px)] pb-2">
        <div>
          <template v-for="(item, index) in items" :key="item.title">
            <div
              :class="{
                'rounded-br-xl': index === items.length - 1,
              }"
              class="mb-3 flex items-center hover:shadow-xl"
            >
              <VbenIcon
                :icon="item.icon"
                class="size-6 text-[#777777] transition-all duration-300 group-hover:scale-125"
              />
              <span class="text-md ml-2 truncate text-[#777777]">
                {{ item.title }}
              </span>
            </div>
          </template>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
