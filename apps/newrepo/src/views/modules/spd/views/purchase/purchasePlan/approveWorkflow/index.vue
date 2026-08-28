<script lang="ts" setup>
import { ref } from 'vue';

// 采退订单明细
import SpdPage from '#/components/spd/page/spdPageNew.vue';

import DetailQuery from './detailQuery.vue';
import DocumentDetail from './documentDetail.vue';
import HasCheck from './hasCheck.vue';
import SummaryQuery from './summaryQuery.vue';
import WaitToCheck from './waitToCheck.vue';

const headerTabs = ref([
  {
    label: '待审核',
    value: 0,
    disabled: false,
  },
  {
    label: '已审核',
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
const currentTab = ref(0); // 当前显示的tab
const currentHandleRow = ref<any>(undefined); // 跳转编辑页时，标记当前正在处理的行数据
const detailConfig = ref<DetailInfo | undefined>(undefined); // 编辑查看页面的配置信息
// watch(
//   () => currentTab.value,
//   (val) => {
//     if (val === headerTabs.value.length - 1) {
//       headerTabs.value[headerTabs.value.length - 1]!.disabled = false;
//     } else {
//       headerTabs.value[headerTabs.value.length - 1]!.disabled = true;
//     }
//   },
// );
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:current-handle-row="currentHandleRow"
    v-model:detail-config="detailConfig"
  >
    <template #headerTab-0="scope">
      <WaitToCheck
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[0] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>
    <template #headerTab-1="scope">
      <HasCheck
        v-show="currentTab === 1"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[1] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>
    <template #headerTab-2="scope">
      <DetailQuery
        v-show="currentTab === 2"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[2] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>
    <template #headerTab-3="scope">
      <SummaryQuery
        v-show="currentTab === 3"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[3] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
      />
    </template>
    <template #headerTab-4>
      <DocumentDetail
        v-if="currentTab === 4"
        v-model:current-tab="currentTab"
        v-model:current-handle-row="currentHandleRow"
        v-model:detail-config="detailConfig"
        :this-tab="headerTabs[4] as PageTab"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
