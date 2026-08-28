<script lang="ts" setup>
import { Page } from '@vben/common-ui'; // 页面组件

import { useChcGrid } from '#/adapter/chc-ui'; // 导入生成表格的hook

import { useGridOptions } from './option';

const [ChcGrid] = useChcGrid(
  {},
  useGridOptions((actionCode: string) => {
    return {}[actionCode];
  }),
);
</script>

<template>
  <Page auto-content-height content-class="p-[0.5rem]" header-class="px-3 py-2">
    <ChcGrid />
  </Page>
</template>
