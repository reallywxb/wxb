<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */

import { computed } from 'vue';

import { Select, SelectOption } from 'ant-design-vue';

import DesignDefaultForm from './config/designDefaultForm.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'D',
  },

  form: {
    type: Object,
    default: () => {},
  },
});

const formValue = computed({
  get() {
    const value = props.form.props.value;
    return value && value.length === 1 ? value[0].key : undefined;
  },
  set(t) {
    const filterElement = props.form.props.options.filter(
      (res) => res.key === t,
    );
    props.form.props.value = filterElement;
  },
});
</script>
<template>
  <div>
    <template v-if="mode === 'D'">
      <DesignDefaultForm :form="form" />
    </template>
    <!--		<template v-else-if="form.perm === 'R'">-->
    <!--			{{form.props.value?.length==1?form.props.value[0].value:''}}-->
    <!--		</template>-->
    <Select
      v-else
      style="width: 100%"
      filterable
      v-model:value="formValue"
      :disabled="form.perm === 'R'"
      :placeholder="form.placeholder"
      size="large"
    >
      <SelectOption v-for="item in form.props.options" :key="item.key">
        {{ item.value }}
      </SelectOption>
    </Select>
  </div>
</template>
<style scoped lang="less"></style>
