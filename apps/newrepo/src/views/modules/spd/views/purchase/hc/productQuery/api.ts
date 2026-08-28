import { requestFormClient } from '#/api/request';

export const queryProductTraceCodeApi = (params: any) => {
  return requestFormClient.post<any>('/traceCode/productQuery.do', params);
};

export const queryTraceCodeDetailApi = (param:string) => {
  return requestFormClient.get(`/asnAction/tracCode/detail/${param}`)
}
