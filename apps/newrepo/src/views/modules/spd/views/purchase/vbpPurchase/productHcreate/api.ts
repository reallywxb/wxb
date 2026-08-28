import type { RequestClientConfig } from '@vben/request';

import { requestClient, requestFormClient } from '#/api/request';

export interface StoragePath {
  path: string;
  format: string;
  id: number;
}

// 批次数据的接口定义
export interface BatchItem {
  beginDate: string;
  endDate: string;
  isActive: 'N' | 'Y'; // 是否有效（Y：有效，N：无效）
  name: string;
  productTypeName: string;
  storagePaths: StoragePath[];
  type: 'C' | 'N' | 'O' | 'P'; // 类型（C：市采，N：国采，O：其他，P：省采）
  typeName: string;
  vbpBatchId: string;
  remark?: string;
}

// 树节点的数据结构
export interface TreeNode {
  id: string;
  vbpBatchId?: string;
  open?: boolean;
  text: string;
  dateRange?: string;
  remark?: string;
  type: 'C' | 'N' | 'O' | 'P';
  key: string;
  children?: TreeNode[];
  iconSkin?: string;
  [key: string]: any;
}

export interface ProductVBPItem {
  baseUom: string;
  baseUomName: string;
  dosageValue: string;
  isActive: 'N' | 'Y';
  manufacturer: string;
  name: string;
  productSpec: string;
  qtyPlaned: string;
  qtyType: string;
  qtyTypeName: string;
  vbpBatchId: string;
  vbpProductId: string;
  vendorId: string;
}

export interface ProductMapItem {
  baseUomId: string;
  baseUomName: string;
  manufacturer: string;
  markCode: string;
  medicineName: string;
  modelNo: string;
  pricePo: string;
  productCode: string;
  productId: number;
  productName: string;
  productSpec: string;
  productUserCode: string;
  uomName: string;
  value: string;
  vendor: string;
}

export interface ChildTableRow {
  baseUOMQty: string;
  baseUomName: string;
  isActive: 'N' | 'Y';
  isBulkPurchase: 'N' | 'Y';
  manufacturer: string;
  mapId: string;
  markCode: string;
  medicineName: string;
  modelNo: string;
  mproductId: string;
  pricePo: string;
  productFullName: string;
  productName: string;
  productSpec: string;
  productcode: string;
  vbpProductId: string;
}

// 获取集采批次
export const getBatchVBPActionList = (params: any) => {
  return requestFormClient.post<any>('batchVBPAction/query.do', params);
};

// 新增&&修改集采批次
export const saveBatchVBPAction = (
  data: Record<string, any> & { files: Blob[] | File[] },
  config?: RequestClientConfig,
) => {
  return requestClient.upload('/batchVBPAction/save.do', data, config);
};

// 删除集采批次附件
export async function deleteBatchAttachment(id: number | string) {
  return requestClient.post(`/batchVBPAction/deleteAttach.do?id=${id}`);
}

// 删除采集批次
export const deleteBatchVBPAction = (params: { id: string }) => {
  return requestFormClient.post<any>('/batchVBPAction/delete.do', params);
};

export const getDepartmentTreeWithPermission = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/queryDepTreeWithUserPower.do',
    params,
  );
};

// 复制集采批次目录
export const copyBatchVBPAction = (params: any) => {
  return requestFormClient.post<any>('batchVBPAction/createByBacth.do', params);
};

// 父表 新增&&修改 集采批次商品
export const saveProductVBPAction = (params: any) => {
  return requestFormClient.post<any>('productVBPAction/save.do', params);
};

// 父表 导入集采批次商品
export const importProductVBPAction = (data: any, params?: any) => {
  return requestFormClient.upload(
    `productVBPAction/importProduct.do?productType=${data.productType}`,
    data,
    {
      params,
      responseReturn: 'body',
    },
  );
};

// 父表 删除集采批次商品
export const deleteProductVBPAction = (params: any) => {
  return requestFormClient.post<any>('/productVBPAction/delete.do', params);
};

// 子表 新增中标|非中标商品
export const batchSaveProductMapVBPAction = (params: any) => {
  return requestFormClient.post<any>(
    'productVBPAction/batchSaveMap.do',
    params,
  );
};

// 子表 修改中标和非中标商品状态
export const changeBulkPurchaseStatus = (params: any) => {
  return requestFormClient.post<any>(
    'productVBPAction/batchChangeIsBulkPurchase.do',
    params,
  );
};

// 子表 删除商品(单选|多选)
export const deleteProductMapVBPAction = (params: any) => {
  return requestFormClient.post<any>('productVBPAction/deleteMap.do', params);
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
