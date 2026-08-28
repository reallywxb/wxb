import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/productCareAction/save.do', params);
};

export const deleteDo = (params: any) => {
  return requestFormClient.post<any>('/productCareAction/delete.do', params);
};

export const commitDo = (params: any) => {
  return requestFormClient.post<any>('/productCareAction/commit.do', params);
};

export const deleteLineDo = (params: any) => {
  return requestFormClient.post<any>(
    '/productCareAction/deleteLine.do',
    params,
  );
};
