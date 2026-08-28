import { requestFormClient } from '#/api/request';

export const queryVBPInfoApi = (params: any) => {
  return requestFormClient.post<any>('/batchVBPAction/query.do', params);
};
