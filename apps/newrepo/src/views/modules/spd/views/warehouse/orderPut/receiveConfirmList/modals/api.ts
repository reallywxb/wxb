import { requestFormClient } from '#/api/request';

export const queryUser = (params: any) => {
  return requestFormClient.post<any>(
    '/movementWorkerHandleAction/query.do',
    params,
  );
};
export const doASNReg = (params: any) => {
  return requestFormClient.post<any>('/asnAction/doASNReg.do', params);
};
export const receiveAsn = (params: any) => {
  return requestFormClient.post<any>('/asnAction/receiveAsn.do', params);
};
export const rePutawayLine = (params: any) => {
  return requestFormClient.post<any>('/asnAction/rePutawayLine.do', params);
};
