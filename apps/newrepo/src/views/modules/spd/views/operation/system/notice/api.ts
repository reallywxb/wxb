import { requestFormClient } from '#/api/request';

export const saveNotice = (params: any) => {
  return requestFormClient.post<any>(
    '/noticeHandleAction/saveNotice.do',
    params,
  );
};
export const deleteDo = (params: any) => {
  return requestFormClient.post<any>('/noticeHandleAction/delete.do', params);
};
