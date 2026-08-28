import type { RouteRecordRaw } from 'vue-router';

import { BLANK_LOGIN_PATH, LOGIN_PATH } from '@vben/constants';
import { useAccessStore } from '@vben/stores';

import { DEFAULT_HOME_PATH } from '#/const';
import { AuthPageLayout, BasicLayout } from '#/layouts';
import { $t } from '#/locales';
import Login from '#/views/_core/authentication/login.vue';

/** 全局404页面 */
const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

/** 基本路由，这些路由是必须存在的 */
const coreRoutes: RouteRecordRaw[] = [
  /**
   * 根路由
   * 使用基础布局，作为所有页面的父级容器，子级就不必配置BasicLayout。
   * 此路由必须存在，且不应修改
   */
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: DEFAULT_HOME_PATH,
    children: [],
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: 'Authentication',
    },
    name: 'Authentication',
    path: '/auth',
    // redirect: LOGIN_PATH,
    redirect(to) {
      if (to.path === BLANK_LOGIN_PATH) {
        const accessStore = useAccessStore();
        return accessStore.accessToken && accessStore.isAccessChecked
          ? {
              path: DEFAULT_HOME_PATH,
              query: {},
            }
          : {
              path: LOGIN_PATH,
              query: {},
            };
      }
      return {
        path: LOGIN_PATH,
        query: to.query,
      };
    },
    children: [
      {
        name: 'Login',
        path: 'login',
        component: Login,
        meta: {
          title: $t('page.auth.login'),
        },
      },
      {
        name: 'CodeLogin',
        path: 'code-login',
        component: () => import('#/views/_core/authentication/code-login.vue'),
        meta: {
          title: $t('page.auth.codeLogin'),
        },
      },
      {
        name: 'QrCodeLogin',
        path: 'qrcode-login',
        component: () =>
          import('#/views/_core/authentication/qrcode-login.vue'),
        meta: {
          title: $t('page.auth.qrcodeLogin'),
        },
      },
      {
        name: 'ForgetPassword',
        path: 'forget-password',
        component: () =>
          import('#/views/_core/authentication/forget-password.vue'),
        meta: {
          title: $t('page.auth.forgetPassword'),
        },
      },
      {
        name: 'Register',
        path: 'register',
        component: () => import('#/views/_core/authentication/register.vue'),
        meta: {
          title: $t('page.auth.register'),
        },
      },
      // {
      //   name: 'BlankLogin',
      //   path: 'blankLogin',
      //   component: () => import('#/layouts/blankLogin.vue'),
      //   meta: {
      //     title: $t('page.auth.blankLogin'),
      //     ignoreAccess: true,
      //   },
      // },
    ],
  },
  {
    component: () => import('#/views/sso/sso/index.vue'),
    meta: {
      title: '单点登录',
    },
    name: 'Sso',
    path: '/sso',
  },
  {
    component: () => import('#/views/sso/ssoLogin/auth.vue'),
    meta: {
      title: '账号密码登录',
    },
    name: 'SsoLogin',
    path: '/ssoLogin',
    redirect: '/ssoLogin/login',
    children: [
      {
        name: 'SsoLoginInner',
        path: 'login',
        component: () => import('#/views/sso/ssoLogin/index.vue'),
        meta: {
          title: '账号密码登录',
        },
      },
    ],
  },
  {
    name: 'BlankLogin',
    path: '/blankLogin',
    component: () => import('#/layouts/blankLogin.vue'),
    meta: {
      title: $t('page.auth.blankLogin'),
    },
  },
];

export { coreRoutes, fallbackNotFoundRoute };
