<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui'; // 页面组件

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { TabPane, Tabs } from 'ant-design-vue';

import { useChcGrid } from '#/adapter/chc-ui'; // 导入生成表格的hook

import { useReportSettingGridOptions,useReportPrinterGridOptions,useReportOrgGridOptions,useReportRoleGridOptions } from './childOption';
import { useGridOptions } from './option';

const parentRow = ref({ reportId: '' });

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
  parentRow.value.reportId = row ? row.id : '';
};


const [ReportSettingGrid] = useChcGrid(
  {},
  useReportSettingGridOptions((actionCode: string) => {
    return {}[actionCode];
  }, parentRow),
);
const [ReportPrinterGrid] = useChcGrid(
  {},
  useReportPrinterGridOptions((actionCode: string) => {
    return {}[actionCode];
  }, parentRow),
);
const [ReportOrgGrid] = useChcGrid(
  {},
  useReportOrgGridOptions((actionCode: string) => {
    return {}[actionCode];
  }, parentRow),
);
const [ReportRoleGrid] = useChcGrid(
  {},
  useReportRoleGridOptions((actionCode: string) => {
    return {}[actionCode];
  }, parentRow),
);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.5"
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
          <TabPane key="ReportSetting" tab="报表设置" class="tab-pane h-full" force-render>
            <ReportSettingGrid />
          </TabPane>
          <!--<TabPane key="ReportPrinter" tab="报表打印机设置" class="tab-pane h-full" force-render>
            <ReportPrinterGrid />
          </TabPane>-->
          <TabPane key="ReportOrg" tab="报表机构" class="tab-pane h-full" force-render>
            <ReportOrgGrid />
          </TabPane>
          <TabPane key="ReportRole" tab="报表角色" class="tab-pane h-full" force-render>
            <ReportRoleGrid />
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
