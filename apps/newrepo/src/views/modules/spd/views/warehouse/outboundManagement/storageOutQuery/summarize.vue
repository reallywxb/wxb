<script setup lang="ts">
import { ref } from 'vue';

type summaryRow = {
  totalAmt: number;
  totalQty: number;
};
const calculateSelectedAmount = (summaryRow: summaryRow) => {
  const totalLineAmt = summaryRow.totalAmt;
  const totalMovementQty = summaryRow.totalQty;

  return {
    totalLineAmt,
    totalMovementQty,
  };
};
const refreshNumber = (summaryRow: summaryRow) => {
  summarize.value = calculateSelectedAmount(summaryRow);
};
const summarize = ref<{
  [key: string]: any;
}>({});
defineExpose({
  refreshNumber,
});
</script>
<template>
  <!-- <span>汇总 </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <span>待发数量: {{ summarize.totalQtyLeft || 0 }}</span> -->
  <span class="ml-[20px]">
    <span class="font-bold">金额汇总:</span>
    {{ summarize.totalLineAmt || 0 }}
  </span>
  <span class="ml-[20px]">
    <span class="font-bold">数量汇总: </span>
    {{ summarize.totalMovementQty || 0 }}
  </span>
</template>
<style scoped></style>
