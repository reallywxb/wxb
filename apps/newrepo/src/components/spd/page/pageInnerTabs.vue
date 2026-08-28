<script setup lang="ts">
import { RadioButton, RadioGroup } from 'ant-design-vue';

withDefaults(
  defineProps<{
    tabs?: PageTab[];
  }>(),
  {
    tabs: () => [],
  },
);
const current = defineModel('current', { type: Number, default: 0 });
</script>
<template>
  <div>
    <RadioGroup v-model:value="current" button-style="solid">
      <template v-for="(item, index) in tabs" :key="item.value">
        <RadioButton
          :value="item.value"
          :disabled="item.disabled"
          v-if="index !== tabs.length - 1"
        >
          {{ item.label }}
        </RadioButton>
      </template>
    </RadioGroup>
  </div>
</template>
<style scoped></style>
