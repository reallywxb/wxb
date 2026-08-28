<script setup lang="ts">
import { computed, ref } from 'vue';

import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, Form, Input } from 'ant-design-vue';

import employeesDialog from './employeesDialog.vue';
import orgItem from './orgItem.vue';

const props = defineProps({
  disableSelectChildrenDept: {
    // 禁止选择下级部门
    type: Boolean,
    default: true,
  },
  orgList: {
    type: Array,
    default: () => [],
  },
  disableUser: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: 'org',
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showStyle: {
    type: Number,
    default: 1,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
});
const emits = defineEmits(['update:orgList']);
const formItemContext = Form.useInjectFormItemContext();
const selectUserDialogVisible = ref(false);

const afterSelectUser = (data) => {
  // 选择人员变化
  selectUserDialogVisible.value = false;
  emits('update:orgList', data);
  formItemContext.onFieldChange();
};

const defaultValue = computed({
  get: () => {
    const orgList = props.orgList;
    return orgList;
  },
  set: (r) => {
    emits('update:orgList', r);
    formItemContext.onFieldChange();
  },
});
const inputShowValue = computed(() => {
  if (!defaultValue.value) {
    return '';
  }
  return defaultValue.value.map((re) => re.name).join(',');
});
</script>

<template>
  <div>
    <employees-dialog
      v-model:visible="selectUserDialogVisible"
      :data="defaultValue"
      :type="type"
      :disable-select-children-dept="disableSelectChildrenDept"
      :multiple="multiple"
      :disable-user="disableUser"
      @change="afterSelectUser"
    />
  </div>
  <template v-if="showStyle === 1">
    <Button
      :type="disabled ? 'default' : 'primary'"
      :disabled="disabled"
      shape="circle"
      @click="selectUserDialogVisible = true"
      class="flex-center"
    >
      <PlusOutlined />
    </Button>
    <div style="width: 100%; margin-top: 10px; text-align: left">
      <org-item v-model:data="defaultValue" :disabled="disabled" />
    </div>
  </template>
  <template v-if="showStyle === 2">
    <Input
      v-model:value="inputShowValue"
      :placeholder="placeholder"
      clearable
      readonly
      :disabled="disabled"
      style="width: 200px"
      @click="selectUserDialogVisible = true"
    />
  </template>
</template>

<style scoped lang="less"></style>
