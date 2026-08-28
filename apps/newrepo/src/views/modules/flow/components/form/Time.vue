<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { TimePicker } from 'ant-design-vue';

import DesignDefaultForm from './config/designDefaultForm.vue';

defineProps({
  mode: {
    type: String,
    default: 'D',
  },

  form: {
    type: Object,
    default: () => {},
  },
});
</script>
<template>
  <div>
    <template v-if="mode === 'D'">
      <DesignDefaultForm :form="form" />
    </template>
    <!--		<template v-else-if="form.perm === 'R'">-->
    <!--			{{form.props.value}}-->
    <!--		</template>-->
    <TimePicker
      v-else
      class="formDate"
      v-model:value="form.props.value"
      :disabled="form.perm === 'R'"
      :placeholder="form.placeholder"
      value-format="HH:mm:ss"
    />
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
