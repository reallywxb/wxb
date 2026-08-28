<script setup lang="ts">
import { computed, defineExpose } from 'vue';

import { Checkbox, FormItem } from 'ant-design-vue';

import { getCurrentConfig } from '#/utils/flow/objutil';

import ValueCom from './components/value/SelectUser.vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

const config = computed(() => {
  return getCurrentConfig(props.id);
});

const defaultValue = computed({
  get: () => {
    return config.value.props.value;
  },
  set: (s: any[]) => {
    config.value.props.value = s;
  },
});

// 校验
const validate = () => {
  return true;
};
defineExpose({ validate });
</script>

<template>
  <div v-if="config">
    <FormItem label="选择范围">
      <Checkbox
        v-model:checked="config.props.self"
        :disabled="defaultValue.length > 0"
      >
        可选自己
      </Checkbox>
    </FormItem>
    <FormItem label="默认值">
      <ValueCom :id="id" :value-config="config.props" />
    </FormItem>
  </div>
</template>

<style scoped lang="less"></style>
