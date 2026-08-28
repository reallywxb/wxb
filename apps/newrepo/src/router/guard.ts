import type { Router, RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useSsoStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { DEFAULT_HOME_PATH } from '#/const';
import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore, useRouteStore } from '#/store';

import { generateAccess } from './access';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach(async (to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }

    // 设置当前路由的menuId到store中
    const routeStore = useRouteStore();
    // 从路由的meta中获取menuId，如果没有则使用路由的name作为menuId
    const menuPageId: string = to.meta.menuPageId as string;
    routeStore.setCurrentMenuId(menuPageId);

    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行
    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const ssoStore = useSsoStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();
    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            DEFAULT_HOME_PATH,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === DEFAULT_HOME_PATH
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }
    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });
    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    // 如果没有任何可访问路由（角色无权限），直接跳 404
    if (accessibleRoutes.length === 0) {
      return {
        name: 'FallbackNotFound',
        replace: true,
      };
    }

    let redirectPath = (from.query.redirect ??
      (to.path === DEFAULT_HOME_PATH
        ? userInfo.homePath || DEFAULT_HOME_PATH
        : to.fullPath)) as string;

    // 如果accessibleRoutes里存在redirectPath对应路由，则不修改redirectPath
    // 如果是单点登录并且单点登录模式是用友内部打开，则使用路由列表中的第一个在menu中展示的路由地址做跳转
    const firstShowRoute = getFirstShowRoute(accessibleRoutes);
    if (ssoStore.isFromPortal && ssoStore.isInPortal && firstShowRoute) {
      redirectPath = firstShowRoute.path;
    }

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}
function getFirstShowRoute(routes: RouteRecordRaw[]) {
  return routes.find((route) => !route.meta?.hideInMenu);
}
/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
