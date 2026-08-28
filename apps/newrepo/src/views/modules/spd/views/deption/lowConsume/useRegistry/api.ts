import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';

interface OrderPlanStorage {
  level_Day: number;
  level_Max: number;
  level_Min: number;
  level_Replenish: number;
  pricePo: number;
  productId: number;
  qtyOnHand: number;
  qtyOrdered: number;
  qtyOrdering: number;
  success: boolean;
  vendorId: number;
  vendorName: string;
  warehouseId: number;
}
export const getOrderPlanStorage = (params: any) => {
  return requestFormClient.post<OrderPlanStorage>(
    '/orderPlanAction/queryStorage.do',
    params,
  );
};
interface OrderPlanLineInfo {
  rows: {
    [key: string]: any;
    baseUOMQty: string;
    defaultVendorCode: string;
    defaultVendorId: number;
    defaultVendorName: string;
    departmentName: string;
    guaranteeDate: string;
    hasCert: string;
    insurance: string;
    isBid: string;
    isBulkPurchase: string;
    isCityBid: string;
    isFee: string;
    isGift: string;
    isMonitor: string;
    isOfflinePo: string;
    isPrecious: string;
    isShortPo: string;
    lastMonthSoQty: number;
    latestPrice: number;
    Level_Day: number;
    level_Max: number;
    level_Min: number;
    level_Replenish: number;
    level_Replenish_Bf: number;
    lineAmt: number;
    lPackageQty: number;
    mPackageQty: number;
    orderPlanId: number;
    orderPlanLineId: number;
    price: number;
    priceList: number;
    pricePO: number;
    productCategoryName: string;
    productCode: string;
    productId: number;
    productName: string;
    productSpec: string;
    productValue: string;
    qtyAutoPlaned: number;
    qtyOnHand: number;
    qtyOnHandAllWarehouse: number;
    qtyOrdering: number;
    qtyPlaned: number;
    replenishPackageQty: number;
    sPackageQty: number;
    standardCode: string;
    storageStatus: string;
    thisMonthSoQty: number;
    unitPackQty: number;
    uomId: number;
    uomName: string;
    vendorCode: string;
    vendorId: number;
    vendorName: string;
  }[];
  success: boolean;
  msg: string;
}
export const queryOrderPlanLineInfo = (params: any) => {
  return requestFormClient.post<OrderPlanLineInfo>(
    '/orderPlanAction/queryLine.do?page=edit&showStorage=Y&limit=100000',
    params,
  );
};
interface ProductVendor {
  rows: {
    id: number;
    name: string;
    price: string;
  }[];
}
export const queryProductVendor = (params: any) => {
  return requestFormClient.post<ProductVendor>(
    '/orderPlanAction/productVendor.do',
    params,
  );
};
export const saveLine = (params: any) => {
  return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/orderPlanAction/save.do', params);
};

export async function getDataTableList(tabelId: string, data: any) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/page/${tabelId}`;
  return requestFormClient.post<TableData<any>>(url, data);
}

export const getDataApi = (params: any) => {
  return requestFormClient.post<any>(
    '/reuseAction/queryPackage.do?isAccurate=Y',
    params,
  );
};

export const invalidateCancel = (params: any) => {
  return requestFormClient.post<any>('/orderPlanAction/invalidate.do', params);
};
export const exhaustItDo = (params: any) => {
  return requestFormClient.post<any>('/reuseAction/exhaustIt.do', params);
};
export const useItDo = (params: any) => {
  return requestFormClient.post<any>('/reuseAction/useIt.do', params);
};
export const dataCancel = (params: any) => {
  return requestFormClient.post<any>(
    '/inoutAction/shipmentPackageRevert.do',
    params,
  );
};

export const getDept = (params: any) => {
  return requestFormClient.post<any>('/userBaseHandleAction/query.do', params);
};

export const importPoPlanData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload(
    '/packageAction/queryPackageByimport.do',
    data,
    config,
  );
};
