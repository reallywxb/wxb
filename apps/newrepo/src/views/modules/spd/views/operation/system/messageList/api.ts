import { requestFormClient } from '#/api/request';

export const readTips = (params: any) => {
  return requestFormClient.post<any>('/userTipsAction/readTips.do', params);
};
