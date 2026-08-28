<script lang="ts" setup>
import { ref, watch } from 'vue';

// 采退订单明细
// import { SpdPage } from '#/components/spd';
import SpdPage from '#/components/spd/page/spdPageNew.vue';

// import AutoCreatOrder from './autoCreatOrder.vue';
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
  // {
  //   label: '自动生成计划',
  //   value: 2,
  //   disabled: false,
  // },
]);
const currentTab = ref(0);
const parentData = ref(undefined);
const detailInfo = ref(undefined);
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
const currentHandleRow = ref<any>(undefined); // 跳转编辑页时，标记当前正在处理的行数据
const detailConfig = ref<DetailInfo | undefined>(undefined); // 编辑查看页面的配置信息
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:current-handle-row="currentHandleRow"
    v-model:parent-data="parentData"
    v-model:detail-info="detailInfo"
    v-model:detail-config="detailConfig"
    mode="noTab"
  >
    <template #headerTab-0="scope">
      <InfoQuery
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[0] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
      />
    </template>
    <template #headerTab-1>
      <DocumentDetail
        v-if="currentTab === 1"
        v-model:current-tab="currentTab"
        v-model:current-handle-row="currentHandleRow"
        v-model:detail-config="detailConfig"
        v-model:detail-info="detailConfig"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[1] as PageTab"
      />
    </template>
  </SpdPage>
</template>
