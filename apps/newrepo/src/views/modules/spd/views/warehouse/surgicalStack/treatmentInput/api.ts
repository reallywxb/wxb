import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/treatmentAction/save.do', params);
};
