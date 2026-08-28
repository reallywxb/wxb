<script setup lang="ts">
import type { Component } from 'vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { isEmpty, openWindow } from '@vben/utils';

// import { useVbenModal } from '@vben/common-ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VbenIcon,
} from '@vben-core/shadcn-ui';

import { Badge as AntBadge } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
// import DocModalUi from './docModal.vue';

interface WarningInfoItem {
  color?: string;
  icon: Component | string;
  title: string;
  url?: string;
  field: string;
  count?: number;
}
interface Props {
  title: string;
  action: string;
}
defineOptions({
  name: 'WarningInfo',
});

const props = withDefaults(defineProps<Props>(), {});

defineEmits(['click']);
const router = useRouter();
const items = ref<WarningInfoItem[]>([]);
const init = async () => {
  items.value = [
    {
      icon: 'carbon:warning',
      title: '近效期预警',
      field: 'countExpWarn',
      color: '#6ec3ba',
      url: '/warehouse/storage/nearGuaranteeQuery',
      count: 0,
    },
    {
      icon: 'carbon:warning-other',
      title: '库存预警',
      field: 'countStockWarn',
      color: '#6ec3ba',
      count: 0,
      url: '/warehouse/storage/warning',
    },
    // {
    //   icon: 'carbon:warning-other',
    //   title: '科室库入库交接',
    //   field: 'drugList',
    //   color: '#6ec3ba',
    //   count: 0,
    //   url: '/warehouse/orderPut/handover',
    // },
  ];
  // if (props.action === 'nurse') {
  //   items.value.push({
  //     icon: 'carbon:package',
  //     title: '药品目录',
  //     field: 'drugList',
  //     color: '#7728f5',
  //     url: '/consortium/drugManagement/drugList',
  //     count: 0,
  //   });
  // }
  try {
    const res = await requestFormClient.post(
      '/dashboardAction/queryWarnDataCount.do',
      {
        type: props.action === 'nurse' ? 4 : 3,
      },
    );

    if (isEmpty(res?.data)) {
      return;
    }
    if (isEmpty(res.data[0])) {
      return;
    }
    const d = res.data[0];
    items.value.forEach((item) => {
      item.count = d[item.field] || 0;
    });
  } catch (error) {
    console.error('获取预警信息失败', error);
  }
};
init();
// const [DocModal, docModalApi] = useVbenModal({
//   class: 'w-[800px]',
//   closable: true,
//   // 连接抽离的组件
//   connectedComponent: DocModalUi,
//   draggable: true,
// });
const handleClick = (item: WarningInfoItem) => {
  console.warn('handleClick', item);
  // docModalApi
  //   .setData({
  //     modalTitle: item.title,
  //   })
  //   .open();
  if (item.url?.startsWith('http')) {
    openWindow(item.url);
    return;
  }
  if (item.url?.startsWith('/')) {
    router.push(item.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(
      `Unknown URL for navigation item: ${item.title} -> ${item.url}`,
    );
  }
};
</script>

<template>
  <div>
    <Card>
      <CardHeader class="py-4">
        <CardTitle class="text-lg">{{ title }}</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-wrap p-0">
        <template v-for="(item, index) in items" :key="item.title">
          <div
            :class="{
              'pb-4': index > 2,
              'rounded-bl-xl': index === items.length - 3,
              'rounded-br-xl': index === items.length - 1,
            }"
            class="flex-col-center group w-1/3 cursor-pointer py-2 hover:shadow-xl"
            :data-testid="`div_warningInfo_${index}`"
            @click="handleClick(item)"
          >
            <AntBadge :count="item?.count">
              <VbenIcon
                :color="item.color"
                :icon="item.icon"
                class="size-7 transition-all duration-300 group-hover:scale-125"
              />
            </AntBadge>
            <span class="text-md mt-2 truncate">{{ item.title }}</span>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
