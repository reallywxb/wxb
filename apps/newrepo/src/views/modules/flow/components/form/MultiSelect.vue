<script lang="ts" setup>
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
    return value && value.length > 0 ? value.map((res) => res.key) : undefined;
  },
  set(t) {
    // eslint-disable-next-line vue/no-mutating-props
    props.form.props.value = props.form.props.options.filter((res) =>
      t.includes(res.key),
    );
  },
});
</script>
<template>
  <div>
    <template v-if="mode === 'D'">
      <DesignDefaultForm :form="form" />
    </template>
    <!--		<template v-else-if="form.perm === 'R'">-->
    <!--			{{form.props.value?.length>=1?form.props.value.map(res=>res.value).join('；'):''}}-->
    <!--		</template>-->
    <Select
      v-else
      style="width: 100%"
      multiple
      filterable
      collapse-tags
      collapse-tags-tooltip
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
