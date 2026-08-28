<script lang="ts" setup>
import { ref } from 'vue';

import SpdPage from '#/components/spd/page/spdPageNew.vue';

// 采退订单明细
import DetailQuery from './detailQuery.vue';
import InfoQuery from './infoQuery.vue';

const headerTabs = ref([
  {
    label: '单据信息',
    value: 0,
    disabled: false,
  },
  {
    label: '明细查询',
    value: 1,
    disabled: false,
  },
  {
    label: '单据明细',
    value: 2,
    disabled: true,
  },
]);
const currentTab = ref<number>(0);
const parentData = ref<any>(undefined);
const detailInfo = ref<DetailInfo | undefined>(undefined); // 详情页数据
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:parent-data="parentData"
    v-model:detail-info="detailInfo"
  >
    <template #headerTab-0="scope">
      <InfoQuery
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[0] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>
    <template #headerTab-1="scope">
      <DetailQuery
        v-show="currentTab === 1"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[1] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
