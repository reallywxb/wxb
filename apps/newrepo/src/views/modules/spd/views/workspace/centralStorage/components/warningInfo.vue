<script setup lang="ts">
import type { Component } from 'vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

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

interface WarningInfoItem {
  color?: string;
  icon: Component | string;
  title: string;
  url?: string;
  field: string;
  count?: number | string;
}
interface Props {
  title: string;
}
defineOptions({
  name: 'WarningInfo',
});

withDefaults(defineProps<Props>(), {});

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
      count: 1,
    },
    {
      icon: 'carbon:certificate',
      title: '供应商证照预警',
      field: 'countSupplierLicenseWarn',
      color: '#ffbf6b',
      url: '/operation/qualificationCertificates/vendorCertQuery',
      count: 1,
    },
    // {
    //   icon: 'carbon:package',
    //   title: '中心库入库交接',
    //   field: 'drugList',
    //   color: '#7728f5',
    //   url: '/deption/orderPut/handover',
    //   count: 0,
    // },
  ];

  try {
    const res = await requestFormClient.post(
      '/dashboardAction/queryWarnDataCount.do',
      {
        type: 1,
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

const handleClick = (nav: WarningInfoItem) => {
  console.warn('handleClick', nav);
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
</script>

<template>
  <Card class="box-border flex flex-col items-start justify-start">
    <CardHeader class="py-4">
      <CardTitle class="xl:text-md 2xl:text-lg">{{ title }}</CardTitle>
    </CardHeader>
    <!-- h-[250px]  -->
    <CardContent class="flex w-full flex-1 flex-wrap lg:p-3 2xl:px-2 2xl:pb-2">
      <template v-for="(item, index) in items" :key="item.title">
        <div
          class="waring-item flex-col-center group box-border h-1/2 w-1/3 cursor-pointer md:py-4 lg:hover:shadow-lg 2xl:py-8"
          :data-testid="`div_warningInfo_${index}`"
          @click="handleClick(item)"
        >
          <AntBadge :count="item?.count">
            <VbenIcon
              :color="item.color"
              :icon="item.icon"
              class="transition-all duration-300 group-hover:scale-125 lg:size-4 2xl:size-7"
            />
          </AntBadge>
          <span
            class="xl:text-md truncate lg:mt-1 2xl:mt-2"
            :style="{ color: item?.color || 'inherit' }"
          >
            {{ item.title }}
          </span>
        </div>
      </template>
    </CardContent>
  </Card>
</template>

<style lang="less" scoped>
@media (min-width: 1280px) {
  .waring-item {
    padding: 0 16px;
  }
}
</style>
