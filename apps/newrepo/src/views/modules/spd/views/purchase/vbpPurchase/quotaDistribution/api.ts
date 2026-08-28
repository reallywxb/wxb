import type { RequestClientConfig } from '@vben/request';

import { requestClient, requestFormClient } from '#/api/request';

export interface StoragePath {
  path: string;
  format: string;
  id: number;
}

/** 批次列表项 */
export interface BatchItem {
  /** 批次ID */
  vbpBatchId: string;
  /** 批次名称 */
  name: string;
  /** 类型: C市采 / N国采 / O其他 / P省采 */
  type: 'C' | 'N' | 'O' | 'P';
  /** 类型中文名 */
  typeName: string;
  /** 开始日期 */
  beginDate: string;
  /** 结束日期 */
  endDate: string;
  departmentId: number | string;
  /** 是否有效 */
  isActive: 'N' | 'Y';
  /** 状态: Y执行中 / N未开始 / CO已结束 */
  status?: string;
  /** 状态中文名 */
  statusName?: string;
  /** 品规数量 */
  productCount: number;
  /** 产品类别名 */
  productTypeName: string;
  /** 附件路径 */
  storagePaths?: StoragePath[];
  /** 备注 */
  remark?: string;
}

/** VBP产品项 */
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

/** 查询参数 */
export interface BatchQueryParams {
  /** 产品名称类型: H耗材 */
  productType?: string;
  /** 批次ID */
  batchId?: string;
  /** 名称搜索 */
  name?: string;
  /** 状态筛选: Y执行中 / N未开始 / CO已结束 */
  status?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 排序方向 */
  dir?: string;
  /** 排序字段 */
  sort?: string;
}

/** 批量VBP批次查询 */
export const getBatchVBPActionList = (params: BatchQueryParams) => {
  return requestFormClient.post<{ rows: BatchItem[]; total: number }>(
    'batchVBPAction/query.do',
    params,
  );
};

/** 新增&&修改集采批次 */
export const saveBatchVBPAction = (
  data: Record<string, any> & { files: Blob[] | File[] },
  config?: RequestClientConfig,
) => {
  return requestClient.upload('/batchVBPAction/save.do', data as any, config);
};

/** 删除集采批次附件 */
export async function deleteBatchAttachment(id: number | string) {
  return requestClient.post(`/batchVBPAction/deleteAttach.do?id=${id}`);
}

/** 删除采集批次 */
export const deleteBatchVBPAction = (params: { id: string }) => {
  return requestFormClient.post<any>('/batchVBPAction/delete.do', params);
};

/** 复制集采批次目录 */
export const copyBatchVBPAction = (params: any) => {
  return requestFormClient.post<any>('batchVBPAction/createByBacth.do', params);
};

/** 父表 新增&&修改 集采批次商品 */
export const saveProductVBPAction = (params: any) => {
  return requestFormClient.post<any>('productVBPAction/save.do', params);
};

/** 父表 导入集采批次商品 */
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

/** 父表 删除集采批次商品 */
export const deleteProductVBPAction = (params: any) => {
  return requestFormClient.post<any>('/productVBPAction/delete.do', params);
};

/** 子表 新增中标|非中标商品 */
export const batchSaveProductMapVBPAction = (params: any) => {
  return requestFormClient.post<any>(
    'productVBPAction/batchSaveMap.do',
    params,
  );
};

/** 子表 修改中标和非中标商品状态 */
export const changeBulkPurchaseStatus = (params: any) => {
  return requestFormClient.post<any>(
    'productVBPAction/batchChangeIsBulkPurchase.do',
    params,
  );
};

/** 子表 删除商品(单选|多选) */
export const deleteProductMapVBPAction = (params: any) => {
  return requestFormClient.post<any>('productVBPAction/deleteMap.do', params);
};

/** 自动分配产品 */
export const autoAllocateProduct = (params: {
  dateFrom: string;
  dateTo: string;
  hisDateFrom: string;
  hisDateTo: string;
  vbpBatchId: string;
  vbpProductIds: string[];
}) => {
  return requestClient.post<any>(
    'productVBPAction/autoAllocateProduct.do',
    params,
  );
};

/** 保存科室分配用量 */
export const saveAllocate = (params: {
  cBPartnerId: number | string;
  monthDetailList: any[];
  vbpBatchId: number | string;
  vbpProductId: number | string;
}) => {
  return requestClient.post<any>('productVBPAction/saveAllocate.do', params);
};

/** 新增科室指标 */
export const addDeptQuota = (params: {
  cBPartnerId: number | string;
  monthDetailList: any[];
  vbpBatchId: number | string;
  vbpProductId: number | string;
}) => {
  return requestClient.post<any>('productVBPAction/saveAllocate.do', params);
};

/** 批量删除科室指标 */
export const deleteDeptQuotas = (params: {
  vbpProductId: string;
  vbpBatchId: string;
  cBPartnerIdList: string[];
}) => {
  return requestClient.post<any>('/productVBPAction/delAllocate', params);
};

/** 子表 商品映射项 */
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
