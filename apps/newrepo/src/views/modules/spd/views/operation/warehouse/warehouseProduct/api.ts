import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';
// 启用
export const updateStart = (params: any) => {
  return requestFormClient.post<any>(
    'warehouseAction/startWarehouseProduct.do',
    params,
  );
};

// 停用
export const updateStop = (params: any) => {
  return requestFormClient.post<any>(
    'warehouseAction/stopWarehouseProduct.do',
    params,
  );
};

// 删除
export const delWarehouseProduct = (params: any) => {
  return requestFormClient.post<any>(
    'warehouseAction/delWarehouseProduct.do',
    params,
  );
};

// 导入库备目录
export const importWarehouseProduct = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload(
    '/warehouseAction/importWarehouseProduct.do',
    data,
    config,
  );
};

// 批量设置定数
export const setBatchUnitPackQty = (params: any) => {
  return requestFormClient.post<any>(
    '/warehouseAction/setBatchUnitPackQty.do',
    params,
  );
};

// 复制商品
export const saveWarehouseProduct = (params: any) => {
  return requestFormClient.post<any>(
    '/warehouseAction/saveWarehouseProduct.do',
    params,
  );
};

// 批量复制
export const saveWarehouseProductBatchCopy = (params: any) => {
  return requestFormClient.post<any>(
    '/warehouseAction/saveWarehouseProductfromCopy.do',
    params,
  );
};

// 获取仓库列表
export const getWarehouseList = (params?: any) => {
  return requestFormClient.post<any>('/baseHandleAction/warehouse.do', params);
};

// 批量新增库备信息
export const saveWarehouseProductBatchAdd = (params: any) => {
  return requestFormClient.post<any>(
    'warehouseAction/createWarehouseProductBatch.do',
    params,
  );
};

// 出库限量设置
export const setOutLimit = (params: any) => {
  return requestFormClient.post<any>('warehouseAction/saveOutLimit.do', params);
};
