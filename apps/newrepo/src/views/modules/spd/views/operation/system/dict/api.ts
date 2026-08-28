import { requestClient, requestFormClient } from '#/api/request';

export const saveLine = (params: any) => {
  return requestFormClient.post<any>('/dictHandleAction/saveLine.do', params);
};

export const deleteLine = (params: any) => {
  return requestFormClient.post<any>('/dictHandleAction/deleteLine.do', params);
};

export const queryDict = (data: any) => {
  return requestClient.post<any>('/datatable/data/page/sys.dict', data);
};
