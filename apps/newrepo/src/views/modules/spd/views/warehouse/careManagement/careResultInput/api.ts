import { requestFormClient } from '#/api/request';

// 整单登记
export const saveBacthProcess = (params: any) => {
  return requestFormClient.post<any>(
    'productCareAction/bacthProcess.do',
    params,
  );
};
// 养护登记
export const saveProcess = (params: any) => {
  return requestFormClient.post<any>('productCareAction/process.do', params);
};
