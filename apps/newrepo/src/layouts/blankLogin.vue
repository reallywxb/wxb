<!-- 
  @description: 空白登录页，用于与统一登录平台对接，登录逻辑直复用正常的登录逻辑
-->

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';

import { useAuthStore } from '#/store';

import { useCaptcha } from './auth';

const router = useRouter();
const authStore = useAuthStore();
const { captchaInfo } = useCaptcha();
const route = useRoute();

const onFailed = () => {
  return new Promise<void>((resolve, reject) => {
    // 跳转到登录页
    router.replace({
      path: LOGIN_PATH,
    });

    reject(new Error('登录失败'));
  });
};
authStore.authLogin(
  {
    username: route.query.username as string,
    password: route.query.password as string,
    randomStr: captchaInfo.value.randomStr,
  },
  undefined,
  onFailed,
);
</script>
<template>
  <div class="box-border flex h-screen w-screen items-center justify-center">
    正在登录...
  </div>
</template>
