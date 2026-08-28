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
    return value?.length > 0 ? value.map((res) => res.key) : undefined;
  },
  set(t) {
    props.valueConfig.value = options.value.filter((res) =>
      t.includes(res.key),
    );
  },
});
</script>
<template>
  <Select
    v-model:value="formValue"
    multiple
    collapse-tags
    collapse-tags-tooltip
    placeholder=""
    style="width: 100%"
  >
    <SelectOption v-for="item in options" :key="item.key">
      {{ item.value }}
    </SelectOption>
  </Select>
</template>
