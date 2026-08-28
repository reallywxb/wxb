import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/surgicalProductAction/save.do', params);
};

export const deleteDo = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalProductAction/deleteLines.do',
    params,
  );
};
