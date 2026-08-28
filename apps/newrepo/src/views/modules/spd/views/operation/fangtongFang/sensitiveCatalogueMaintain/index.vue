<script lang="ts" setup>
import { ref, watch } from 'vue';

import { SpdPage } from '#/components/spd';

import SensitiveFunctionSetting from './sensitivefunctionSetting.vue';
import SensitiveMaterialsSetting from './sensitiveMaterialsSetting.vue';
import SensitivePersonnelSetting from './sensitivePersonnelSetting.vue';

const headerTabs = ref([
  {
    label: '敏感功能设置',
    value: 0,
    disabled: false,
  },
  {
    label: '敏感物资设置',
    value: 1,
    disabled: false,
  },
  {
    label: '敏感人员设置',
    value: 2,
    disabled: false,
  },
  {
    label: 'test',
    value: 3,
    disabled: false,
  },
]);
const currentTab = ref(0);
const parentData = ref(undefined);
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
  >
    <template #headerTab-0>
      <SensitiveFunctionSetting
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[0] as PageTab"
      />
    </template>
    <template #headerTab-1>
      <SensitiveMaterialsSetting
        v-show="currentTab === 1"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[1] as PageTab"
      />
    </template>
    <template #headerTab-2>
      <SensitivePersonnelSetting
        v-show="currentTab === 2"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[2] as PageTab"
      />
    </template>
    <template #headerTab-3>
      <SensitivePersonnelSetting
        v-show="currentTab === 3"
        v-model:current-tab="currentTab"
        v-model:header-tabs="headerTabs"
        v-model:parent-data="parentData"
        :this-tab="headerTabs[3] as PageTab"
      />
    </template>
  </SpdPage>
</template>
<style scoped></style>
