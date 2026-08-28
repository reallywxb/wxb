<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { Plus } from '@vben/chc-icons';

import { Button } from 'ant-design-vue';

import selectShow from '../orgselect/selectAndShow.vue';

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
    <Button v-if="mode === 'D'" :disabled="true" shape="circle">
      <Plus />
    </Button>

    <select-show
      v-else
      :disabled="form.perm === 'R'"
      v-model:org-list="form.props.value"
      type="dept"
      :multiple="form.props.multi"
    />
  </div>
</template>
<style scoped lang="less"></style>
