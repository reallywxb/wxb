import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/serverAction/save.do', params);
};

export const activeServer = (params: any) => {
  return requestFormClient.post<any>('/serverAction/activeServer.do', params);
};
