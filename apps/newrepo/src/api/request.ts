/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { WHETHER_DELETE_EMPTY_FIELD_IN_POST } from '#/const';
import { useAuthStore, useRouteStore } from '#/store';
import { removeEmptyFields } from '#/utils/util';

import { refreshTokenApi } from './core';

// const routeStore = useRouteStore();
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
// const route = useRoute();
function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
    timeout: 30 * 60 * 1000,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      // 去除post接口内的空值字段
      if (
        config.method === 'post' &&
        WHETHER_DELETE_EMPTY_FIELD_IN_POST &&
        config.headers['Content-Type'] !== 'multipart/form-data' &&
        !config.headers['REQUEST-SCENE'] // 不是特殊的请求场景，REQUEST-SCENE仅在公共组件的某些特殊接口会添加
      ) {
        config.data = removeEmptyFields(config.data);
      }

      const accessStore = useAccessStore();
      const routeStore = useRouteStore();
      // 在url上添加menuPageId 无token的无需添加
      if (
        accessStore.accessToken &&
        config.url &&
        typeof config.url === 'string'
      ) {
        if (
          config.url.includes('?') &&
          (config.url.endsWith('&') || config.url.endsWith('?'))
        ) {
          config.url = `${config.url}_menuPageId=${routeStore.getCurrentMenuId() || ''}`;
        } else if (config.url.includes('?')) {
          config.url = `${config.url}&_menuPageId=${routeStore.getCurrentMenuId() || ''}`;
        } else {
          config.url = `${config.url}?_menuPageId=${routeStore.getCurrentMenuId() || ''}`;
        }
      }

      config.headers.Authorization ||
        (config.headers.Authorization = formatToken(accessStore.accessToken));
      config.headers['Accept-Language'] = preferences.app.locale;

      config.headers['x-requested-with'] = 'XMLHttpRequest'; // 标记为ajax请求
      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'success',
      dataField: (responseData) => {
        return responseData.code === undefined
          ? responseData
          : responseData.data || responseData;
      },
      successCode: (code) => {
        return code || undefined === code;
      },
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      // 如果没有错误信息，则会根据状态码进行提示
      // 限制错误信息最大显示长度，避免遮挡页面
      const maxLength = 200;
      const finalMsg =
        errorMessage || responseData.msg || responseData.data?.msg || msg;
      message.error(
        finalMsg && finalMsg.length > maxLength
          ? `${finalMsg.substring(0, maxLength)}...`
          : finalMsg,
      );
    }),
  );

  return client;
}
export const requestClient = createRequestClient(apiURL, {
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
  responseReturn: 'data',
});

export const requestFormClient = createRequestClient(apiURL, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  responseReturn: 'data',
});

export const fmRequestClient = createRequestClient('/fm-api', {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
baseRequestClient.addRequestInterceptor({
  fulfilled: async (config) => {
    function formatToken(token: null | string) {
      return token ? `Bearer ${token}` : null;
    }
    const accessStore = useAccessStore();
    config.headers.Authorization ||
      (config.headers.Authorization = formatToken(accessStore.accessToken));
    config.headers['Accept-Language'] = preferences.app.locale;

    config.headers['x-requested-with'] = 'XMLHttpRequest'; // 标记为ajax请求
    return config;
  },
});
export const aiRequestClient = new RequestClient({ baseURL: '/ai' });
export const aiRequestClientBackup = new RequestClient({ baseURL: '/audio' });
export interface PageFetchParams {
  [key: string]: any;
  pageNo?: number;
  pageSize?: number;
}
