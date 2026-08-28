import { requestClient, requestFormClient } from '#/api/request';

// 保存
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/mcOrgAction/save.do', params);
};

//  /mcOrgAction/{organId}/organSetting
export const getSetting = (organId: string) => {
  return requestFormClient.get<any>(`/mcOrgAction/${organId}/organSetting`);
};

//  /mcOrgAction/{organId}/organSetting
export const saveSetting = (params: any) => {
  return requestClient.post<any>(`/mcOrgAction/organSetting`, params);
};
