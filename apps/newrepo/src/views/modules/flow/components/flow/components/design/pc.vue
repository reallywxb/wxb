<script setup lang="ts">
import { computed, ref } from 'vue';

import { CloseOutlined } from '@ant-design/icons-vue';
import { Form, FormItem } from 'ant-design-vue';
import VueDraggableNext from 'vuedraggable';

import { useFlowStore } from '#/store/flow';
import getFormName from '#/utils/flow/getFormWidget';
import * as util from '#/utils/flow/objutil.js';

const emit = defineEmits(['setCurrentForm']);

const getFormWidget = (name: string) => {
  // 写的时候，组件的起名一定要与dragList中的element名字一模一样，不然会映射不上
  return getFormName[name];
};

const flowStore = useFlowStore();
const targetList = computed({
  get: () => {
    const value = step2List.value;
    if (value?.length === 0) {
      return [
        {
          type: 'Empty',
          name: '',
        },
      ];
    }
    return value;
  },
  set: (v) => {
    const value = v.filter((res) => res.type !== 'Empty');
    flowStore.setStep2Form(util.deepCopy(value));
  },
});

const deleteForm = (id) => {
  flowStore.setStep2Form(step2List.value.filter((res) => res.id !== id));

  if (currentFormCom.value && currentFormCom.value?.id === id) {
    currentFormCom.value = undefined;
  }
};

const step2Object = computed(() => {
  const obj = {};

  step2List.value.forEach((res) => (obj[res.id] = res));

  return obj;
});
const step2List = computed(() => {
  const step2 = flowStore.step2Form;
  return step2;
});

// 定义当前打开的表单
const currentForm = ref();
// 判断是否选中当前表单显示边框
const isCurrentForm = (fid) => {
  if (!currentFormCom.value) {
    return false;
  }
  if (currentFormCom.value.id === fid) {
    return true;
  }

  return false;
};
const showCurrentPageConfigPanel = (id) => {
  currentFormCom.value = step2List.value.find((res) => res.id === id);
};
const showPanel = (form) => {
  currentFormCom.value = form;
};

const currentFormCom = computed({
  get() {
    return currentForm.value;
  },
  set(v) {
    currentForm.value = v;
    emit('setCurrentForm', v);
  },
});
</script>

<template>
  <div class="drag-content">
    <div class="drag-content-inner">
      <Form layout="vertical" label-width="100px">
        <VueDraggableNext
          disabled
          v-model="targetList"
          style="min-height: 600px; background-color: #f2f3f5"
          item-key="index"
          :sort="true"
          effect="dark"
          :group="{ name: 'dragFormList', pull: true, put: true }"
        >
          <template #item="{ element, index }">
            <div
              class="okcomponent line border"
              effect="dark"
              :class="{ 'active-component': isCurrentForm(element.id) }"
              @click.stop="showCurrentPageConfigPanel(element.id)"
            >
              <CloseOutlined
                class="deleteIcon"
                v-if="element.type !== 'Empty'"
                @click.stop="deleteForm(element.id)"
              />

              <FormItem
                :label="step2Object[element.id]?.name"
                :style="{
                  marginBottom: element.type === 'Empty' ? '0px' : '18px',
                }"
                :required="step2Object[element.id]?.required"
              >
                <component
                  style="width: 100%"
                  @show-panel="showPanel"
                  :index="index"
                  :is="getFormWidget(element.type)"
                  :id="element.id"
                  :from="1"
                  v-model:form="step2Object[element.id]"
                />
              </FormItem>
            </div>
          </template>
        </VueDraggableNext>
      </Form>
    </div>
  </div>
</template>

<style scoped lang="scss">
$f22_width: 400px;

$center_width: 360px;

.leftItem {
  padding-left: 0;
}

.zj {
  display: inline-block;
  width: 140px;
  margin: 5px;
}

.drag-content {
  min-height: 640px;
  padding: 30px 10px;
  background-color: white;
}

.drag-content-inner {
  padding: 5px;
  background-color: #f2f3f5;
  border-radius: 4px;
}

.f11 {
  width: calc(100% - #{$f22_width});
}

.f22 {
  width: $f22_width;
}

.okcomponent {
  position: relative;
  padding: 5px;
  margin-bottom: 10px;
  background-color: white;
  border: 1px solid white;
  border-radius: 4px;
}

.active-component {
  border: 1px solid #409eff;

  .deleteIcon {
    display: initial;
  }
}

.deleteIcon {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
  display: none;
  width: 20px;
  height: 20px;
  color: white;
  background-color: #409eff;

  &:hover {
    cursor: pointer;
  }
}
</style>
