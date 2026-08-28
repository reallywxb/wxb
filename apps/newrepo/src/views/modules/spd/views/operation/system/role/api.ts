import { requestFormClient } from '#/api/request';

export const saveRole = (params: any) => {
  return requestFormClient.post<any>(
    '/accessBaseHandleAction/saveRole.do',
    params,
  );
};

export const getAllMenu = (roleID: string) => {
  return requestFormClient.post<any>(
    `/baseHandleAction/getAllMenu.do?roleID=${roleID}`,
  );
};

export const saveBatchRole = (params: any) => {
  return requestFormClient.post<any>(
    `/accessBaseHandleAction/saveBatchRole.do`,
    params,
  );
};

export const saveRolePCLAccess = (params: any) => {
  return requestFormClient.post<any>(
    `/productControlLevelAction/saveRolePCLAccess.do`,
    params,
    {
      transformRequest: [
        (data) => {
          const str = [];
          // 为了和老系统传参保持一样的值，如果不这样写值为 ''的变量会被过滤掉
          for (const [key, value] of Object.entries(data)) {
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

export const stopRole = (params: any) => {
  return requestFormClient.post<any>(
    `/accessBaseHandleAction/stopRole.do`,
    params,
  );
};
// 查询所有可选报表
export const getReportAuthTree = (params: any) => {
  return requestFormClient.post<any>(
    '/uReportCenterAction/queryAllReportPaths',
    params,
  );
};
// 查询角色已有报表权限
export const queryRoleReports = (params: any) => {
  return requestFormClient.post<any>(
    '/uReportCenterAction/queryRoleReports',
    params,
  );
};
// 保存角色勾选报表权限
export const saveRoleReports = (params: any) => {
  return requestFormClient.post<any>(
    '/uReportCenterAction/saveRoleReports',
    params,
  );
};
