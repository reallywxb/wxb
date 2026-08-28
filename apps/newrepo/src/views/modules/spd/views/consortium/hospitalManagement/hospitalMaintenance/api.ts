import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';

// 新增编辑保存
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/hospitalAction/save.do', params);
};

export const savehospitalLogo = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload('/hospitalAction/save.do', data, config);
};

export const activeServer = (params: any) => {
  return requestFormClient.post<any>('/serverAction/activeServer.do', params);
};

// 保存医院配置
export const saveHospitalSetting = (params: any) => {
  return requestFormClient.post<any>('/hospitalSettingAction/save', params);
};
// 查询医院配置
export const queryHospitalSetting = (params: any) => {
  return requestFormClient.get<any>(`/hospitalSettingAction/query/${params}`);
};
