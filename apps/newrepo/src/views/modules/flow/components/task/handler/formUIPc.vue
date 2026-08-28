<script setup lang="ts">
import { computed, defineExpose, onMounted, ref, watch } from 'vue';

import { Form } from 'ant-design-vue';

import $func from '#/utils/flow/index.js';
import { getRandomId } from '#/utils/flow/objutil';
import * as util from '#/utils/flow/objutil.js';

import FormRender from '../../form/render/FormRender.vue';

const emits = defineEmits(['formValueChange']);

const formList = ref([]);

const formUniqueId = ref();
const flowId = ref();
const processInstanceId = ref();
const taskId = ref();
const ccId = ref();
const nodeId = ref();
const loadSuccess = ref(false);
const containDynamic = ref(true);

function loadData(d, fid, nId, pId, tId, cId, cd) {
  formUniqueId.value = util.getRandomId();
  formList.value = d;
  flowId.value = fid;
  nodeId.value = nId;
  processInstanceId.value = pId;
  taskId.value = tId;
  ccId.value = cId;
  containDynamic.value = cd;
}

const formRenderRef = ref();

// 验证表单参数
const validate = (f) => {
  formRenderRef.value.handleFormRule(formList.value);
  formRenderRef.value.validate((valid) => {
    f(valid, formValue.value);
  });
};

const formValue = computed(() => {
  const formValueObj = formRenderRef.value?.getFormValueObj(formList.value);
  return formValueObj;
});

function getFormValue() {
  const value = formValue.value;
  return value;
}

defineExpose({ validate, loadData, getFormValue });
// 判断是否触发表单变化
const triggerChange = ref(true);
// 随机字符串
const randomId = ref('');
onMounted(() => {
  randomId.value = getRandomId();
});

// /监控表单变化
watch(
  () => formValue.value,
  (v) => {
    $func.debounce(async () => {
      if (!triggerChange.value) {
        triggerChange.value = true;
        return;
      }

      if (!containDynamic.value) {
        loadSuccess.value = true;

        emits('formValueChange', v);
      }
    })();
  },
);
</script>

<template>
  <Form layout="vertical">
    <FormRender
      v-show="loadSuccess"
      v-if="formList && formList.length > 0"
      ref="formRenderRef"
      :form-list="formList"
    />
  </Form>
</template>

<style scoped lang="less"></style>
