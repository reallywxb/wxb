import { requestFormClient } from '#/api/request';

export const approveWorkflow = (params: any) => {
  return requestFormClient.post<any>('/orderReturnAction/complete.do', params);
};

export const rejectWorkflow = (params: any) => {
  return requestFormClient.post<any>('/orderReturnAction/reject.do', params);
};
