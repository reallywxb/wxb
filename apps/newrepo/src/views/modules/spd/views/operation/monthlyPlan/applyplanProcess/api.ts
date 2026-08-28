import { requestFormClient } from '#/api/request';

// 创建采购计划
export const createPurchase = (params: any) => {
  return requestFormClient.post<any>(
    '/applyPlanAction/createOrderPlanByLine.do',
    params,
  );
};

// 创建请领
export const createPick = (params: any) => {
  return requestFormClient.post<any>(
    '/applyPlanAction/createOrderByLine.do',
    params,
  );
};
