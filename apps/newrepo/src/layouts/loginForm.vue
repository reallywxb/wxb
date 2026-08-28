<script setup lang="ts">
import type { VbenFormSchema } from '@vben/common-ui';

import {
  computed,
  defineProps,
  onMounted,
  reactive,
  ref,
  withDefaults,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { VbenButton, VbenCheckbox } from '@vben-core/shadcn-ui';

import { useVbenForm } from '#/adapter/form';
import { useAuthStore } from '#/store';

defineOptions({ name: 'LoginForm' });

const props = withDefaults(
  defineProps<{
    codeLoginPath?: string;
    forgetPasswordPath?: string;
    formSchema?: Array<VbenFormSchema>;
    qrCodeLoginPath?: string;
    registerPath?: string;
    showCodeLogin?: boolean;
    showForgetPassword?: boolean;
    showQrcodeLogin?: boolean;
    showRegister?: boolean;
    showRememberMe?: boolean;
    showThirdPartyLogin?: boolean;
    submitButtonText?: string;
  }>(),
  {
    formSchema: [] as unknown as Array<VbenFormSchema>,
    codeLoginPath: '/auth/code-login',
    forgetPasswordPath: '/auth/forget-password',
    qrCodeLoginPath: '/auth/qrcode-login',
    registerPath: '/auth/register',
    showCodeLogin: false,
    showForgetPassword: false,
    showQrcodeLogin: false,
    showRegister: false,
    showRememberMe: false,
    showThirdPartyLogin: false,
    submitButtonText: '',
  },
);

const emit = defineEmits<{
  submit: [Recordable<any>];
}>();

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();

const REMEMBER_ME_KEY = `REMEMBER_ME_USERNAME_${location.hostname}`;

const localUsername = localStorage.getItem(REMEMBER_ME_KEY) || '';
const rememberMe = ref(!!localUsername);

function handleGo(path: string) {
  router.push(path);
}

async function handleSubmit() {
  const { valid } = await formApi.validate();
  const values = await formApi.getValues();

  if (valid) {
    localStorage.setItem(
      REMEMBER_ME_KEY,
      rememberMe.value ? values?.username : '',
    );

    emit('submit', values);
  }
}

const [Form, formApi] = useVbenForm(
  reactive({
    layout: 'vertical',
    commonConfig: {
      // hideLabel: true,
      labelClass: 'login-form--label',
      hideRequiredMark: true,
    },
    schema: computed(() => props.formSchema),
    showDefaultActions: false,
  }),
);

onMounted(() => {
  if (localUsername) {
    formApi.setFieldValue('username', localUsername);
  }
});
</script>

<template>
  <div
    v-if="route.name === 'Login'"
    class="login-form"
    @keydown.enter.prevent="handleSubmit()"
  >
    <div class="login-form--title">
      <h3>欢迎使用<br />药品供应链精细化管理平台</h3>
    </div>
    <div class="background-filter"></div>
    <div class="login-form--text h-[100px]">账户登录</div>

    <Form />

    <div
      v-if="showRememberMe || showForgetPassword"
      class="mb-6 flex justify-between"
    >
      <div class="flex-left">
        <VbenCheckbox
          class="label checkbox"
          style="margin-left: 2px"
          v-if="showRememberMe"
          v-model:checked="rememberMe"
          name="rememberMe"
          data-testid="checkbox_rememberMe_loginForm"
        >
          {{ $t('authentication.rememberMe') }}
        </VbenCheckbox>
      </div>

      <span
        v-if="showForgetPassword"
        class="vben-link label text-sm font-normal"
        @click="handleGo(forgetPasswordPath)"
        data-testid="button_forgetPassword_loginForm"
      >
        {{ $t('authentication.forgetPassword') }}
      </span>
    </div>

    <VbenButton
      :class="{
        'cursor-wait': authStore.loginLoading,
      }"
      :loading="authStore.loginLoading"
      aria-label="login"
      class="button mt-[15px] h-[36px] w-full"
      @click="handleSubmit()"
      data-testid="button_login_loginForm"
    >
      {{ submitButtonText || $t('common.login') }}
    </VbenButton>

    <div
      v-if="showCodeLogin || showQrcodeLogin"
      class="mb-2 mt-4 flex items-center justify-between"
    >
      <VbenButton
        v-if="showCodeLogin"
        class="button label w-1/2"
        variant="outline"
        @click="handleGo(codeLoginPath)"
        data-testid="button_codeLogin_loginForm"
      >
        {{ $t('authentication.mobileLogin') }}
      </VbenButton>
      <VbenButton
        v-if="showQrcodeLogin"
        class="button label ml-4 w-1/2"
        variant="outline"
        @click="handleGo(qrCodeLoginPath)"
        data-testid="button_qrCodeLogin_loginForm"
      >
        {{ $t('authentication.qrcodeLogin') }}
      </VbenButton>
    </div>

    <!-- 第三方登录 -->
    <slot name="third-party-login">
      <!-- <ThirdPartyLogin v-if="showThirdPartyLogin" /> -->
    </slot>

    <slot name="to-register">
      <div v-if="showRegister" class="label mt-3 text-center text-sm">
        {{ $t('authentication.accountTip') }}
        <span
          class="vben-link link text-sm font-normal"
          @click="handleGo(registerPath)"
          data-testid="button_register_loginForm"
        >
          {{ $t('authentication.createAccount') }}
        </span>
      </div>
    </slot>
  </div>
  <RouterView v-else v-slot="{ Component, route }">
    <Transition appear mode="out-in" name="slide-right">
      <KeepAlive :include="['Login']">
        <component
          :is="Component"
          :key="route.fullPath"
          class="enter-x mt-6 w-full sm:mx-auto md:max-w-md"
        />
      </KeepAlive>
    </Transition>
  </RouterView>
