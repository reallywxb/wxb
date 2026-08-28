<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

// SliderCaptcha  markRaw
import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { captchaImage } from '#/api';
import { useAuthStore } from '#/store';
// import {Modal} from 'ant-design-vue'
defineOptions({ name: 'Login' });
// 验证码loading
const captchaLoading = ref(false);
const authStore = useAuthStore();
const captchaInfo = ref({
  enabled: false,
  codeLength: 4,
  img: '',
  randomStr: '',
});
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
const formSchema = computed((): VbenFormSchema[] => {
  return [
    // {
    //   component: 'VbenSelect',
    //   // componentProps(_values, form) {
    //   //   return {
    //   //     'onUpdate:modelValue': (value: string) => {
    //   //       const findItem = MOCK_USER_OPTIONS.find(
    //   //         (item) => item.value === value,
    //   //       );
    //   //       if (findItem) {
    //   //         form.setValues({
    //   //           password: '123456',
    //   //           username: findItem.label,
    //   //         });
    //   //       }
    //   //     },
    //   //     options: MOCK_USER_OPTIONS,
    //   //     placeholder: $t('authentication.selectAccount'),
    //   //   };
    //   // },
    //   componentProps: {
    //     options: MOCK_USER_OPTIONS,
    //     placeholder: $t('authentication.selectAccount'),
    //   },
    //   fieldName: 'selectAccount',
    //   label: $t('authentication.selectAccount'),
    //   rules: z
    //     .string()
    //     .min(1, { message: $t('authentication.selectAccount') })
    //     .optional()
    //     .default('vben'),
    // },

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
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
        autocomplete: 'current-password',
      },
      fieldName: 'password',
      label: $t('authentication.password'),
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
    // {
    //   component: markRaw(SliderCaptcha),
    //   fieldName: 'captcha',
    //   rules: z.boolean().refine((value) => value, {
    //     message: $t('authentication.verifyRequiredTip'),
    //   }),
    // },
  ];
});
/**
 * 生成随机len位数字
 */
const randomLenNum = (len: number, date: boolean) => {
  let random = '';
  random = Math.ceil(Math.random() * 100_000_000_000_000)
    .toString()
    .slice(0, Math.max(0, len || 4));
  if (date) random = random + Date.now();
  return random;
};
async function loadCaptcha(isFirstLoad?: boolean) {
  // 首次加载才需要调用接口获取验证码相关配置，非首次加载只需要更新下图片以及对应randomStr即可
  if (isFirstLoad) {
    try {
      captchaLoading.value = true;
      const resp = await captchaImage();
      // console.log('captchaImage:', resp);
      if (resp.data.isUseCaptcha) {
        const randomStr = randomLenNum(resp.codeLength, true);
        captchaInfo.value.img =
          `${import.meta.env.VITE_GLOB_API_URL}/code` +
          `?randomStr=${randomStr}`;
        captchaInfo.value.randomStr = randomStr;
      }
      captchaInfo.value.enabled = resp.data.isUseCaptcha;
      captchaInfo.value.codeLength = resp.codeLength || 4;
      // debugger;
      // if (resp.enabled) {
      //   const randomStr = randomLenNum(resp.codeLength, true);
      //   captchaInfo.value.img =
      //     `${import.meta.env.VITE_GLOB_API_URL}/code` +
      //     `?randomStr=${randomStr}`;
      //   captchaInfo.value.randomStr = randomStr;
      // }
      // captchaInfo.value.enabled = resp.enabled;
      // captchaInfo.value.codeLength = resp.codeLength;
    } catch (error) {
      console.error(error);
    } finally {
      captchaLoading.value = false;
    }
  } else {
    const randomStr = randomLenNum(captchaInfo.value.codeLength, true);
    captchaInfo.value.img =
      `${import.meta.env.VITE_GLOB_API_URL}/code` + `?randomStr=${randomStr}`;
    captchaInfo.value.randomStr = randomStr;
  }
}
function onFailed() {
  loadCaptcha();
}
function handleSubmit(values: any) {
  authStore.authLogin(
    { ...values, randomStr: captchaInfo.value.randomStr },
    undefined,
    onFailed,
  );
}
onMounted(() => {
  loadCaptcha(true);
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="handleSubmit"
    :show-forget-password="false"
    :show-qrcode-login="false"
    :show-register="false"
    :show-third-party-login="false"
    :show-remember-me="true"
    :show-code-login="false"
  />
</template>
