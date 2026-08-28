<script setup lang="ts">
import { Modal } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { userUpdatePassword } from '#/api/system/profile';
import { useAuthStore } from '#/store';

defineOptions({ name: 'SecureSetting' });

const props = withDefaults(
  defineProps<{
    /** 是否在弹窗中使用，弹窗中时不限制宽度 */
    inModal?: boolean;
  }>(),
  {
    inModal: false,
  },
);

const emit = defineEmits<{
  passwordChanged: [];
}>();

const authStore = useAuthStore();
/** 不修改密码，直接退出登录 */
function handleExit() {
  Modal.confirm({
    content: '不修改密码直接退出登录？',
    onOk: async () => {
      sessionStorage.removeItem('FORCE_PASSWORD_CHANGE');
      authStore.showForcePasswordChange = false;
      await authStore.logout(true);
    },
    title: '提示',
  });
}

const [BasicForm, formApi] = useVbenForm({
  actionWrapperClass: props.inModal ? 'w-[450px] text-center' : 'text-left mb-[16px] ml-[96px]',
  commonConfig: {
    labelWidth: 90,
  },
  handleSubmit,
  resetButtonOptions: props.inModal
    ? {
        content: '退出登录',
        show: true,
        type: 'link',
        onClick: handleExit,
      }
    : {
        show: false,
      },
  schema: [
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '旧密码',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      dependencies: {
        rules() {
          return z
            .string({ message: '请输入新密码' })
            .min(8, '密码长度不能少于8位')
            .max(20, '密码长度不能超过20位')
            .regex(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).+$/,
              '密码必须包含大写字母、小写字母、数字和特殊符号',
            );
        },
        triggerFields: ['newpassword1'],
      },
      fieldName: 'newpassword1',
      label: '新密码',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      dependencies: {
        rules(values) {
          return z
            .string({ message: '请输入确认密码' })
            .min(8, '密码长度不能少于8位')
            .max(20, '密码长度不能超过20位')
            .refine(
              (value) => value === values.newpassword1,
              '新密码和确认密码不一致',
            );
        },
        triggerFields: ['newpassword1', 'newpassword2'],
      },
      fieldName: 'newpassword2',
      label: '确认密码',
      rules: 'required',
    },
  ],
  submitButtonOptions: {
    content: '修改密码',
  },
});

function buttonLoading(loading: boolean) {
  formApi.setState((prev) => ({
    ...prev,
    submitButtonOptions: { ...prev.submitButtonOptions, loading },
  }));
}

function handleSubmit(values: any) {
  Modal.confirm({
    content: '确认修改密码吗？',
    onOk: async () => {
      try {
        buttonLoading(true);
        // const data = omit(values, [
        //   'newpassword1',
        //   'newpassword2',
        // ]) as UpdatePasswordParam;
        await userUpdatePassword(values);
        // 通知外部密码修改成功（用于强制弹窗场景）
        emit('passwordChanged');
        await authStore.logout(true);
      } catch (error) {
        console.error(error);
      } finally {
        buttonLoading(false);
      }
    },
    title: '提示',
  });
}
</script>

<template>
  <div :class="inModal ? 'w-[450px]' : 'mt-[16px] md:w-full lg:w-1/2 2xl:w-2/5'">
    <BasicForm />
  </div>
</template>
