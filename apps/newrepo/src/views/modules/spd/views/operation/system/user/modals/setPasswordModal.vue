<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { putPassword } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('密码设置');
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
      setTimeout(() => {
        baseFormApi.setValues({
          ...serviceData.value,
          defaultDepartmentId: serviceData.value.DefaultDepartmentId,
        });
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[120px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'RealName',
      label: '用户姓名',
      rules: 'required',
      componentProps: () => {
        return {
          disabled: true,
          placeholder: '请输入用户姓名',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Name',
      label: '登录名称',
      rules: 'required',
      componentProps: () => {
        return {
          disabled: true,
          placeholder: '请输入登录名称',
        };
      },
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '登录密码',
      rules: 'required',

      componentProps: () => {
        return {
          placeholder: '请输入登录密码',
        };
      },
    },

    {
      component: 'InputPassword',
      fieldName: 'conPassword',
      label: '确认密码',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入确认密码',
          triggerFields: ['UserType'],
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();

    const params: any = {
      ...formData,
      isSecret: 'Y',
      password: btoa(formData.password),
      conPassword: btoa(formData.conPassword),
      AD_User_ID: serviceData.value.AD_User_ID || undefined,
    };

    putPassword(params).then((res) => {
      if (res && res.success) {
        message.success({
          content: '重置密码成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  }
}
</script>
<template>
  <Modal class="h-[800px] w-[900px]" :title="title" title-tooltip="">
    <BaseForm />

    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_setPasswordModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>
