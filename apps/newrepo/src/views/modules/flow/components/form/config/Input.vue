<script setup lang="ts">
import { computed } from 'vue';

import { FormItem, Input, InputNumber } from 'ant-design-vue';

import { getCurrentConfig } from '#/utils/flow/objutil';

import ValueCom from './components/value/Input.vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

const config = computed(() => {
  return getCurrentConfig(props.id);
});
</script>

<template>
  <div v-if="config">
    <FormItem label="最小长度">
      <InputNumber
        :step="1"
        step-strictly
        v-model:value="config.props.minLength"
        style="width: 100%"
        controls-position="right"
        :min="1"
        :max="100"
      />
    </FormItem>
    <FormItem label="最大长度">
      <InputNumber
        :step="1"
        step-strictly
        v-model:value="config.props.maxLength"
        style="width: 100%"
        controls-position="right"
        :min="1"
        :max="100"
      />
    </FormItem>
    <FormItem label="正则表达式">
      <Input placeholder="^\d+$" v-model:value="config.props.regex" />
    </FormItem>
    <FormItem label="正则表达式提示语">
      <Input
        placeholder="表单值不符合正则表达式"
        v-model:value="config.props.regexDesc"
      />
    </FormItem>
    <FormItem label="默认值">
      <ValueCom :id="id" :value-config="config.props" />
    </FormItem>
  </div>
</template>

<style scoped lang="less"></style>
