<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { InputNumber } from 'ant-design-vue';

import { convertCurrency } from '#/utils/flow/objutil';

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
    <template v-else>
      <InputNumber
        style="width: 100%"
        controls-position="right"
        v-model:value="form.props.value"
        :precision="form.props.radixNum"
        :disabled="form.perm === 'R'"
        :placeholder="form.placeholder"
      />
      <template v-if="form.props.showChinese">
        <div class="replace-el-text">大写：</div>
        <div class="replace-el-text info">
          {{ convertCurrency(form.props.value) }}
        </div>
      </template>
    </template>
  </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/flow/common';
</style>
