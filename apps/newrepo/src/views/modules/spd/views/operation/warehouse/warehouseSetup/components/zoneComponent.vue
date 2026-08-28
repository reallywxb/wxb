<script setup lang="ts">
import { computed, inject, onMounted, ref, shallowRef } from 'vue';

// useTemplateRef,
import { TabPane, Tabs } from 'ant-design-vue';

import { TREE_CONTEXT_KEY } from '../index';
import zoneInfo from './childrenComponents/zoneInfo.vue'; // 库房信息
import zoneSection from './childrenComponents/zoneSection.vue'; // 库区库房

// interface TableComponentExposed {
//   queryZoneInfo: (params: any) => void;
//   queryZoneSection: (params: { zoneId: string }) => void;
// }

const treeContext = inject(TREE_CONTEXT_KEY);
const activeTab = ref('1');
// const zoneComRef = useTemplateRef<TableComponentExposed>('zoneComRef');

// 定义组件隐射
const diffWarehouseComMap = shallowRef({
  '1': zoneInfo,
  '2': zoneSection,
});

// 使用计算属性动态渲染组件
const currentZoneCom = computed(() => {
  return (
    diffWarehouseComMap.value[
      activeTab.value as keyof typeof diffWarehouseComMap.value
    ] || zoneInfo
  );
});

const onTabChange = (activeKey: string) => {
  activeTab.value = activeKey;
  console.warn('key===>', activeKey);
  // switch (activeKey) {
  //   case '1': {
  //     nextTick(() => {
  //       zoneComRef.value &&
  //         zoneComRef.value.queryZoneInfo({
  //           zoneId: treeContext?.selectedNode.value?.id || '',
  //         });
  //     });

  //     break;
  //   }
  //   case '2': {
  //     // nextTick(endemicGridApi.query);
  //     break;
  //   }
  // }
};

onMounted(() => {
  console.warn('zooe层级treeContext===>', treeContext);
  // if (zoneComRef.value) {
  //   zoneComRef.value.queryZoneInfo(treeContext);
  // }
});
</script>

<template>
  <div class="sub-endemic p-[0.5rem]">
    <Tabs
      v-model:active-key="activeTab"
      @change="onTabChange"
      data-testid="Tabs_activeTab_zoneComponent"
    >
      <TabPane key="1" tab="库房信息" data-testid="TabPane_1_zoneComponent" />
      <TabPane key="2" tab="库房库区" data-testid="TabPane_2_zoneComponent" />
    </Tabs>
    <div class="grid-container">
      <!-- ref="zoneComRef" -->
      <component :is="currentZoneCom" class="grid-item" />
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
