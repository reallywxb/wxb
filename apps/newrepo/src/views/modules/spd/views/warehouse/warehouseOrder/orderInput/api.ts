import { requestFormClient } from '#/api/request';

export const getOrderPlanStorage = (params: any) => {
  return requestFormClient.post<any>('/orderAction/queryStorage.do', params);
};

export const queryOrderLineInfo = (params: any) => {
  return requestFormClient.post<any>(
    '/orderAction/queryLineNew.do?page=woInput&specShowType=from',
    params,
  );
};

export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/orderAction/save.do', params);
};

export const saveLine = (params: any) => {
  return requestFormClient.post<any>('/orderAction/saveLineKs', params);
};

export const invalidateCancel = (params: any) => {
  return requestFormClient.post<any>('/orderAction/delete.do', params);
};

export const dataCommit = (params: any) => {
  return requestFormClient.post<any>('/orderAction/commit.do', params);
};

export const getTryMoApplyData = (params: any) => {
  return requestFormClient.post<any>(
    '/autoPlanAction/getTryMoApplyData.do?isMaxMinLevelReplenish=Y',
    params,
  );
};

export const createMoPlan = (params: any) => {
  return requestFormClient.post<any>('/autoPlanAction/createMoPlan.do', params);
};

export const getWarehousePolicyByWarehouse = (params: any) => {
  return requestFormClient.post<any>(
    '/warehouseAction/getWarehousePolicyByWarehouse',
    params,
  );
};
