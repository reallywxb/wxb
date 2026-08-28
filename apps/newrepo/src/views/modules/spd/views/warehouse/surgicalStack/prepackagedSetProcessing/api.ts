import { requestFormClient } from '#/api/request';

export const createPacakgeBySurgical = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalPackageAction/createPacakgeByReplenish.do',
    params,
  );
};

export const revertDo = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalPackageAction/revertPacakge.do',
    params,
  );
};
