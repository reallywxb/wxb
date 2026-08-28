<script lang="ts" setup>
import { ref, watch } from 'vue';

import { SpdPage } from '#/components/spd';

import DocumentDetail from './documentDetail.vue';
import InfoQuery from './infoQuery.vue';

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 生成采退订单改造为列表页+编辑页
// @description 父页面管理列表页和编辑页的tab切换
const headerTabs = ref([
  {
    label: '查询列表',
    value: 0,
    disabled: false,
  },
  {
    label: '单据明细',
    value: 1,
    disabled: true,
  },
]);

const currentTab = ref(0);
const parentData = ref<any>(undefined);
const detailInfo = ref<DetailInfo | undefined>(undefined);

watch(
  () => currentTab.value,
  (val) => {
    if (val === headerTabs.value.length - 1) {
      headerTabs.value[headerTabs.value.length - 1]!.disabled = false;
    } else {
      headerTabs.value[headerTabs.value.length - 1]!.disabled = true;
    }
  },
);
</script>

<template>
  <SpdPage
    :class="!currentTab ? 'hide-tab' : ''"
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:parent-data="parentData"
    v-model:detail-info="detailInfo"
  >
    <template #headerTab-0>
      <InfoQuery
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[0] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
    <template #headerTab-1>
      <DocumentDetail
        v-if="currentTab === 1"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        v-model:detail-info="detailInfo"
        :this-tab="headerTabs[1] as PageTab"
      />
    </template>
  </SpdPage>
</template>

<style scoped>
::v-deep.hide-tab .py-2 {
  display: none;
}
</style>
