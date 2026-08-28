import { requestFormClient } from '#/api/request';

export const urgeOrderDo = (params: any) => {
  return requestFormClient.post<any>('/orderAction/urgeOrder.do', params);
};
export const closeLineDo = (params: any) => {
  return requestFormClient.post<any>('/orderAction/closeLine.do', params);
};
