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
