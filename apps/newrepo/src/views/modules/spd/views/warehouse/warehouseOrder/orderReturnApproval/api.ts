import { requestFormClient } from '#/api/request';

export const approveWorkflow = (params: any) => {
  return requestFormClient.post<any>('/orderAction/approveWorkflow.do', params);
};

export const rejectWorkflow = (params: any) => {
  return requestFormClient.post<any>('/orderAction/rejectWorkflow.do', params);
};
