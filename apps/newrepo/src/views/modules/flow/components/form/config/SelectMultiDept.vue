<script setup lang="ts">
import { computed, defineExpose } from 'vue';

import { FormItem } from 'ant-design-vue';

import { getCurrentConfig } from '#/utils/flow/objutil';

import ValueCom from './components/value/SelectMultiDept.vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

const config = computed(() => {
  return getCurrentConfig(props.id);
});

// 校验
const validate = () => {
  return true;
};
defineExpose({ validate });
</script>

<template>
  <div v-if="config">
    <FormItem label="默认值">
      <ValueCom :id="id" :value-config="config.props" />
    </FormItem>
  </div>
</template>

<style scoped lang="less"></style>
