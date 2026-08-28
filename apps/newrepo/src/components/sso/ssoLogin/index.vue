<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// SliderCaptcha  markRaw
import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useAccessStore, useSsoStore } from '@vben/stores';

import { Modal } from 'ant-design-vue';

import { DEFAULT_HOME_PATH } from '#/const';
import { useAuthStore } from '#/store';

import { loginApi, ssoLogin } from '../api';
// import {Modal} from 'ant-design-vue'
// defineOptions({ name: 'Login' });
const route = useRoute();
const router = useRouter();
const ssoStore = useSsoStore();
// 验证码loading
const captchaLoading = ref(false);
const authStore = useAuthStore();
const captchaInfo = ref({
  enabled: false,
  codeLength: 4,
  img: '',
  randomStr: '',
});
const requestObj = JSON.generalParse(route.query.requestObj as string);
const paramsObj = JSON.generalParse(route.query.params as string);
const searchStrObj = JSON.generalParse(route.query.searchStrObj as string);
const suffix: string = route.query.suffix as string;
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
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
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
// const randomLenNum = (len: number, date: boolean) => {
//   let random = '';
//   random = Math.ceil(Math.random() * 100_000_000_000_000)
//     .toString()
//     .slice(0, Math.max(0, len || 4));
//   if (date) random = random + Date.now();
//   return random;
// };
async function loadCaptcha(isFirstLoad?: boolean) {
  // 首次加载才需要调用接口获取验证码相关配置，非首次加载只需要更新下图片以及对应randomStr即可
  console.warn('loadCaptcha', isFirstLoad);
  // if (isFirstLoad) {
  //   try {
  //     captchaLoading.value = true;
  //     const resp = await captchaImage();
  //     // console.log('captchaImage:', resp);
  //     // debugger;
  //     if (resp.enabled) {
  //       const randomStr = randomLenNum(resp.codeLength, true);
  //       captchaInfo.value.img =
  //         `${import.meta.env.VITE_GLOB_API_URL}/code` +
  //         `?randomStr=${randomStr}`;
  //       captchaInfo.value.randomStr = randomStr;
  //     }
  //     captchaInfo.value.enabled = resp.enabled;
  //     captchaInfo.value.codeLength = resp.codeLength;
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     captchaLoading.value = false;
  //   }
  // } else {
  //   const randomStr = randomLenNum(captchaInfo.value.codeLength, true);
  //   captchaInfo.value.img =
  //     `${import.meta.env.VITE_GLOB_API_URL}/code` + `?randomStr=${randomStr}`;
  //   captchaInfo.value.randomStr = randomStr;
  // }
}

// function onFailed() {
//   loadCaptcha();
// }
function handleSubmit(values: any) {
  loginApi({
    ...values,
    code: values.code && undefined,
    randomStr: captchaInfo.value.randomStr && undefined,
  }).then(async () => {
    const params = Object.assign(paramsObj, requestObj, {
      username: values.username,
    });
    const response = await ssoLogin(params);
    if (
      response.data &&
      response.data.accessToken &&
      response.data.accessToken.token
    ) {
      // 返回了token的场景
      const accessStore = useAccessStore();
      accessStore.setAccessToken(response.data.accessToken.token);
      // 设置menuRoot
      if ('menuRoot' in searchStrObj) {
        ssoStore.setMenuRoot(searchStrObj.menuRoot);
      }
      // 判断是否进审批
      if (suffix) {
        const { businessKey, taskId, processInstanceId } = searchStrObj;
        const query = {
          taskId: taskId || '',
          businessKey: businessKey || '',
          processInstanceId: processInstanceId || '',
        };
        router.replace({
          path: decodeURIComponent(suffix),
          query,
        });
      } else {
        router.replace(DEFAULT_HOME_PATH);
      }
    } else {
      let message = '';
      message = response && response.msg ? response.msg : '出现不明原因错误';
      Modal.confirm({
        title: '提示',
        content: `${message}，单点登录失败，请重新使用账号密码登录？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          router.replace('/auth/login');
        },
        onCancel: () => {
          window.close();
        },
      });
    }
  });
}
onMounted(() => {
  loadCaptcha(true);
});
</script>

<template>
  <AuthenticationLogin
    title="绑定站点用户"
    sub-title="请输入您的账户信息以绑定站点用户"
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
