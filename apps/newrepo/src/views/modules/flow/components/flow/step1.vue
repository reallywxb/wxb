<script lang="ts" setup>
import type { Rule, RuleObject } from 'ant-design-vue/es/form';

import type { GroupVO } from '#/views/modules/flow/api/group/types';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { CopyOutlined } from '@ant-design/icons-vue';
import { Form, FormItem, Input, Select, SelectOption } from 'ant-design-vue';

import { useFlowStore } from '#/store/flow';
import { copyToBoard } from '#/utils/flow/objutil';
import { queryGroupList } from '#/views/modules/flow/api/group';
import SingleUpload from '#/views/modules/flow/components/Upload/SingleUpload.vue';

import selectShow from '../orgselect/selectAndShow.vue';

const props = defineProps({
  groupId: {
    type: String,
    default: undefined,
  },
});

const ruleForm = ref();

function validate(f: (valid: any, fields: any) => any) {
  ruleForm.value
    .validate()
    .then(() => {
      f(true, []);
    })
    .catch((error: any) => {
      const arr = [];
      for (const err of error.errorFields) {
        arr.push(err.errors[0]);
      }

      f(false, arr);
    });
}

// 暴露方法和属性给父组件
defineExpose({ validate });
const rules = reactive<Record<string, Rule | RuleObject>>({
  name: [
    { required: true, message: '请填写名称', trigger: 'blur' },
    { min: 2, max: 20, message: '流程名称：2-20个字符', trigger: 'blur' },
  ],
  uniqueId: [
    { required: true, message: '请填写流程id', trigger: 'blur' },
    { min: 10, max: 50, message: '流程id：10-50个字符', trigger: 'blur' },
  ],
  remark: [
    { required: false, message: '请填写描述', trigger: 'blur' },
    { min: 2, max: 40, message: '描述：2-40个字符', trigger: 'blur' },
  ],
  groupId: [
    {
      required: true,
      message: '请选择分组',
      trigger: 'change',
    },
  ],
  logo: [
    {
      required: true,
      message: '请上传图标',
      trigger: 'change',
    },
  ],
  admin: [
    {
      required: true,
      message: '请选择管理员',
      trigger: 'change',
    },
  ],
});

const groupList = ref<GroupVO[]>([]);

onMounted(() => {
  queryGroupList().then((data) => {
    groupList.value = data;
  });
});

watch(
  () => props.groupId,
  (val) => {
    if (val) {
      form.value.groupId = val;
    }
  },
);

const flowStore = useFlowStore();

const form = computed(() => {
  return flowStore.step1;
});
// 复制唯一id
function copyUniqueId() {
  copyToBoard(form.value.uniqueId);
}
// // 生成新的唯一id
// function produceNewUniqueId() {
//   form.value.uniqueId = getRandomId();
// }
</script>

<template>
  <div class="container-div">
    <Form
      ref="ruleForm"
      layout="vertical"
      :model="form"
      :rules="rules"
      status-icon
      @submit.prevent
      :label-col="{ span: 10 }"
    >
      <FormItem label="图标" name="logo">
        <SingleUpload v-model="form.logo" />
      </FormItem>
      <FormItem label="名称" name="name">
        <Input maxlength="20" v-model:value="form.name" />
      </FormItem>
      <FormItem label="说明" name="remark">
        <Input maxlength="40" v-model:value="form.remark" />
      </FormItem>
      <FormItem label="流程id" name="uniqueId">
        <Input
          disabled
          placeholder="流程唯一值，根据通过该字段发起流程"
          maxlength="40"
          v-model:value="form.uniqueId"
        >
          <template #addonAfter>
            <!--                <Button @click="copyUniqueId" :icon="DocumentCopy" />-->
            <CopyOutlined @click="copyUniqueId" style="cursor: pointer" />
          </template>
        </Input>
      </FormItem>
      <FormItem label="分组" name="groupId">
        <Select
          style="width: 100%"
          v-model:value="form.groupId"
          placeholder="请选择流程组"
        >
          <SelectOption v-for="item in groupList" :key="item.id">
            {{ item.groupName }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem label="谁可以发起该流程（默认全员）" name="rangeList">
        <select-show
          v-model:org-list="form.rangeList"
          type="org"
          :disable-select-children-dept="false"
          :multiple="true"
        />
      </FormItem>

      <FormItem label="管理员" name="admin">
        <select-show
          v-model:org-list="form.admin"
          type="user"
          :multiple="false"
        />
      </FormItem>
    </Form>
  </div>
</template>
<style scoped lang="scss">
.container-div {
  padding: 20px 10%;
  background-color: white;
}
</style>
