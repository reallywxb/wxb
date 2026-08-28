/**
 * 路由映射配置
 * 用于区分中心库和科室库的路由跳转
 */

// 路由类型枚举
export enum RouteType {
  DEPARTMENT = 'department', // 科室库
  WAREHOUSE = 'warehouse', // 中心库
}

// 路由映射配置接口
interface RouteConfig {
  warehouse: string; // 中心库路由
  department: string; // 科室库路由
}

const ROUTE_MAPPING: Record<string, RouteConfig> = {
  // 在库数量|散件在库|批号|在途数量|在库数量 -> 批次查询
  storageDetailQuery: {
    warehouse: '/warehouse/storage/detailQuery',
    department: '/deption/storage/detailQuery',
  },
  // 库存数量 -> 批号查询
  storageLotQuery: {
    warehouse: '/warehouse/storage/lotQuery',
    department: '/deption/storage/lotQuery',
  },
  // 批次查询(追溯按钮) -> 批号追溯（库存）
  inoutProductTrace: {
    warehouse: '/warehouse/storage/productTrace',
    department: '/deption/storage/productTrace',
  },
};

// 中心库路由标识集合
const WAREHOUSE_ROUTE_IDS = new Set([
  'spd.web.wms.storage.detailQuery',
  'spd.web.wms.storage.lotQuery',
  'spd.web.wms.storage.productTrace',
  'spd.web.wms.storage.warning',
]);
// 科室库路由标识集合
const DEPARTMENT_ROUTE_IDS = new Set([
  'spd.web.wms.deption.storage.detailQuery',
  'spd.web.wms.deption.storage.lotQuery',
  'spd.web.wms.deption.storage.productTrace',
  'spd.web.wms.deption.storage.warning',
]);

/**
 * 根据当前路由ID判断路由类型
 * @param currentRouteId 当前路由ID或路由名称
 * @returns RouteType
 */
export function getRouteType(currentRouteId: string): RouteType {
  if (WAREHOUSE_ROUTE_IDS.has(currentRouteId)) {
    return RouteType.WAREHOUSE;
  }
  if (DEPARTMENT_ROUTE_IDS.has(currentRouteId)) {
    return RouteType.DEPARTMENT;
  }

  // 如果没有精确匹配，通过路径判断
  if (currentRouteId.includes('deption')) {
    return RouteType.DEPARTMENT;
  }

  // 默认返回中心库
  return RouteType.WAREHOUSE;
}

/**
 * 获取目标路由路径
 * @param routeKey 路由配置键名
 * @param currentRouteId 当前路由ID（可选，如果不传则需要传routeType）
 * @param routeType 路由类型（可选）
 * @returns 目标路由路径
 */
export function getTargetRoute(
  routeKey: string,
  currentRouteId?: string,
  routeType?: RouteType,
): string {
  const config = ROUTE_MAPPING[routeKey];
  console.warn('路由配置:', config);
  if (!config) {
    console.warn(`路由配置不存在: ${routeKey}`);
    return '';
  }

  // 优先使用传入的routeType，否则根据currentRouteId推断
  const type =
    routeType ||
    (currentRouteId ? getRouteType(currentRouteId) : RouteType.WAREHOUSE);

  return type === RouteType.WAREHOUSE ? config.warehouse : config.department;
}

/**
 * 工具类：路由映射管理器
 */
export class RouteMappingManager {
  private currentRouteType: RouteType;

  constructor(currentRouteId: string) {
    this.currentRouteType = getRouteType(currentRouteId);
  }

  /**
   * 获取目标路由
   * @param routeKey 路由配置键名
   * @returns 目标路由路径
   */
  getRoute(routeKey: string): string {
    return getTargetRoute(routeKey, undefined, this.currentRouteType);
  }

  /**
   * 判断当前是否为科室库
   */
  isDepartment(): boolean {
    return this.currentRouteType === RouteType.DEPARTMENT;
  }

  /**
   * 判断当前是否为中心库
   */
  isWarehouse(): boolean {
    return this.currentRouteType === RouteType.WAREHOUSE;
  }
}

export default {
  getRouteType,
  getTargetRoute,
  RouteMappingManager,
  RouteType,
};
