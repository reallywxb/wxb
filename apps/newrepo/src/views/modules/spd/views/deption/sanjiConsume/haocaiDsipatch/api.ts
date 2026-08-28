import { requestFormClient } from '#/api/request';

export const getDept = (params: any) => {
  return requestFormClient.post<any>('/userBaseHandleAction/query.do', params);
};
// 包装号查询API
export const getDataApi = (params: any) => {
  return requestFormClient.post<any>('/packageAction/query.do', params);
};
