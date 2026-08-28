import { requestFormClient } from '#/api/request';

export const directRevertConusme = (params: any) => {
  return requestFormClient.post<any>(
    '/orderAction/directRevertConusme.do',
    params,
  );
};
