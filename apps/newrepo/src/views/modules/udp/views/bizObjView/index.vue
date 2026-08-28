<script lang="ts" setup>
import { Page } from '@vben/common-ui'; // 页面组件

import { useChcGrid } from '#/adapter/chc-ui'; // 导入生成表格的hook

import { useGridOptions } from './option';

const [
  ChcGrid,
  ChcGridApi,
  { LogModal, FormModal, handleDel, handleView, handleEdit },
] = useChcGrid(
  {},
  useGridOptions((actionCode: string) => {
    return { edit: handleEdit, view: handleView, delete: handleDel }[
      actionCode
    ];
  }),
);
</script>

<template>
  <Page auto-content-height content-class="p-[0.5rem]" header-class="px-3 py-2">
    <FormModal />
    <LogModal />
    <ChcGrid />
  </Page>
</template>
