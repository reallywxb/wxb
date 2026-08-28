<script lang="ts" setup>
import { computed } from 'vue';

import { z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import LoginForm from '#/layouts/loginForm.vue';
import { useAuthStore } from '#/store';

import { useCaptcha } from './auth';

const authStore = useAuthStore();

type BasicOption = {
  label: string;
  value: string;
};
const MOCK_USER_OPTIONS: BasicOption[] = [
  {
    label: 'Super',
    value: 'vben',
  },
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'User',
    value: 'jack',
  },
];

const { captchaLoading, loadCaptcha, onFailed, captchaInfo } = useCaptcha();

const formSchema = computed(() => [
  {
    component: 'VbenInput',
    componentProps: {
      placeholder: $t('authentication.usernameTip'),
      autocomplete: 'current-password',
    },
    dependencies: {
      trigger(values, form) {
        if (values.selectAccount) {
          const findUser = MOCK_USER_OPTIONS.find(
            (item) => item.value === values.selectAccount,
          );
          if (findUser) {
            form.setValues({
              password: '',
              username: findUser.value,
            });
          }
        }
      },
      triggerFields: ['selectAccount'],
    },
    fieldName: 'username',
    label: $t('authentication.username'),
    hideLabel: true,
    formItemClass: 'custom-form-username',
    rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
  },
  {
    component: 'VbenInputPassword',
    componentProps: {
      placeholder: $t('authentication.passwordTip'),
      autocomplete: 'current-password',
    },
    fieldName: 'password',
    label: $t('authentication.password'),
    hideLabel: true,
    formItemClass: 'custom-form-password',
    rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
  },
  {
    component: 'VbenInputCaptcha',
    componentProps: {
      captcha: captchaInfo.value.img,
      class: 'focus:border-primary focus-visible:ring-0',
      onCaptchaClick: loadCaptcha,
      placeholder: $t('authentication.code'),
      loading: captchaLoading.value,
    },
    dependencies: {
      if: () => captchaInfo.value.enabled,
      triggerFields: [''],
    },
    fieldName: 'code',
    label: $t('authentication.code'),
    rules: z
      .string()
      .min(captchaInfo.value.codeLength, {
        message: `请输入${captchaInfo.value.codeLength}位验证码`,
      })
      .max(captchaInfo.value.codeLength, {
        message: `请输入${captchaInfo.value.codeLength}位验证码`,
      }),
  },
]);

function handleSubmit(values: any) {
  authStore.authLogin(
    { ...values, randomStr: captchaInfo.value.randomStr },
    undefined,
    onFailed,
  );
}
</script>

<template>
  <div class="auth">
    <LoginForm
      :form-schema="formSchema"
      @submit="handleSubmit"
      show-remember-me
    />
  </div>
</template>
<style lang="scss" scoped>
.auth {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: end;
  height: 100%;
  // background-image: url('../assets/images/medical-community-bg.jpg');
  background-image: url('../assets/images/medical-bg.jpg');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
</style>
