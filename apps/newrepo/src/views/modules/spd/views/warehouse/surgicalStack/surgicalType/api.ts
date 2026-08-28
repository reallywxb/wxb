import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/surgicalTypeAction/save.do', params);
};

export const deleteDo = (params: any) => {
  return requestFormClient.post<any>('/surgicalTypeAction/delete.do', params);
};
