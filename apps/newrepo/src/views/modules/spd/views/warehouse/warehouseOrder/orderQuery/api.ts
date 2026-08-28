import { requestFormClient } from '#/api/request';

export const copyPlan = (params: any) => {
  return requestFormClient.post<any>('/orderAction/copyOrder.do', params);
};
