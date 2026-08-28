import { requestFormClient } from '#/api/request';

export const saveMessage = (params: any) => {
  return requestFormClient.post<any>(
    '/ediMessageHandleAction/saveMessage.do',
    params,
  );
};

export const importMessage = (params: any) => {
  return requestFormClient.post<any>(
    '/ediMessageHandleAction/importMessage.do',
    params,
  );
};

export const batchImportMessage = (params: any) => {
  return requestFormClient.post<any>(
    '/ediMessageHandleAction/batchImportMessage.do',
    params,
  );
};

export const revertMessage = (params: any) => {
  return requestFormClient.post<any>(
    '/ediMessageHandleAction/revertMessage.do',
    params,
  );
};
