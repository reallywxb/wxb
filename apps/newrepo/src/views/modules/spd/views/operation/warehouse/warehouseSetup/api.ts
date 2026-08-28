import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';

// 仓库一览列表
export interface WarehouseTableType {
  departmentId: string;
  departmentName: string;
  isActive: string;
  isHisWarehouse: string;
  isInventorying: string;
  isStandAlone: string;
  name: string;
  orgId: string;
  orgName: string;
  serverId: string;
  serverName: string;
  value: string;
  warehouseCode: string;
  warehouseId: string;
  warehousePolicyId: string;
  warehousePolicyName: string;
  warehouseType: string;
  warehouseTypeName: string;
  replenishPolicyName?: string;
  parentWarehouseId?: string;
  parentWarehouseName?: string;
  address?: string;
  [key: string]: any;
}

// 仓库库房列表
export interface WarehouseRoomTableType {
  created: string;
  isActive: string;
  name: string;
  orgId: string;
  orgName: string;
  updated: string;
  value: string;
  warehouseId: string;
  warehouseName: string;
  zoneId: string;
}

// 库房新增&&编辑
export interface WarehouseRoomFormType {
  warehouseId: string;
  zoneId?: string | undefined;
  name: string;
  value: string;
  isActive: 'N' | 'Y';
}

// 仓库用户列表
export interface WarehouseUserTableType {
  created: string;
  createdBy: string;
  createdName: string;
  isActive: 'N' | 'Y';
  isReadWrite: 'N' | 'Y';
  sectionAuthType: string;
  sectionAuthTypeName: string;
  updated: string;
  updatedBy: string;
  updatedName: string;
  userId: string;
  userName: string;
  warehouseCode: string;
  warehouseId: string;
  warehouseName: string;
}

// 库房信息
export interface ZoneInfoType {
  created: string;
  createdBy: string;
  createdName: string;
  isActive: string;
  isSmart: string;
  name: string;
  orgId: string;
  orgName: string;
  sectionId: string;
  updated: string;
  updatedBy: string;
  updatedName: string;
  value: string;
  warehouseId: string;
  warehouseName: string;
  zoneId: string;
  zoneName: string;
}

// 获取树结构
export const getWarehouseTree = (params?: any) => {
  return requestFormClient.post<any>('/warehouseAction/queryWarehouseTree.do', {
    type: 'mc',
    ...params,
  });
};

// 新增&&修改仓库
export const saveWarehouse = (data: any) => {
  return requestFormClient.post<any>('warehouseAction/saveWarehouse.do', data);
};
export const getDepartmentTreeWithPermission = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/queryDepTreeWithUserPower.do',
    params,
  );
};

// warehouse 仓库
// 获取仓库信息
export const getWarehouseInfo = (params: { warehouseId: string }) => {
  return requestFormClient.post<any>('/warehouseAction/queryWarehouse.do', {
    type: 'mc',
    ...params,
  });
};

// 新增&&修改仓库库房
export const saveWarehouseRoom = (params: WarehouseRoomFormType) => {
  return requestFormClient.post<any>('warehouseAction/saveZone.do', params);
};

// 删除仓库库
export const delWarehouseRoom = (params: { zoneId: string }) => {
  return requestFormClient.post<any>('warehouseAction/delZone.do', params);
};

// 新增&&修改仓库用户
export const saveWarehouseUser = (params: {
  isActive: 'N' | 'Y';
  isReadWrite: 'N' | 'Y';
  sectionAuth?: string;
  sectionAuthType: string;
  userId: string;
  warehouseId: string;
}) => {
  return requestFormClient.post<any>(
    'warehouseAction/saveWarehouseUser.do',
    params,
  );
};

// 删除仓库用户
export const delWarehouseUser = (params: {
  userId: string;
  warehouseId: string;
}) => {
  return requestFormClient.post<any>(
    'warehouseAction/delWarehouseUser.do',
    params,
  );
};

// 新增仓库商品组
export const saveWarehouseProductControl = (params: {
  id?: number | string;
  isActive: 'N' | 'Y';
  productControlLevel: string;
  settlementMode: string;
  warehouseId: string;
}) => {
  return requestFormClient.post<any>(
    '/warehouseAction/saveWarehouseProductControl.do',
    params,
  );
};

// 删除仓库商品组
export const delWarehouseProductControl = (params: {
  productControlLevel: string;
  warehouseId: string;
}) => {
  return requestFormClient.post<any>(
    '/warehouseAction/delWarehouseProductControl.do',
    params,
  );
};

// 新增
interface CreateWarehouseProductCategoryParams {
  isActive: 'N' | 'Y';
  productCategoryId: string;
  warehouseId: string;
}

// 修改
interface UpdateWarehouseProductCategoryParams {
  id: string;
  isActive: 'N' | 'Y';
}

type WarehouseProductCategoryParams =
  | CreateWarehouseProductCategoryParams
  | UpdateWarehouseProductCategoryParams;

// 新增仓库商品类型
export const saveWarehouseProductCategory = (
  params: WarehouseProductCategoryParams,
) => {
  return requestFormClient.post<any>(
    '/warehouseAction/saveWarehouseProductCategory.do',
    params,
  );
};

// 删除仓库商品类型
export const delWarehouseProductCategory = (params: {
  productCategoryId: string;
  warehouseId: string;
}) => {
  return requestFormClient.post<any>(
    '/warehouseAction/delWarehouseProductCategory.do',
    params,
  );
};

// zone 库房
// 库房信息获取
export const queryZoneInfo = (params: { zoneId: string }) => {
  return requestFormClient.post<any>('/warehouseAction/queryZone.do', params);
};

// 保存库房信息
export const saveZoneInfo = (params: any) => {
  return requestFormClient.post<any>('/warehouseAction/saveZone.do', params);
};

// 添加和修改 库房库区
export const saveZoneSection = (params: any) => {
  return requestFormClient.post<any>('/warehouseAction/saveSection.do', params);
};

// 删除库房库区
export const delZoneSection = (params: any) => {
  return requestFormClient.post<any>('/warehouseAction/delSection.do', params);
};

// section 库区
// 获取库区信息
export const querySectionFormInfo = (params: { sectionId: string }) => {
  return requestFormClient.post<any>('warehouseAction/querySection.do', params);
};

// 保存库区信息
export const saveSectionFormInfo = (params: any) => {
  return requestFormClient.post<any>('/warehouseAction/saveSection.do', params);
};

// 新增修改库区货拉
export const saveSectionLocator = (params: any) => {
  return requestFormClient.post<any>('/warehouseAction/saveLocator.do', params);
};

// 删除库区货拉
export const delSectionLocator = (params: any) => {
  return requestFormClient.post<any>('/warehouseAction/delLocator.do', params);
};

// 保存新权限
export const saveUserDepartmentPermission = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/saveBatchDepUserAcess.do',
    params,
  );
};

// 保存新权限
export const moveUserDepartmentPermission = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/moveDepartment.do',
    params,
  );
};

// 导入仓库
export const importWarehouseData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload(
    'warehouseAction/importWarehouse.do',
    data,
    config,
  );
};

// 导入货物
export const importLocatorData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload(
    '/warehouseAction/importLocator.do',
    data,
    config,
  );
};

// 导入商品组
export const importProductControlData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload(
    '/warehouseAction/importWarehouseProductControl.do',
    data,
    config,
  );
};
