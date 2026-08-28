import { requestFormClient } from '#/api/request';

export const saveScheduler = (params: any) => {
  return requestFormClient.post<any>(
    '/schedulerHandleAction/saveScheduler.do',
    params,
  );
};

export const executeScheduler = (params: any) => {
  return requestFormClient.post<any>(
    '/schedulerHandleAction/executeScheduler.do',
    params,
  );
};
