import { requestFormClient } from '#/api/request';

// 创建付款
export const createPayment = (params: any) => {
  return requestFormClient.post<any>(
    'paymentAction/createPaymentByPlan.do',
    params,
  );
};

// 提交付款
export const submitPayment = (params: any) => {
  return requestFormClient.post<any>('paymentAction/commit.do', params);
};

// 删除付款
export const deletePayment = (params: any) => {
  return requestFormClient.post<any>('paymentAction/delete.do', params);
};

// 批准付款
export const approvePayment = (params: any) => {
  return requestFormClient.post<any>('paymentAction/complete.do', params);
};

// 退回付款
export const callbackPayment = (params: any) => {
  return requestFormClient.post<any>('paymentAction/reject.do', params);
};
