import { requestFormClient } from '#/api/request';

export const updateProductApply = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/updateProductApply.do',
    params,
  );
};

export const confirmProductApply = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/confirmProductApply.do',
    params,
  );
};
