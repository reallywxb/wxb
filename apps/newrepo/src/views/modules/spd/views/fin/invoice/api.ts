import { requestFormClient } from '#/api/request';

// 主表
export const modifyInovince = (params: any) => {
  return requestFormClient.post<any>('/invoiceAction/modifyInvoice.do', params);
};

export const modifyInovinceNo = (params: any) => {
  return requestFormClient.post<any>(
    '/invoiceAction/modifyInvoiceNo.do',
    params,
  );
};

// 提交
export const submitInvoice = (params: any) => {
  return requestFormClient.post<any>(
    '/invoiceAction/confirmInvoice.do',
    params,
  );
};

// 作废
export const invalidatInvoice = (params: any) => {
  return requestFormClient.post<any>('/invoiceAction/cancelInvoice.do', params);
};

// 批准
export const approveWorkflow = (params: any) => {
  return requestFormClient.post<any>(
    '/invoiceAction/approveWorkflow.do',
    params,
  );
};

// 拒绝
export const rejectWorkflow = (params: any) => {
  return requestFormClient.post<any>(
    '/invoiceAction/rejectWorkflow.do',
    params,
  );
};

/*
 * 子表
 */
// 调整结算价
export const modifyInvoiceLineNo = (params: any) => {
  return requestFormClient.post<any>(
    '/invoiceAction/modifyInvoiceLineNo.do',
    params,
  );
};

// 合并发票
export const mergeInvoice = (params: any) => {
  return requestFormClient.post<any>(
    '/invoiceAction/mergeInvoiceNo.do',
    params,
  );
};
