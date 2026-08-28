<script setup lang="ts">
import { ref } from 'vue';

type summaryRow = {
  totalLineAmtPricelist: number;
  totalAmt: number;
  totalQty: number;
};
const calculateSelectedAmount = (summaryRow: summaryRow) => {
  const totalLineAmt = summaryRow?.totalLineAmtPricelist;
  const totalAmt = summaryRow?.totalAmt;
  const totalQty = summaryRow?.totalQty;
  return {
    totalLineAmt,
    totalAmt,
    totalQty,
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
  <span class="ml-[20px]">
    <span class="font-bold">零售金额:</span>
    {{ summarize.totalLineAmt || 0 }}&nbsp;元
  </span>
  <span class="ml-[20px]">
    <span class="font-bold">采购金额:</span>
    {{ summarize.totalAmt || 0 }}&nbsp;元
  </span>
  <span class="ml-[20px]">
    <span class="font-bold">数量汇总: </span>
    {{ summarize.totalQty || 0 }}
  </span>
</template>
<style scoped></style>
