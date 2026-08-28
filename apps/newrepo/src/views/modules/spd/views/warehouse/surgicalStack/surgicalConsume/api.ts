import { requestFormClient } from '#/api/request';

export const packageConsume = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalPackageAction/packageConsume.do',
    params,
  );
};
