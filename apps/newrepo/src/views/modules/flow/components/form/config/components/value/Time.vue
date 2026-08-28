<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { TimePicker } from 'ant-design-vue';

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
  <TimePicker
    arrow-control
    size="default"
    class="formDate"
    value-format="HH:mm:ss"
    v-model:value="valueConfig.value"
  />
</template>

<style scoped lang="less"></style>
