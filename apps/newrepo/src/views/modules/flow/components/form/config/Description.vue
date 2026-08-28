<script setup lang="ts">
import { computed, watch } from 'vue';

import { getCurrentConfig } from '#/utils/flow/objutil';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

const config = computed(() => {
  return getCurrentConfig(props.id);
});

const placeHolder = computed(() => {
  return config?.value?.placeholder;
});

watch(
  () => placeHolder.value,
  (f) => {
    if (config.value) {
      config.value.props.value = f;
    }
  },
  { deep: true },
);
</script>

<template>
  <div></div>
</template>

<style scoped lang="less"></style>
