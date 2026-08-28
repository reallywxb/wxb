<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */

import { computed } from 'vue';

import { Select, SelectOption } from 'ant-design-vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  valueConfig: {
    type: Object,
    default: () => ({}),
  },
});
const options = computed(() => {
  return props.valueConfig.options;
});

const formValue = computed({
  get() {
    const value = props.valueConfig.value;
    return value?.length === 1 ? value[0].key : undefined;
  },
  set(t) {
    props.valueConfig.value = options.value.filter((res) => res.key === t);
  },
});
</script>

<template>
  <Select v-model:value="formValue" placeholder="" style="width: 100%">
    <SelectOption v-for="item in options" :key="item.key">
      {{ item.value }}
    </SelectOption>
  </Select>
</template>

<style scoped lang="less"></style>
