import { requestFormClient } from '#/api/request';

// 批量审核
export const receiveAsnLineBatch = (params: any) => {
  return requestFormClient.post<any>(
    '/asnAction/receiveAsnLineBatch.do',
    params,
  );
};
// 批量作废
export const rePutawayLine = (params: any) => {
  return requestFormClient.post<any>('/asnAction/rePutawayLine.do', params);
};
