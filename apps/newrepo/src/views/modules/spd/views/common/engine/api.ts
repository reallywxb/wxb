import { requestFormClient } from '#/api/request';

export const getPageConfig = (params: any) => {
  return requestFormClient.post<any>('/baseHandleAction/pageConfig.do', params);
};
