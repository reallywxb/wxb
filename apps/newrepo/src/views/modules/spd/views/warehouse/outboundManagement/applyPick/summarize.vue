<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    calculateSelectedAmount: (rows: any[]) => any;
  }>(),
  {},
);
const refreshNumber = (rows: any[]) => {
  summarize.value = props.calculateSelectedAmount(rows);
};
const summarize = ref<{
  [key: string]: any;
}>({});
defineExpose({
  refreshNumber,
});
</script>
<template>
  <span>汇总 </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <span>待发数量: {{ summarize.totalQtyLeft || 0 }}</span>
  <span class="ml-[20px]">指示数量: {{ summarize.totalQtyProcess || 0 }}</span>
  <span class="ml-[20px]">缺货数量: {{ summarize.totalQtyPo || 0 }}</span>
</template>
<style scoped></style>
