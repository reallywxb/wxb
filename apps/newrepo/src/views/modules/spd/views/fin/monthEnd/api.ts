import { requestFormClient } from '#/api/request';

// 批准
export const getNextPeriod = (params: any) => {
  return requestFormClient.post<any>(
    'finMonthEndAction/getNextPeriod.do',
    params,
  );
};

// 创建月结
export const createMonthEnd = (params: any) => {
  return requestFormClient.post<any>(
    '/finMonthEndAction/createMonthEnd.do',
    params,
  );
};

// 创建月结审批
export const commitMonthEnd = (params: any) => {
  return requestFormClient.post<any>('/finMonthEndAction/commit.do', params);
};

// 撤回
export const revokeMonthEnd = (params: any) => {
  return requestFormClient.post<any>('/finMonthEndAction/revoke.do', params);
  // return requestFormClient.post<any>('/invoiceAction/rejectWorkflow.do', params);
};

// 删除
export const delMonthEnd = (params: any) => {
  return requestFormClient.post<any>('/finMonthEndAction/delete.do', params);
};

// 查询进出库数据
export const getInoutAction = (params: any) => {
  return requestFormClient.post<any>('/inoutAction/query.do', params);
};

// 批准进出库数据
export const approveMonthEnd = (params: any) => {
  return requestFormClient.post<any>(
    '/baseHandleAction/approveWorkflow.do',
    params,
  );
};

// 批准进出库数据
export const rejectMonthEnd = (params: any) => {
  return requestFormClient.post<any>(
    '/baseHandleAction/rejectWorkflow.do',
    params,
  );
};

// 出入库记账明细 - 重新记账
// 未记账出入库单 - 记账
export const reaccount = (params: any) => {
  return requestFormClient.post<any>('/finInoutAction/rePost.do', params);
};

// 未记账发票 - 记账
export const reaccountInvoice = (params: any) => {
  return requestFormClient.post<any>('/finInvoiceAction/rePost.do', params);
};

// 调整发票记账日期 - 记账
export const changeDateAcct = (params: any) => {
  return requestFormClient.post<any>('/finInvoiceAction/changeDateAcct.do', params);
};
