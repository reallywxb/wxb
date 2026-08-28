<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */

import { Textarea } from 'ant-design-vue';

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
  <Textarea v-model:value="valueConfig.value" />
</template>

<style scoped lang="less"></style>
