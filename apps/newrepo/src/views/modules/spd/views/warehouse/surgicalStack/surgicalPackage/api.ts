import { requestFormClient } from '#/api/request';

export const createPacakgeBySurgical = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalPackageAction/createPacakgeBySurgical.do',
    params,
  );
};

export const revertDo = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalPackageAction/revertPacakgeBySurgical.do',
    params,
  );
};
