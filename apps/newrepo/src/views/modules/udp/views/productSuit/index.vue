<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui'; // 页面组件

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { TabPane, Tabs } from 'ant-design-vue';

import { useChcGrid } from '#/adapter/chc-ui'; // 导入生成表格的hook

import { useGridOptions as moduleUseGridOptions } from './moduleOption';
import { useGridOptions } from './option';

const parentRow = ref({ productSuitId: '' });

const [ChcGrid] = useChcGrid(
  {
    gridEvents: {
      radioChange({ row }: { row: any }) {
        handleRowChange(row);
      },
    },
  },
  useGridOptions((actionCode: string) => {
    return {}[actionCode];
  }),
);

const handleRowChange = (row: any) => {
  parentRow.value.productSuitId = row ? row.id : '';
};

const [ModuleGrid] = useChcGrid(
  {
    formOptions: {
      commonConfig: {
        labelClass: 'w-[60px]',
      },
      showCollapseButton: false,
    },
  },
  moduleUseGridOptions((actionCode: string) => {
    return {}[actionCode];
  }, parentRow),
);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid />
      </template>
      <template #second>
        <Tabs class="tabs h-full">
          <TabPane key="module" tab="模块" class="tab-pane h-full">
            <ModuleGrid />
          </TabPane>
        </Tabs>
      </template>
    </PageSplitLazy>
  </Page>
</template>
<style scoped>
::v-deep(.ant-tabs-content) {
  height: 100%;
}

::v-deep(.ant-tabs) {
  background-color: hsl(var(--background));
}

::v-deep(.ant-tabs-nav-wrap) {
  padding-left: 10px;
}
</style>
