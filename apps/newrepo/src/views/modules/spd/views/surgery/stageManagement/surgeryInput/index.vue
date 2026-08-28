<script lang="ts" setup>
import { ref } from 'vue';

// 页面布局组件
import SpdPage from '#/components/spd/page/spdPageNew.vue';

import DocumentDetail from './documentDetail.vue'; // 采购明细可编辑表页面
import MainPage from './mainPage.vue'; // 待提交页面
// 头部tab数组
const headerTabs = ref([
  {
    label: '待提交',
    value: 0,
    disabled: false,
  },
  {
    label: '详情',
    value: 1,
    disabled: false,
  },
]);
const currentTab = ref<number>(0); // 当前显示的tab
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
      <MainPage
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
        :this-tab="headerTabs[4] as PageTab"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
