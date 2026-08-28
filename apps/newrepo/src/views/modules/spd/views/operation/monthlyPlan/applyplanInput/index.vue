<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

// 页面布局组件
import SpdPage from '#/components/spd/page/spdPageNew.vue';

import DocumentDetail from './documentDetail.vue';
import InfoQuery from './infoQuery.vue';

const route = useRoute();
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});

// 头部tab数组
const headerTabs = ref([
  {
    label: '查询列表',
    value: 0,
    disabled: false,
  },
  {
    label: '录入明细',
    value: 1,
    disabled: true,
  },
]);
const currentTab = ref<number>(isFromTraceSearchPage.value ? 0 : 0); // 当前显示的tab
const currentHandleRow = ref<any>(undefined); // 跳转编辑页时，标记当前正在处理的行数据
const detailConfig = ref<DetailInfo | undefined>(undefined); // 编辑查看页面的配置信息
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:current-handle-row="currentHandleRow"
    v-model:detail-config="detailConfig"
    mode="noTab"
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
    <template #headerTab-1>
      <DocumentDetail
        v-if="currentTab === 1"
        v-model:current-tab="currentTab"
        v-model:current-handle-row="currentHandleRow"
        v-model:detail-config="detailConfig"
        :this-tab="headerTabs[1] as PageTab"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
