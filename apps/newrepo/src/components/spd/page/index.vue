<script lang="ts" setup>
import { AntdArrowLeftOutlined } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import PageInnerTabs from './pageInnerTabs.vue';

type Tab = {
  disabled?: boolean;
  label: string;
  value: number;
};
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<Tab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const handleBack = () => {
  if (detailInfo.value) {
    currentTab.value = detailInfo.value.sourcePage;
    detailInfo.value = undefined;
  }
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <template #description v-if="headerTabs.length > 0">
      <PageInnerTabs
        v-show="
          headerTabs.length > 0 &&
          currentTab !== headerTabs[headerTabs.length - 1]!.value
        "
        :tabs="headerTabs"
        v-model:current="currentTab"
      />
      <!-- ghost :icon="h(AntdArrowLeftOutlined)"-->
      <Button
        v-show="
          headerTabs.length > 0 &&
          currentTab === headerTabs[headerTabs.length - 1]!.value
        "
        type="primary"
        @click="handleBack"
      >
        <AntdArrowLeftOutlined class="mb-[4px]" />
        返回
      </Button>
      <span
        v-show="
          headerTabs.length > 0 &&
          currentTab === headerTabs[headerTabs.length - 1]!.value
        "
        class="absolute left-[50%] top-[50%] h-[40px] translate-x-[-50%] translate-y-[-50%] select-none text-center text-[18px] font-bold leading-[40px]"
      >
        {{ detailInfo?.detailTitle }}
      </span>
    </template>
    <div class="h-full">
      <template v-for="item in headerTabs">
        <slot
          :name="`headerTab-${item.value}`"
          v-bind="{ currentTab, headerTabs, parentData }"
        ></slot>
      </template>
    </div>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-cell .ant-btn > svg) {
  margin-right: -4px;
  margin-bottom: 4px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-buttons--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--toolbar-wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
