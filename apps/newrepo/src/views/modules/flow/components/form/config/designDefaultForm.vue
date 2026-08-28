<script setup lang="ts">
import { defineProps } from 'vue';

import { Button } from 'ant-design-vue';

import { isNotBlank } from '#/utils/flow/objutil';

defineProps({
  icon: {
    type: Object,
    default: () => {},
  },
  form: {
    type: Object,
    default: () => {},
  },
  height: {
    type: Number,
    default: 34,
  },
});
</script>

<template>
  <div
    style="
      padding-left: 10px;
      color: #ababb2;
      background-color: #f5f7fa;
      border: 2px solid #eee;
      border-radius: 4px;
    "
    :style="{ height: `${height}px` }"
  >
    <template v-if="isNotBlank(icon)">
      <Button size="small" text :icon="$icon[icon]">
        <!--			{{ element.name }}-->
        {{ !form ? '' : form.placeholder }}
      </Button>
    </template>
    <template v-else>
      {{ !form ? '' : form.placeholder }}
    </template>
  </div>
</template>

<style scoped lang="less"></style>
