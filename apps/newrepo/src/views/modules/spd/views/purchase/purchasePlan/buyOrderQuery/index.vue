<script lang="ts" setup>
import { ref } from 'vue';

// 采退订单明细
// import { SpdPage } from '#/components/spd';
import SpdPage from '#/components/spd/page/spdPageNew.vue';

import DetailQuery from './detailQuery.vue';
import DocumentDetail from './documentDetail.vue';
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
const currentTab = ref<number>(0); // 当前显示的tab
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
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>
    <template #headerTab-2="scope">
      <DocumentDetail
        v-if="currentTab === 2"
        v-model:current-tab="currentTab"
        v-model:current-handle-row="currentHandleRow"
        v-model:detail-config="detailConfig"
        :this-tab="headerTabs[4] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
      />
    </template>
  </SpdPage>
</template>

<style scoped></style>
