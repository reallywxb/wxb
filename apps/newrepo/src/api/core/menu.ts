import type { RouteRecordStringComponent } from '@vben/types';

import { useSsoStore } from '@vben/stores';

import { requestClient } from '#/api/request';
import { DEFAULT_MENU_ROOT } from '#/const';
import { getStaticRoutes } from '#/router/routes/static/system';

interface oldRoute {
  children: oldRoute[];
  component?: string;
  icon?: string;
  id: string;
  keepAlive?: boolean;
  label: string;
  text: string;
  path?: string;
  url?: string;
  leaf?: boolean;
}
type menuInterface =
  | null
  | oldRoute
  | {
      children: oldRoute[];
      label: string;
    };
// interface menuInterface {
//   children: oldRoute[];
//   label: string;
// }

/**
 * 获取用户所有菜单
 */
// export async function getAllMenusApi() {
//   console.log('getAllMenusApi');
//   return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
// }
let RouteIdSet: null | Set<string> = null;
export async function getAllMenusApi(): Promise<
  RouteRecordStringComponent<string>[]
> {
  RouteIdSet = new Set();
  const ssoStore = useSsoStore();
  return new Promise((resolve, reject) => {
    requestClient
      .get<menuInterface>(
        `/sys/menu?root=${ssoStore.menuRoot || DEFAULT_MENU_ROOT}`,
        // )
        //      .get<menuInterface>(
        //        `/userBaseHandleAction/getMenuV4.do?root=${ssoStore.menuRoot || DEFAULT_MENU_ROOT}`,
      )
      .then((res) => {
        if (res !== null && res.children && res.children.length > 0) {
          // res.children.splice(2); // 目前测试，只需要取第一条数据操作
          if (res.children[0]?.label === '工作台') {
            if (
              res.children[0]?.children &&
              res.children[0]?.children[0]?.label === '中心库院方'
            ) {
              const showMenu = handleRoute(res.children);
              RouteIdSet = null;
              const menus = handleWorkspaceRoute(showMenu);
              resolve([...getStaticRoutes(), ...menus]);
            } else {
              // 处理工作台第一个子菜单不是"中心库院方"的数据，修改工作台的第一个子菜单路径为默认路径
              const modifiedChildren = res.children.map((it) => {
                if (
                  it.label === '工作台' &&
                  it.children &&
                  it.children.length > 0
                ) {
                  return {
                    ...it,
                    children: it.children.map((child, index) => {
                      if (index === 0) {
                        return {
                          ...child,
                          path: '/workspace/centralStorage',
                        };
                      }
                      return child;
                    }),
                  };
                }
                return it;
              });

              const showMenu = handleRoute(modifiedChildren);
              RouteIdSet = null;
              const menus = handleWorkspaceRoute(showMenu);
              resolve([...getStaticRoutes(), ...menus]);
            }
          } else {
            const showMenu = handleRoute([
              {
                id: 'spd.web.workspace',
                text: '工作台',
                leaf: false,
                icon: 'carbon:workspace',
                url: 'purchase',
                path: '/workspace',
                component: 'Layout',
                label: '工作台',
                keepAlive: false,
                children: [
                  {
                    id: 'spd.web.workspace.centralStorage',
                    children: [],
                    text: '工作台',
                    leaf: true,
                    icon: 'ant-design:file-done-outlined',
                    path: '/workspace/centralStorage',
                    component: 'modules/spd/views/workspace/noAuthUser/index',
                    label: '工作台',
                    keepAlive: true,
                  },
                ],
              },
              ...res.children,
            ]);
            RouteIdSet = null;
            const menus = handleWorkspaceRoute(showMenu);
            resolve([...getStaticRoutes(), ...menus]);
          }
        } else if (res !== null && (res as oldRoute).leaf) {
          const showMenu = handleRoute([res as oldRoute]);
          RouteIdSet = null;
          resolve([...getStaticRoutes(), ...showMenu]);
        } else {
          RouteIdSet = null;
          resolve([]);
        }
      })
      .catch((error) => {
        RouteIdSet = null;
        reject(error);
      });
  });
}

// 对工作台的menu进行处理，如果只有一个工作台不展示左侧导航，有多个展示左侧导航
function handleWorkspaceRoute(
  routes: RouteRecordStringComponent[],
): RouteRecordStringComponent[] {
  return routes.map((route) => {
    if (
      route.children?.length === 1 &&
      !route.children?.[0]?.children?.length
    ) {
      const childrenRoute: any = route.children[0];
      route.component = childrenRoute.component;
      route.path = childrenRoute.path;
      route.children = [];
    }
    return route;
  });
}

function handleRoute(routes: oldRoute[]): RouteRecordStringComponent[] {
  const newRoutes = routes.map((route) => {
    const isOpenInNewWindow = '1'==route.openType;
    //新页面打开时，优先取route.url作为页面地址
    const routePath = isOpenInNewWindow? route.url || route.path : route.path || route.url || route.id || '';
    // 处理url的参数
    const parseUrlParams = (url: string) => {
      if (!url || !url.includes('?')) return {};
      const [, queryString] = url.split('?');
      const params: Record<string, string> = {};
      if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }
      }
      return params;
    };
    const urlParams =
      route.component && route.component?.indexOf('?') >= 0
        ? parseUrlParams(route.component || '')
        : parseUrlParams(route.url || '');
    if (route.component && route.component?.indexOf('?') >= 0) {
      route.component = route.component.split('?')[0]; // 仅保留？之前内容作为路径
    }
    if (RouteIdSet?.has(route.id)) {
      route.id = `${route.id}_${Date.now()}`;
    }
    RouteIdSet?.add(route.id);
	const isIFrame = !route.component && !isOpenInNewWindow && !route.children;
    const newRoute: RouteRecordStringComponent = {
      component:
        route.component && route.component?.indexOf('/') > -1
          ? route.component
          : '',
      meta: {
        // icon: 'mdi:barrel',
        icon: route.icon || 'mdi:barrel',
        keepAlive: route.keepAlive,
        // order: route.children && route.children.length > 0 ? -1 : undefined,
        title: route.label || route.text,
        urlParams: urlParams || {}, // 新增处理url的参数
        iframeSrc: route.component ? undefined : route.url,
        menuPageId: route.id,
		openInNewWindow: isOpenInNewWindow,
      },
      name: route.id,
      path:
        routePath && routePath.startsWith('/') ? routePath : `/${routePath}`,
      // path: route.path.startsWith('/') ? route.path : `/${route.path}`,
      children:
        route.children && route.children.length > 0
          ? handleRoute(route.children)
          : [],
    };
    return newRoute;
  });
  return newRoutes;
}
