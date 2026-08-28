import { requestFormClient } from '#/api/request';

export const approveWorkflow = (params: any) => {
  return requestFormClient.post<any>('/applyPlanAction/complete.do', params);
};

export const rejectWorkflow = (params: any) => {
  return requestFormClient.post<any>('/applyPlanAction/reject.do', params);
};
