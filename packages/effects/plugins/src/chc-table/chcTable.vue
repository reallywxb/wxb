<script setup lang="ts">
import { ref } from 'vue';

import { VxeGrid } from 'vxe-table';

const gridRef = ref(null);

// 暴露实例获取方法
defineExpose({
  getGridInstance: () => gridRef.value,
});
</script>
<template>
  <VxeGrid ref="gridRef" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope"></slot>
    </template>
  </VxeGrid>
</template>
<style scoped></style>
