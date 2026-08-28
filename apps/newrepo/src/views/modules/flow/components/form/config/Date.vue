<script setup lang="ts">
import { computed } from 'vue';

import { DatePicker, FormItem } from 'ant-design-vue';

import { getCurrentConfig } from '#/utils/flow/objutil';

import ValueCom from './components/value/Date.vue';

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
      <DatePicker
        class="formDate"
        v-model:value="config.props.min"
        value-format="YYYY-MM-DD"
        type="date"
      />
    </FormItem>
    <FormItem label="最大值">
      <DatePicker
        class="formDate"
        v-model:value="config.props.max"
        value-format="YYYY-MM-DD"
        type="date"
      />
    </FormItem>

    <FormItem label="默认值">
      <ValueCom :id="id" :value-config="config.props" />
    </FormItem>
  </div>
</template>

<style scoped lang="less">
:deep(.formDate div.Input__wrapper) {
  width: 100% !important;
}
:deep(.formDate) {
  width: 100% !important;
}
</style>
