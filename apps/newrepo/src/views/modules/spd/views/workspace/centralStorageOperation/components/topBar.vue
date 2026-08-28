<script setup lang="ts">
import type { Component } from 'vue';

import { ref } from 'vue';

import { VbenIcon } from '@vben-core/shadcn-ui';

import { requestFormClient } from '#/api/request';

interface Item {
  color?: string;
  icon: Component | string;
  name: string;
  value: number | string;
  field: string;
}

defineOptions({
  name: 'TopBar',
});
const items = ref<Item[]>();
const INITIAL_ITEMS: Item[] = [
  {
    icon: 'carbon:user-follow',
    name: '待指示（品规数）',
    value: '',
    color: '#4095e5',
    field: 'waitInstructionCount',
  },
  {
    icon: 'carbon:user-follow',
    name: '待拣货（品规数）',
    value: '',
    color: '#81b337',
    field: 'waitPickingCount',
  },
  {
    icon: 'carbon:user-follow',
    name: '待配送（品规数）',
    value: '',
    color: '#e99d42',
    field: 'waitDeliveryCount',
  },
  {
    icon: 'carbon:user-follow',
    name: '待接受（品规数）',
    value: '',
    color: '#54bcbd',
    field: 'waitReceiveCount',
  },
  {
    icon: 'carbon:user-follow',
    name: '待上架（品规数）',
    value: '',
    color: '#7f83f7',
    field: 'waitShelveCount',
  },
];
const init = async () => {
  try {
    const res = await requestFormClient.post('/dashboardAction/queryTopBar.do');

    items.value = INITIAL_ITEMS.map((item) => {
      return {
        ...item,
        value: res?.data?.[0]?.[item.field] || 0,
      };
    });
  } catch (error) {
    console.error(error);
  }
};
init();
</script>

<template>
  <div class="flex w-full items-center justify-between gap-x-2">
    <template v-for="item in items" :key="item.title">
      <div
        class="group flex flex-1 cursor-pointer items-center justify-around rounded-3xl py-2 shadow-xl"
        :class="[item?.color ? `bg-[${item.color}]` : '']"
        :style="{
          backgroundColor: item.color,
        }"
      >
        <div class="flex flex-col items-center justify-start">
          <VbenIcon
            color="#ffffff"
            :icon="item.icon"
            class="size-7 transition-all duration-300 group-hover:scale-125"
          />
          <span class="text-md mt-2 truncate text-white">
            {{ item.name }}
          </span>
        </div>
        <div class="text-xl text-black group-hover:scale-125">
          {{ item.value }}
        </div>
      </div>
    </template>
  </div>
</template>
