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
    '/orderAction/queryStorage.do',
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
    '/orderAction/queryLine.do?page=woInput&specShowType=from&limit=100000&',
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
  return requestFormClient.post<any>('/orderAction/save.do', params);
  // return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/orderAction/save.do', params);
};

export const detailCommitDo = (params: any) => {
  return requestFormClient.post<any>(
    '/orderAction/save.do?page=package',
    params,
  );
};
export const invalidateCancel = (params: any) => {
  return requestFormClient.post<any>('/orderAction/delete.do', params);
};
export const dataCommit = (params: any) => {
  return requestFormClient.post<any>('/orderAction/commit.do', params);
};
export const copyPlan = (params: any) => {
  return requestFormClient.post<any>(
    '/orderPlanAction/createByOrderPlan.do',
    params,
  );
};
export const addAsnTracCode = (params: any) => {
  return requestFormClient.post<any>('/asnAction/addAsnTracCodeV4.do', params);
};
export const deleteAsnTracCode = (params: any) => {
  return requestFormClient.post<any>('/asnAction/deleteAsnTracCode.do', params);
};

export const createMoPlan = (params: any) => {
  return requestFormClient.post<any>('/autoPlanAction/createMoPlan.do', params);
};
