<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed, nextTick, ref } from 'vue';

import { EditOutlined } from '@ant-design/icons-vue';
import { Input } from 'ant-design-vue';

import { placeholderList } from '#/utils/flow/const.js';

const props = defineProps({
  nodeConfig: {
    type: Object,
    default: () => {},
  },
});

const input = ref(false);

const defaultText = computed(() => {
  return placeholderList[props.nodeConfig.type];
});

const titleInputBlurEvent = () => {
  input.value = false;
  props.nodeConfig.nodeName = props.nodeConfig.nodeName || defaultText;
};
const titleInputRef = ref();
const titleTextClickEvent = () => {
  input.value = true;
  nextTick(() => {
    titleInputRef.value.focus();
  });
};
</script>

<template>
  <div>
    <b
      class="replace-el-text"
      style="cursor: pointer"
      v-if="!input"
      @click="titleTextClickEvent"
    >
      {{ nodeConfig.nodeName }}
      <EditOutlined />
    </b>
    <Input
      ref="titleInputRef"
      @blur="titleInputBlurEvent"
      maxlength="10"
      v-if="input"
      v-model:value="nodeConfig.nodeName"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../../../../../../styles/flow/common';
</style>
