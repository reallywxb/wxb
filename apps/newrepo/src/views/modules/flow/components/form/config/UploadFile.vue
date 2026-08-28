<script setup lang="ts">
import { computed } from 'vue';

import { FormItem, InputNumber, Select } from 'ant-design-vue';

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
</script>

<template>
  <div v-if="config">
    <FormItem label="最小数量">
      <InputNumber
        v-model:value="config.props.min"
        style="width: 100%"
        controls-position="right"
        :min="1"
        value-on-clear="min"
        :max="10"
      />
    </FormItem>
    <FormItem label="最大数量">
      <InputNumber
        v-model:value="config.props.max"
        style="width: 100%"
        controls-position="right"
        :min="1"
        value-on-clear="max"
        :max="10"
      />
    </FormItem>

    <FormItem label="文件大小(MB)">
      <InputNumber
        v-model:value="config.props.maxSize"
        style="width: 100%"
        controls-position="right"
        :min="0.01"
        value-on-clear="max"
        :max="10"
      />
    </FormItem>

    <FormItem label="文件后缀(jpg,jpeg,png)">
      <Select
        v-model:value="config.props.suffixArray"
        style="width: 100%"
        multiple
        filterable
        allow-create
        default-first-option
        :reserve-keyword="false"
        placeholder="请输入支持的后缀，回车确定"
      />
    </FormItem>
  </div>
</template>

<style scoped lang="less"></style>
