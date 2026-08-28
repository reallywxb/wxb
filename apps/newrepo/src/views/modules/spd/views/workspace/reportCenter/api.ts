import { requestFormClient } from '#/api/request';

export const getPageUreportConfig = (params: any) => {
  return requestFormClient.post<any>('/ureport/preview', params);
};
