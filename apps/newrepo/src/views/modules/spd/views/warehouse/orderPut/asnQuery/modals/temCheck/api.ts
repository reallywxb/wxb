import { requestFormClient } from '#/api/request';

export const updatePackage = (params: any) => {
  return requestFormClient.post<any>('/packageAction/updatePackage.do', params);
};
