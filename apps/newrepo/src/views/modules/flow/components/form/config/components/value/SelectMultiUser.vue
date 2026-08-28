<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */

import { computed } from 'vue';

import selectShow from '../../../../orgselect/selectAndShow.vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  valueConfig: {
    type: Object,
    default: () => ({}),
  },
  showStyle: {
    type: Number,
    default: 1,
  },
});

const defaultValue = computed({
  get: () => {
    return props.valueConfig.value || [];
  },
  set: (s: any[]) => {
    props.valueConfig.value = s;
  },
});
</script>

<template>
  <div>
    <select-show
      :show-style="showStyle"
      placeholder="请选择用户"
      :disabled="false"
      v-model:org-list="defaultValue"
      type="user"
      :multiple="true"
    />
  </div>
</template>

<style scoped lang="less"></style>
