<script lang="ts" setup>
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useGrid } from './index';

const {
  ParentGrid,
  parentGridApi,
  OrgChangeLogModal,
  handleViewOrgChangeLog,
  handleExport,
} = useGrid();

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ParentGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleExport"
          data-testid="button_export"
        >
          导出
          <!--              <template #icon>-->
          <!--                <SvgPrintFillIcon />-->
          <!--              </template>-->
        </Button>
      </template>
      <template #action="scope">
        <Button
          type="primary"
          ghost
          @click="handleViewOrgChangeLog(scope.row)"
          :data-testid="`button_changeLog_${scope.rowIndex}`"
        >
          变更日志
        </Button>
      </template>
    </ParentGrid>
  </Page>
  <OrgChangeLogModal />
</template>
