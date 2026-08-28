<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';

import { TabPane, Tabs } from 'ant-design-vue';

import warehouseCommodityGroup from './childrenComponents/warehouseCommodityGroup.vue'; // 仓库商品组
import warehouseCommodityTypes from './childrenComponents/warehouseCommodityTypes.vue'; // 仓库商品类型
import warehouseInfo from './childrenComponents/warehouseInfo.vue'; // 仓库信息
import warehouseRoom from './childrenComponents/warehouseRoom.vue'; // 仓库库房
import warehouseUser from './childrenComponents/warehouseUser.vue'; // 仓库用户

const activeTab = ref('1');

// 定义组件隐射
const diffWarehouseComMap = shallowRef({
  '1': warehouseInfo,
  '2': warehouseRoom,
  '3': warehouseUser,
  '4': warehouseCommodityGroup,
  '5': warehouseCommodityTypes,
});

// 使用计算属性动态渲染组件
const currentWarehouseCom = computed(() => {
  return (
    diffWarehouseComMap.value[
      activeTab.value as keyof typeof diffWarehouseComMap.value
    ] || warehouseInfo
  );
});

const onTabChange = (activeKey: string) => {
  activeTab.value = activeKey;
  console.warn('key===>', activeKey);
  switch (activeKey) {
    case '1': {
      console.warn('仓库信息');
      break;
    }
    case '2': {
      console.warn('仓库库房');
      break;
    }
    case '3': {
      console.warn('仓库用户');
      break;
    }
    case '4': {
      console.warn('仓库商品组');
      break;
    }
    case '5': {
      console.warn('仓库商品类型');
      break;
    }
  }
};

// 【新增】监听组件挂载/卸载，确保tab状态保持
watch(
  () => activeTab.value,
  (newVal) => {
    console.warn('当前tab:', newVal);
  },
  { immediate: true },
);
</script>

<template>
  <div class="sub-endemic p-[0.5rem]">
    <Tabs
      v-model:active-key="activeTab"
      @change="onTabChange"
      data-testid="Tabs_activeTab_warehouseComponent"
    >
      <TabPane
        key="1"
        tab="仓库信息"
        data-testid="TabPane_1_warehouseComponent"
      />
      <TabPane
        key="2"
        tab="仓库库房"
        data-testid="TabPane_2_warehouseComponent"
      />
      <TabPane
        key="3"
        tab="仓库用户"
        data-testid="TabPane_3_warehouseComponent"
      />
      <TabPane
        key="4"
        tab="仓库商品组"
        data-testid="TabPane_4_warehouseComponent"
      />
      <TabPane
        key="5"
        tab="仓库商品类型"
        class="h-full"
        data-testid="TabPane_5_warehouseComponent"
      />
    </Tabs>
    <div class="grid-container">
      <component :is="currentWarehouseCom" class="grid-item" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sub-endemic {
  display: flex;
  flex-direction: column;
  height: 100%;

  .grid-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
