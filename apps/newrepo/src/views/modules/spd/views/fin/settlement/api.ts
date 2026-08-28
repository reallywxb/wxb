import { requestFormClient } from '#/api/request';

// 主表
export const printDetail = (params: any) => {
  return requestFormClient.post<any>(
    '/settlementAction/modifyPrice.do',
    params,
  );
};
/*
 * 结算录入
 * */
// 创建结算
export const createSettlement = (params: any) => {
  return requestFormClient.post<any>(
    '/settlementAction/createSettlement.do',
    params,
  );
};

// 创建结算
export const delSettlement = (params: any) => {
  return requestFormClient.post<any>('/settlementAction/delete.do', params);
};

// 提交结算
export const submitSettlement = (params: any) => {
  return requestFormClient.post<any>('/settlementAction/complete.do', params);
};

/*
 * 子表
 */
// 调整结算价
export const modifyPrice = (params: any) => {
  return requestFormClient.post<any>(
    '/settlementAction/modifyPrice.do',
    params,
  );
};

// 删除行
export const deleteLine = (params: any) => {
  return requestFormClient.post<any>('/settlementAction/deleteLine.do', params);
};

// 作废
export const invalidate = (params: any) => {
  return requestFormClient.post<any>('/settlementAction/voidLine.do', params);
};
