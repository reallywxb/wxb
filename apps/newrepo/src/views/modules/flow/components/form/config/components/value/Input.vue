<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { Input } from 'ant-design-vue';

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
  <Input v-model:value="valueConfig.value" />
</template>

<style scoped lang="less"></style>
