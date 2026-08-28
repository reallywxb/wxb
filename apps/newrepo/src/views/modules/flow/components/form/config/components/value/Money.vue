<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { InputNumber } from 'ant-design-vue';

defineProps({
  id: {
    type: String,
    default: '',
  },
  valueConfig: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <InputNumber
    :precision="valueConfig.radixNum"
    controls-position="right"
    style="width: 100%"
    v-model:value="valueConfig.value"
  />
</template>

<style scoped lang="less"></style>
