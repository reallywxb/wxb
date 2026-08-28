<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */

import { Textarea } from 'ant-design-vue';

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
      <DesignDefaultForm :form="form" :height="68" />
    </template>
    <!--		<template v-else-if="form.perm === 'R'">-->
    <!--			{{form.props.value}}-->
    <!--		</template>-->
    <Textarea
      v-else
      :resize="form.perm === 'R' ? 'none' : 'vertical'"
      v-model:value="form.props.value"
      :disabled="form.perm === 'R'"
      :placeholder="form.placeholder"
    />
  </div>
</template>
<style scoped lang="less"></style>
