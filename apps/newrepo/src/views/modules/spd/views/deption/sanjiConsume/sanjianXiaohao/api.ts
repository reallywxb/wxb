import { requestFormClient } from '#/api/request';

export const directConusme = (params: any) => {
  return requestFormClient.post<any>('/orderAction/directConusme.do', params);
};
