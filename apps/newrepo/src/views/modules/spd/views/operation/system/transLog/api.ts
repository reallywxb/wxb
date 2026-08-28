import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/transLogAction/save.do', params);
};

export const processDo = (params: any) => {
  return requestFormClient.post<any>('/transLogAction/process.do', params);
};
