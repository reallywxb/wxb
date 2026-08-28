import type {
  QueryCityParams,
  QueryDistrictParams,
  SavePrescriptionStatusParams,
} from './type';

import { requestClient, requestFormClient } from '#/api/request';
// 查询省份
export const queryProvince = () => {
  return requestFormClient.get<any>('/areaAction/getProvinces');
};

// 查询城市
export const queryCity = (params: QueryCityParams) => {
  return requestFormClient.get<any>(
    `/areaAction/getCities?provinceCode=${params.provinceCode}`,
  );
};

// 查询区县
export const queryDistrict = (params: QueryDistrictParams) => {
  return requestFormClient.get<any>(
    `/areaAction/getAreas?cityCode=${params.cityCode}`,
  );
};

// 保存配送信息
export const saveDeliveryInfo = (params: any) => {
  return requestFormClient.post<any>(
    '/prescriptionAction/saveDeliveryAddress',
    params,
  );
};

// 保存处方状态
export const savePrescriptionStatus = (
  params: SavePrescriptionStatusParams,
) => {
  return requestClient.post<any>('/prescriptionAction/savePreStatus', params);
};
