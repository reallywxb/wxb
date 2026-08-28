<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    calculateSummarize?: () => any;
  }>(),
  {
    calculateSummarize: () => {},
  },
);

interface SummaryItem {
  label: string;
  value: number | string;
  noUnit?: boolean;
  style?: string;
}
const refreshNumber = (data: any) => {
  summarize.value = data;
};

const summarize = ref<SummaryItem[]>([]);
defineExpose({
  refreshNumber,
});

onMounted(() => {
  props.calculateSummarize && props.calculateSummarize();
});
</script>
<template>
  <span v-for="item in summarize" :key="item.label" class="ml-[20px]">
    {{ item.label }}：
    <span :style="item.style">
      {{ item.value || 0 }}{{ item.noUnit ? '' : '元' }}
    </span>
  </span>
</template>
<style scoped></style>
