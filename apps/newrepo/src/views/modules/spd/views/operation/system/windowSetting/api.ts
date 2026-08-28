import { requestClient } from '#/api/request';

export const updateStatusApi = (params: any) => {
  return requestClient.post<any>('/windowAction/updateStatus', params);
};

export const saveWindowAction = (data: any) => {
  return requestClient.post<any>('/windowAction/save', data);
};

export const delWindowAction = (windowId: number | string) => {
  return requestClient.post<any>('/windowAction/delete', {
    windowId,
  });
};
