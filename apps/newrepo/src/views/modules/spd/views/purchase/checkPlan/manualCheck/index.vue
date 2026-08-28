<script lang="ts" setup>
import { ref, watch } from 'vue';

import { SpdPage } from '#/components/spd';

import CollectSearch from './collectSearch.vue';
import DocumentDetail from './documentDetail.vue';
import HandleCheck from './handleCheck.vue';
import InfoQuery from './infoQuery.vue';

const headerTabs = ref([
  {
    label: '查询列表',
    value: 0,
    disabled: false,
  },
  {
    label: '明细查询',
    value: 1,
    disabled: false,
  },
  {
    label: '汇总查询',
    value: 2,
    disabled: false,
  },
  {
    label: '单据明细',
    value: 3,
    disabled: true,
  },
]);
const currentTab = ref(0);
const parentData = ref(undefined);
const detailInfo = ref(undefined); // 详情页数据
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
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:parent-data="parentData"
    v-model:detail-info="detailInfo"
  >
    <template #headerTab-0>
      <HandleCheck
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[0] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
    <template #headerTab-1>
      <InfoQuery
        v-show="currentTab === 1"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[1] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
    <template #headerTab-2>
      <CollectSearch
        v-show="currentTab === 2"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[2] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
    <template #headerTab-3>
      <DocumentDetail
        v-if="currentTab === 3"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[3] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
