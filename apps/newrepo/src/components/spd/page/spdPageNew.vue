<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { AntdArrowLeftOutlined } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import PageInnerTabs from './pageInnerTabs.vue';

type Tab = {
  disabled?: boolean;
  label: string;
  value: number;
};
const props = withDefaults(
  defineProps<{
    mode?: 'default' | 'noTab';
  }>(),
  {
    mode: 'default',
  },
);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<Tab[]>('headerTabs', { required: true });
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
});
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig');
const handleBack = () => {
  currentTab.value = detailConfig.value?.sourcePage;
};
const goToDetailPage = (
  row: any,
  detailPageConfig: DetailInfo,
  callBack?: () => void,
) => {
  currentTab.value = headerTabs.value.length - 1;
  currentHandleRow.value = row;
  detailConfig.value = detailPageConfig;
  callBack && typeof callBack === 'function' && callBack();
};
const getDetailPageConfig = () => {
  return {
    detailPageValue: headerTabs.value[headerTabs.value.length - 1]
      ?.value as number,
    detailPageType: detailConfig.value?.type,
  };
};
const isInDetailPage = computed(() => {
  return (
    headerTabs.value.length > 0 &&
    currentTab.value === headerTabs.value[headerTabs.value.length - 1]!.value
  );
});
const pageRef = ref();
watch(
  () => currentTab.value,
  (val, oldVal) => {
    if (
      props.mode === 'noTab' &&
      (val === headerTabs.value.length - 1 ||
        oldVal === headerTabs.value.length - 1)
    ) {
      pageRef.value.calcContentHeight();
    }
  },
);
</script>

<template>
  <Page
    ref="pageRef"
    content-class="p-[0.5rem]"
    auto-content-height
    header-class="px-3 py-2"
  >
    <template
      #description
      v-if="
        (props.mode === 'noTab' && isInDetailPage) || props.mode === 'default'
      "
    >
      <PageInnerTabs
        v-show="
          headerTabs.length > 0 &&
          currentTab !== headerTabs[headerTabs.length - 1]!.value
        "
        :tabs="headerTabs"
        v-model:current="currentTab"
      />
      <!-- ghost :icon="h(AntdArrowLeftOutlined)"-->
      <Button v-show="isInDetailPage" type="primary" @click="handleBack">
        <AntdArrowLeftOutlined class="mb-[4px]" />
        返回
      </Button>
      <span
        v-show="isInDetailPage"
        class="absolute left-[50%] top-[50%] h-[40px] translate-x-[-50%] translate-y-[-50%] select-none text-center text-[18px] font-bold leading-[40px]"
      >
        {{ detailConfig?.detailTitle }}
      </span>
    </template>
    <div class="h-full">
      <template v-for="item in headerTabs">
        <slot
          :name="`headerTab-${item.value}`"
          v-bind="{ goToDetailPage, getDetailPageConfig }"
        ></slot>
      </template>
    </div>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-cell .ant-btn > svg) {
  margin-right: -4px;
  margin-bottom: 3px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-buttons--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--toolbar-wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--bottom-wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.ant-input-disabled) {
  color: #7c7c7c;
}

::v-deep(.ant-picker .ant-picker-input > input[disabled]) {
  color: #7c7c7c;
}

::v-deep(
  .ant-select-disabled.ant-select:not(.ant-select-customize-input)
    .ant-select-selector
) {
  color: #7c7c7c;
}
</style>
