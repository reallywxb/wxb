<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

// 页面布局组件
import SpdPage from '#/components/spd/page/spdPageNew.vue';

import DetailQuery from './detailQuery.vue'; // 明细查询页面
import DocumentDetail from './documentDetail.vue'; // 采购明细可编辑表页面
import HasSubmited from './hasSubmited.vue'; // 已提交页面
import SummaryQuery from './summaryQuery.vue'; // 汇总查询页面
import WaitToSubmit from './waitToSubmit.vue';
// 待提交页面
const route = useRoute();
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});
// 头部tab数组
const headerTabs = ref([
  {
    label: '待提交',
    value: 0,
    disabled: false,
  },
  {
    label: '已提交',
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
const currentTab = ref<number>(isFromTraceSearchPage.value ? 2 : 0); // 当前显示的tab
const currentHandleRow = ref<any>(undefined); // 跳转编辑页时，标记当前正在处理的行数据
const detailConfig = ref<DetailInfo | undefined>(undefined); // 编辑查看页面的配置信息
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:current-handle-row="currentHandleRow"
    v-model:detail-config="detailConfig"
  >
    <template #headerTab-0="scope">
      <WaitToSubmit
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[0] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>
    <template #headerTab-1="scope">
      <HasSubmited
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