</template>

<style lang="scss" scoped>
@media only screen and (max-width: 768px) {
  .login-form {
    width: 100% !important;
    padding: 40px 24px !important;
    margin-right: 0 !important;
  }
}

.label {
  font-weight: normal;
  color: #4e5969;
}

.link {
  color: #eee;

  &:hover {
    color: #0a00c2;
  }
}

.button {
  background-image: linear-gradient(#1e9bcc, #3376d2);

  &:hover {
    background-image: linear-gradient(#1e9bdc, #3376e2);
  }
}

.checkbox {
  :deep(button) {
    background-color: transparent !important;
  }
}

.login-form {
  z-index: 9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 560px;
  min-width: 560px;
  height: 100%;
  padding: 30px 40px 90px;
  background-color: rgb(255 255 255 / 40%);
  border-radius: 4px;
  backdrop-filter: blur(6px);

  &--title {
    font-family: YouSheBiaoTiHei;
    font-size: 40px;
    text-align: center;
    // padding-top: 100px;
  }

  &--text {
    font-size: 24px;
    font-weight: bold;
    line-height: 100px;
    color: #4e5969;
    text-align: center;
  }

  :deep(.login-form--label) {
    font-size: 16px;
    font-weight: 300;
    color: white;
  }

  :deep(.text-current) {
    color: #2b73e9;
  }
  // :deep(.ant-input) {
  //   font-size: 0.875rem;
  //   line-height: 1.25rem;
  //   padding-top: 0.5rem;
  //   padding-bottom: 0.5rem;
  //   padding-left: 0.75rem;
  //   padding-right: 0.75rem;
  // }
  // :deep(.ant-input-affix-wrapper) {
  //   padding: 0;
  // }
  // :deep(.ant-input-suffix) {
  //   margin-left: 0;
  //   padding-right: 0.75rem;
  //   background-color: rgb(232, 240, 254);
  // }
  // :deep(.ant-input-affix-wrapper-focused .ant-input-suffix) {
  //   background-color: white !important;
  // }
}
</style>
