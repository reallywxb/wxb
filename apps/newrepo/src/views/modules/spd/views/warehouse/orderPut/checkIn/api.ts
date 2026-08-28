import { requestFormClient } from '#/api/request';

// 批量审核
export const batchCheck = (params: any) => {
  return requestFormClient.post<any>('/asnAction/batchCheck.do', params);
};
// 批量作废
export const rePutawayLine = (params: any) => {
  return requestFormClient.post<any>('/asnAction/rePutawayLine.do', params);
};
// 拒收原因
export const rejectLine = (params: any) => {
  return requestFormClient.post<any>('/asnAction/rejectLine.do', params);
};
// 包装拒收
export const rejectPackage = (params: any) => {
  return requestFormClient.post<any>('/asnAction/rejectPackage.do', params);
};

// 验收
export const changeLot = (params: any) => {
  return requestFormClient.post<any>('/asnAction/checkLine.do', params);
};
// 第二人密码
export const checkPassword = (params: any) => {
  return requestFormClient.post<any>(
    '/userBaseHandleAction/checkPassword.do',
    params,
  );
};
