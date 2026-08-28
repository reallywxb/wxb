<script setup>
import { Form, Tag } from 'ant-design-vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:data']);

const formItemContext = Form.useInjectFormItemContext();

const removeItem = (index, id, type) => {
  emits(
    'update:data',
    props.data.filter((res) => !(res.id === id && res.type === type)),
  );

  formItemContext.onFieldChange();
};
</script>

<template>
  <div>
    <Tag
      v-for="(item, index) in data"
      style="margin-top: 5px; margin-right: 5px"
      :key="item.id"
      :hit="item.containChildrenDept"
      :closable="!disabled"
      @close="removeItem(index, item.id, item.type)"
      :color="
        item.type === 'dept'
          ? 'processing'
          : item.type === 'user'
            ? 'error'
            : 'success'
      "
    >
      {{ item.name }}
    </Tag>
  </div>
</template>
<style></style>
