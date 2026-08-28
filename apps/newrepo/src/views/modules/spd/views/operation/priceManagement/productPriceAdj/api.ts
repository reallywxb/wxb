import { requestFormClient } from '#/api/request';

export const queryOrderPlanLineInfo = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/queryProductPriceListAdj.do',
    params,
  );
};

export const saveLine = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/savePriceListAdj.do',
    params,
  );
  // return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};
export const saveDo = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/savePriceListAdj.do',
    params,
  );
};

export const invalidateCancel = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/deletePriceListAdj.do',
    params,
  );
};
export const dataCommit = (params: any) => {
  return requestFormClient.post<any>(
    '/productAction/commitPriceList.do',
    params,
  );
};
