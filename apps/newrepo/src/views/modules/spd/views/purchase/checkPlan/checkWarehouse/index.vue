<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { SpdPage } from '#/components/spd';

import CollectSearch from './collectSearch.vue';
import DocumentDetail from './documentDetail.vue';
import HandleCheck from './handleCheck.vue';
import HasCheck from './hasCheck.vue';
import InfoQuery from './infoQuery.vue';

const route = useRoute();
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});
const headerTabs = ref([
  {
    label: '待验收',
    value: 0,
    disabled: false,
  },
  {
    label: '已验收',
    value: 1,
    disabled: false,
  },
  {
    label: '明细查询',
    value: 2,
    disabled: false,
  },
  {
    label: '汇总查询',
    value: 3,
    disabled: false,
  },
  {
    label: '单据明细',
    value: 4,
    disabled: true,
  },
]);
const currentTab = ref(
  isFromTraceSearchPage.value
    ? Number.parseInt(route.query.currentTab as string, 10)
    : 0,
);
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
      <HasCheck
        v-show="currentTab === 1"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[1] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
    <template #headerTab-2>
      <InfoQuery
        v-show="currentTab === 2"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[2] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
    <template #headerTab-3>
      <CollectSearch
        v-show="currentTab === 3"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[3] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
    <template #headerTab-4>
      <DocumentDetail
        v-if="currentTab === 4"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[4] as PageTab"
        v-model:detail-info="detailInfo"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
