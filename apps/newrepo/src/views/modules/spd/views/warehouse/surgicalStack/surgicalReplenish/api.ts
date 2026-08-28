import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalTypeAction/saveReplenish.do',
    params,
  );
};

export const deleteDo = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalTypeAction/deleteReplenish.do',
    params,
  );
};
