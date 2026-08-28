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

// 批量作废
export const batchReCheck = (params: any) => {
  return requestFormClient.post<any>('/asnAction/batchReCheck.do', params);
};
// 批量上架
export const batchPutaway = (params: any) => {
  return requestFormClient.post<any>('/asnAction/batchPutaway.do', params);
};
