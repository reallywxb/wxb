<script lang="ts" setup>
import { ref } from 'vue';

import { SpdPage } from '#/components/spd';

import CollectSearch from './collectSearch.vue';
import HandleCheck from './handleCheck.vue';
import InfoQuery from './infoQuery.vue';

const headerTabs = ref([
  {
    label: '按科室',
    value: 0,
    disabled: false,
  },
  {
    label: '按开单医生',
    value: 1,
    disabled: false,
  },
  {
    label: '按病种',
    value: 2,
    disabled: false,
  },
  {
    label: '详情页占位',
    value: 3,
    disabled: true,
  },
]);
const currentTab = ref(0);
const parentData = ref(undefined);
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:parent-data="parentData"
  >
    <template #headerTab-0>
      <HandleCheck
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[0] as PageTab"
      />
    </template>
    <template #headerTab-1>
      <InfoQuery
        v-show="currentTab === 1"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[1] as PageTab"
      />
    </template>
    <template #headerTab-2>
      <CollectSearch
        v-show="currentTab === 2"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[2] as PageTab"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
