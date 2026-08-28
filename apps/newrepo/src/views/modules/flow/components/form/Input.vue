<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { Input } from 'ant-design-vue';

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
    <Input
      v-else
      v-model:value="form.props.value"
      :disabled="form.perm === 'R'"
      :placeholder="form.placeholder"
    />
  </div>
</template>
<style scoped lang="less"></style>
