import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import chcUi from '@vben/chc-ui';
import { initTippy, registerLoadingDirective } from '@vben/common-ui';
import { MotionPlugin } from '@vben/plugins/motion';
import { preferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/antd';

import { VueQueryPlugin } from '@tanstack/vue-query';
import { useTitle } from '@vueuse/core';

import { requestClient } from '#/api/request';
import Sso from '#/components/sso';
import { $t, setupI18n } from '#/locales';
import { router } from '#/router';

import { initComponentAdapter } from './adapter/component';
import App from './app.vue';

// import '#/mock/demoData';
import 'element-plus/dist/index.css';
import 'tdesign-vue-next/es/style/index.css'; // 引入少量全局样式变量
import '@xgsk/vue3-page-split/dist/style.css';
import 'vue3-page-split/dist/style.css';
import 'driver.js/dist/driver.css';

async function bootstrap(namespace: string) {
  // 初始化组件适配器
  await initComponentAdapter();

  // // 设置弹窗的默认配置
  // setDefaultModalProps({
  //   fullscreenButton: false,
  // });
  // // 设置抽屉的默认配置
  // setDefaultDrawerProps({
  //   // zIndex: 1020,
  // });

  const app = createApp(App);

  // 注册v-loading指令
  registerLoadingDirective(app, {
    loading: 'loading', // 在这里可以自定义指令名称，也可以明确提供false表示不注册这个指令
    spinning: 'spinning',
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, { namespace }, sessionStorage);

  // 安装权限指令
  registerAccessDirective(app);

  // 初始化 tippy
  initTippy(app);
  // 配置路由及路由守卫
  app.use(router);

  // 配置@tanstack/vue-query
  app.use(VueQueryPlugin);

  // 配置Motion插件
  app.use(MotionPlugin);

  // 注册chc-ui组件
  app.use(chcUi, { axios: requestClient });

  // 注册单点登录相关组件
  app.use(Sso);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });
  Object.defineProperty(JSON, 'generalParse', {
    value: (obj: any) => {
      if (typeof obj === 'string') {
        try {
          const parseResult = JSON.parse(obj);
          return parseResult;
        } catch {
          return obj;
        }
      } else {
        return obj;
      }
    },
  });
  app.mount('#app');
}

export { bootstrap };
