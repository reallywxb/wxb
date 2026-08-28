<script setup lang="ts">
import { computed } from 'vue';

import { FormItem, TimePicker } from 'ant-design-vue';

import { getCurrentConfig } from '#/utils/flow/objutil';

import ValueCom from './components/value/Time.vue';

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
    <FormItem label="最小值">
      <TimePicker
        arrow-control
        class="formDate"
        v-model:value="config.props.min"
        value-format="HH:mm:ss"
      />
    </FormItem>
    <FormItem label="最大值">
      <TimePicker
        arrow-control
        size="default"
        class="formDate"
        v-model:value="config.props.max"
        value-format="HH:mm:ss"
      />
    </FormItem>

    <FormItem label="默认值">
      <ValueCom :id="id" :value-config="config.props" />
    </FormItem>
  </div>
</template>

<style scoped lang="less">
:deep(.formDate div.input__wrapper) {
  width: 100% !important;
}
:deep(.formDate) {
  width: 100% !important;
}
</style>
