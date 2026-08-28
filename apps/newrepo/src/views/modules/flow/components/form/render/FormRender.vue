<script setup lang="ts">
import type { Rule, RuleObject } from 'ant-design-vue/es/form';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { Form, FormItem } from 'ant-design-vue';

import { useFlowStore } from '#/store/flow';
import getFormName from '#/utils/flow/getFormWidget';
import { getFormRuleConfig, getFormValue } from '#/utils/flow/objutil';

const props = defineProps({
  index: {
    type: Number,
    default: -1,
  },

  formList: {
    type: Array,
    default: () => [],
  },

  formChangeRecord: {
    type: Object,
    default: () => {},
  },
});

const getFormWidget = (name: string) => {
  // 写的时候，组件的起名一定要与dragList中的element名字一模一样，不然会映射不上
  return getFormName[name];
};

onMounted(() => {
  handleFormRule(props.formList);
});

const handleFormRule = (n) => {
  let formList = n;

  if (!n) {
    formList = props.formList;
  }

  for (const item of formList) {
    const id = item.id;
    const validateRule = getFormRuleConfig(item);

    rules[id] = validateRule;
  }
};

const ruleFormRef = ref();

const rules = reactive<Record<string, Rule | RuleObject>>({});

const validate = (f) => {
  ruleFormRef.value.validate().then(() => {
    f(true);
  });
};

// 获取表单值
function getFormValueObj(v) {
  return getFormValue(v);
}

const formValue = computed(() => {
  return getFormValue(props.formList);
});

const flowStore = useFlowStore();

watch(
  () => formValue.value,
  (v) => {
    if (props.index < 0) {
      flowStore.setFormValue(v);
    }
  },
);

function isShow(item) {
  if (item.perm === 'H') {
    return false;
  }
  if (item.perm === 'E') {
    return true;
  }

  // return !item.props.isBlank;
  return true;
}

defineExpose({ validate, handleFormRule, getFormValueObj });
</script>

<template>
  <div>
    <Form layout="vertical" :rules="rules" :model="formValue" ref="ruleFormRef">
      <template v-for="(item, index1) in formList">
        <FormItem
          v-if="isShow(item)"
          :label="item.name + (item.props.unit ? `(${item.props.unit})` : '')"
          :name="!item ? '' : item.id"
          :required="!item ? false : item.required"
          style="margin-bottom: 20px"
          :key="item.id"
        >
          <component
            style="width: 100%"
            :form-value="formValue"
            :is="getFormWidget(item.type)"
            :index="props.index >= 0 ? props.index : -1"
            mode="RUN"
            :ref="`form${item.id}`"
            :form-index="index1"
            :form="item"
          />
        </FormItem>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="less"></style>
