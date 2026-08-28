<script setup lang="ts">
// import type { NotificationItem } from '@vben/chc-ui';
import type { Rule } from 'ant-design-vue/es/form';

import { ref } from 'vue';

import { Button, Form, FormItem, InputPassword } from 'ant-design-vue';

import { userUpdatePassword } from '#/api/system/profile';

withDefaults(
  defineProps<{
    // messageInfo: NotificationItem;
    // showBtns: boolean;
    // title: string;
  }>(),
  {
    // title: '标题',
  },
);
const emit = defineEmits(['submit', 'cancel']);
const formState = ref<{
  newpassword1: string | undefined;
  newpassword2: string | undefined;
  password: string | undefined;
}>({
  password: undefined,
  newpassword1: undefined,
  newpassword2: undefined,
});
const formRef = ref();
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 24 },
};
const rules: Record<string, Rule[]> = {
  password: [
    {
      required: true,
      message: '请输入原密码',
      trigger: 'change',
    },
    {
      min: 8,
      message: '密码长度不能少于8个字符',
      trigger: 'change',
    },
    {
      max: 20,
      message: '密码长度不能大于20个字符',
      trigger: 'change',
    },
  ],
  newpassword1: [
    {
      required: true,
      message: '请输入新密码',
      trigger: 'change',
    },
    {
      min: 8,
      message: '密码长度不能少于8个字符',
      trigger: 'change',
    },
    {
      max: 20,
      message: '密码长度不能大于20个字符',
      trigger: 'change',
    },
  ],
  newpassword2: [
    {
      required: true,
      message: '请输入确认密码',
      trigger: 'change',
    },
    {
      min: 8,
      message: '密码长度不能少于8个字符',
      trigger: 'change',
    },
    {
      max: 20,
      message: '密码长度不能大于20个字符',
      trigger: 'change',
    },
  ],
};
const resetForm = () => {
  formRef.value.resetFields();
};
function handleSubmit() {
  setTimeout(() => {
    formRef.value.validate().then(() => {
      userUpdatePassword(
        formState.value as {
          newpassword1: string;
          newpassword2: string;
          password: string;
        },
      ).then(() => {
        emit('submit', 'submit');
      });
    });
  });
}
</script>
<template>
  <div style="" class="change-password-container">
    <div class="change-password-container__title">
      <h1 style="">
        {{ '修改密码' }}
      </h1>
    </div>
    <Form
      style="width: 100%"
      ref="formRef"
      name="custom-validation"
      :model="formState"
      :rules="rules"
      v-bind="layout"
      layout="vertical"
      @submit="handleSubmit"
    >
      <FormItem label="原密码" name="password">
        <InputPassword
          size="middle"
          placeholder="请输入原密码"
          v-model:value="formState.password"
          autocomplete="off"
        />
      </FormItem>
      <FormItem label="新密码" name="newpassword1">
        <InputPassword
          size="middle"
          placeholder="请输入新密码"
          v-model:value="formState.newpassword1"
          autocomplete="off"
        />
      </FormItem>
      <FormItem label="确认密码" name="newpassword2">
        <InputPassword
          size="middle"
          placeholder="请再次输入新密码"
          v-model:value="formState.newpassword2"
          autocomplete="off"
        />
      </FormItem>
      <FormItem
        :wrapper-col="{ span: 24, offset: 0 }"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 30px;
        "
      >
        <Button size="middle" @click="resetForm" style="width: calc(50% - 5px)">
          重 置
        </Button>
        <Button
          type="primary"
          size="middle"
          html-type="submit"
          style="width: calc(50% - 5px); margin-left: 10px"
        >
          提 交
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
<style scoped>
.change-password-container {
  width: 100%;
  padding: 0 20px;
}

.change-password-container__title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: hsl(var(--foreground));
  text-align: left;
}

.change-password-container ::v-deep(.ant-form-item-label) {
  padding: 0 0 2px;
}

.change-password-container ::v-deep(.ant-form-item) {
  /* margin-bottom: 14px; */
}
</style>
