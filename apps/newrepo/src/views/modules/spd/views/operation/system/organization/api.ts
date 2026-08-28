import { requestClient, requestFormClient } from '#/api/request';

export const openAccount = (params: any) => {
  return requestFormClient.post<any>(
    '/openAccountAction/openAccount.do',
    params,
    {
      transformRequest: [
        () => {
          const str = [];
          // 为了和老系统传参保持一样的值，如果不这样写值为 ''的变量会被过滤掉
          for (const [key, value] of Object.entries(params)) {
            if (Array.isArray(value)) {
              value.forEach((item) => {
                str.push(`${key}=${item}`);
              });
            } else {
              str.push(`${key}=${value}`);
            }
          }
          return str.join('&');
        },
      ],
    },
  );
};

export const activeOrg = (params: any) => {
  return requestFormClient.post<any>('/openAccountAction/activeOrg.do', params);
};

export const saveOrg = (params: any) => {
  return requestFormClient.post<any>('/openAccountAction/saveOrg.do', params);
};

export const saveOrgSetting = (id: number | string, data: any) => {
  return requestClient.put(`/sys/org/${id}/settingValues`, data);
};

export const queryOrgSetting = (id: number | string) => {
  return requestClient.get(`/sys/org/${id}/settingValues`);
};

export const queryOpenAccountFields = () => {
  return requestClient.get('/sys/org/settingGroupList');
};

export const getRefEntID = (params: any) => {
  return requestFormClient.post<any>(
    '/openAccountAction/getRefEntID.do',
    params,
  );
};
