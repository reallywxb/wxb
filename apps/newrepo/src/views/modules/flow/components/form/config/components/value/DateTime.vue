<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { DatePicker } from 'ant-design-vue';

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
  <DatePicker
    class="formDate"
    value-format="YYYY-MM-DD HH:mm:ss"
    v-model:value="valueConfig.value"
    show-time
  />
</template>

<style scoped lang="less"></style>
