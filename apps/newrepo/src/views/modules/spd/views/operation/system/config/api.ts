import { requestFormClient } from '#/api/request';

export const saveDo = (params: any) => {
  return requestFormClient.post<any>(
    '/orgSettingAction/saveLocalServer.do',
    params,
  );
};

export const getLocalServer = () => {
  return requestFormClient.post<any>('/orgSettingAction/queryLocalServer.do');
};
