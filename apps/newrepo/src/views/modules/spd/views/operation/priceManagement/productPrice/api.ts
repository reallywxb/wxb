import { requestFormClient } from '#/api/request';

export const productPriceAdjust = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/productPriceAdjust.do',
    params,
  );
};
