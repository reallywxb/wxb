<script lang="ts" setup>
import type { FormGroupVO } from '#/views/modules/flow/api/form/types';

import { computed, ref, watch } from 'vue';

import { CopyOutlined } from '@ant-design/icons-vue';
import { Button, Card, Checkbox, Form, FormItem, Input } from 'ant-design-vue';
import VueDraggable from 'vuedraggable';

import { useFlowStore } from '#/store/flow';
import { formValidateDict } from '#/utils/flow/formValidate';
// 要注意导入
import getFormConfigName from '#/utils/flow/getFormConfigWidget';
import * as util from '#/utils/flow/objutil.js';
import { formGroupConfig } from '#/views/modules/flow/api/form/data';

import Pc from '../../components/flow/components/design/pc.vue';
// const activeConfigTab = ref('base');

const drag = ref(false);

const currentFormConfigRef = ref();
const flowStore = useFlowStore();

const step2List = computed(() => {
  const step2 = flowStore.step2;
  return step2;
});
const step2FormList = computed(() => {
  if (!flowStore) {
    return undefined;
  }
  const step2 = flowStore.step2Form;
  return step2;
});
// 监听表单变化 渲染手机端和pc端
watch(
  () => step2FormList?.value,
  (v) => {
    flowStore.setStep2Pc(v);
    const arr = [] as any[];
    for (const item of v) {
      arr.push(item);
    }
    flowStore.setStep2(arr);
  },
  { deep: true },
);

// 定义当前打开的表单
const currentForm = ref();

function setCurrentFormFunc(v) {
  currentForm.value = v;
}

const cloneFunc = (el) => {
  el.id = util.getRandomId();
  return el;
};

const getFormConfigWidget = (name: string) => {
  // 写的时候，组件的起名一定要与dragList中的element名字一模一样，不然会映射不上
  return getFormConfigName[name];
};

const dragEnd = () => {
  drag.value = false;
  oriFormList.value = util.deepCopy(oriFormList.value);
};
// 复制表单idid
function copyFormId(id) {
  util.copyToBoard(id);
}

let oriFormList = ref<FormGroupVO[]>(formGroupConfig);

const validate = (f) => {
  const err = [];

  const formList = step2List.value;
  if (formList.length === 0) {
    err.push('表单不能为空');
  }

  let cIndex = 0;
  const indexObj = {} as any;
  for (const form of formList) {
    indexObj[form.id] = cIndex;
    cIndex++;
  }
  for (const form of formList) {
    const formValidateDictElement = formValidateDict[form.type as string];
    if (formValidateDictElement) {
      const result = formValidateDictElement(form);

      if (!result.valid) {
        err.push(result.msg);
      }
    }

    // 计算每个表单的顺序

    // 检查动态表单配置

    {
      let dynamicFormConfig = form.dynamicFormConfig;
      if (!dynamicFormConfig) {
        dynamicFormConfig = [];
      }
      for (const it of dynamicFormConfig) {
        const list = it.list;
        const conditionList = it?.condition?.conditionList;
        if (conditionList?.length > 0) {
          // 判断条件里的顺序
          for (const c of conditionList) {
            for (const t of c.conditionList) {
              const key = t.key;
              const indexObjElement = indexObj[key];
              if (indexObjElement && indexObjElement >= indexObj[form.id]) {
                err.push(
                  `请检查表单[${
                    form.name
                  }]的动态表单条件中引用的条件顺序不能在当前表单之下`,
                );
              }
            }
          }

          // 有条件
          if (list?.length < 1) {
            err.push(`请设置表单[${form.name}]的动态表单值`);
          } else {
            for (const l of list) {
              if (util.isBlank(l.value) || util.isBlank(l.contentConfig)) {
                err.push(`请完善表单[${form.name}]的动态表单值`);
              }
            }
            const arr = list.map((r) => r.contentConfig);
            if (util.distinct(arr).length !== arr.length) {
              err.push(`表单[${form.name}]的动态表单不能重复配置`);
            }
          }
        }
      }
    }
  }

  // 表单唯一名字集合
  const uniqueFormNameList = [...new Set(formList.map((res) => res.name))];

  if (uniqueFormNameList.length < formList.length) {
    for (const formName of uniqueFormNameList) {
      const length = formList.filter((res) => res.name === formName).length;
      if (length > 1) {
        err.push(`表单名称【${formName}】不能重复`);
      }
    }
  }

  f(err.length === 0, err);
};
defineExpose({ validate });
</script>

<template>
  <div class="step-2">
    <aside class="aside">
      <div
        effect="dark"
        style="padding-top: 20px; margin-top: 0; background-color: white"
      >
        <h4 style="text-align: center">组件库</h4>
        <template v-for="item in oriFormList" :key="item.name">
          <h5 style="padding-left: 20px">{{ item.name }}</h5>
          <VueDraggable
            v-model="item.formList"
            ghost-class="ghost"
            :force-fallback="true"
            :item-key="item.name"
            :sort="false"
            @end="dragEnd"
            @start="drag = true"
            class="leftItem"
            :animation="300"
            :group="{ name: 'dragFormList', pull: 'clone', put: false }"
            :clone="cloneFunc"
          >
            <template #item="{ element }">
              <div class="comp-btn">
                <Button style="width: 100%">
                  {{ element.name }}
                </Button>
              </div>
            </template>
          </VueDraggable>
        </template>
      </div>
    </aside>
    <main class="main">
      <Pc class="f11" @set-current-form="setCurrentFormFunc" />
      <div class="f22" v-if="currentForm">
        <Card class="box-card">
          <template #title>
            <div class="card-header">
              {{ currentForm?.typeName }}
            </div>
          </template>

          <Form layout="vertical">
            <FormItem label="表单ID">
              <Input disabled v-model:value="currentForm.id" maxlength="50">
                <template #addonAfter>
                  <CopyOutlined
                    @click="copyFormId(currentForm.id)"
                    style="cursor: pointer"
                  />
                </template>
              </Input>

              <!--                <Button-->
              <!--                  @click="copyFormId(currentForm.id)"-->
              <!--                  :icon="DocumentCopy"-->
              <!--                />                -->
            </FormItem>
            <FormItem required label="标题">
              <Input v-model:value="currentForm.name" maxlength="10" />
            </FormItem>

            <FormItem
              label="提示"
              :required="currentForm.type === 'Description'"
            >
              <Input v-model:value="currentForm.placeholder" maxlength="50" />
            </FormItem>

            <component
              :is="getFormConfigWidget(currentForm.type)"
              :id="currentForm.id"
              ref="currentFormConfigRef"
            />
            <FormItem label="其他">
              <Checkbox v-model:checked="currentForm.required">必填</Checkbox>
            </FormItem>
          </Form>
        </Card>
      </div>
    </main>
  </div>
</template>
<style scoped lang="scss">
.step-2 {
  display: flex;
  flex-direction: row;
  gap: 5px;

  .aside {
    width: 280px;
  }

  .main {
    display: flex;
    flex: 1;
    flex-direction: row;
    gap: 5px;
    min-width: 0;

    .f11 {
      flex: 1;
      min-width: 0;
    }

    .f22 {
      width: 300px;
    }
  }
}

.comp-btn {
  display: inline-block;
  width: 120px;
  margin: 5px 10px;
}
</style>
