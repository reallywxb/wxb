<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';

import { TabPane, Tabs } from 'ant-design-vue';

import sectionInfo from './childrenComponents/sectionInfo.vue'; // 库区信息
import sectionLocator from './childrenComponents/sectionlocator.vue'; // 库区货位

const activeTab = ref('1');

// 定义组件隐射
const diffWarehouseComMap = shallowRef({
  '1': sectionInfo,
  '2': sectionLocator,
});

// 使用计算属性动态渲染组件
const currentSectionCom = computed(() => {
  return (
    diffWarehouseComMap.value[
      activeTab.value as keyof typeof diffWarehouseComMap.value
    ] || sectionInfo
  );
});

const onTabChange = (activeKey: string) => {
  activeTab.value = activeKey;
  console.warn('key===>', activeKey);
};
</script>

<template>
  <div class="sub-endemic p-[0.5rem]">
    <Tabs
      v-model:active-key="activeTab"
      @change="onTabChange"
      data-testid="Tabs_activeTab_sectionComponent"
    >
      <TabPane
        key="1"
        tab="库区信息"
        data-testid="TabPane_1_sectionComponent"
      />
      <TabPane
        key="2"
        tab="库区货位"
        data-testid="TabPane_2_sectionComponent"
      />
    </Tabs>
    <div class="grid-container">
      <component :is="currentSectionCom" class="grid-item" />
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
  }
}
</style>
