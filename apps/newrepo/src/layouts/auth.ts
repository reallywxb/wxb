import { onMounted, ref } from 'vue';

import { captchaImage } from '#/api';

export function useCaptcha() {
  const captchaLoading = ref(false);
  const captchaInfo = ref({
    enabled: false,
    codeLength: 4,
    img: '',
    randomStr: '',
  });
  /**
   * 生成随机len位数字
   */
  function randomLenNum(len: number, date: boolean) {
    let random = '';
    random = Math.ceil(Math.random() * 100_000_000_000_000)
      .toString()
      .slice(0, Math.max(0, len || 4));
    if (date) random = random + Date.now();
    return random;
  }

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

  onMounted(() => {
    loadCaptcha(true);
  });

  return { captchaLoading, loadCaptcha, onFailed, captchaInfo };
}
