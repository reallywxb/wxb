import { requestFormClient } from '#/api/request';

export const saveAccount = (params: any) => {
  return requestFormClient.post<any>('/userBaseHandleAction/save.do', params, {
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
            str.push(`${key}=${value || ''}`);
          }
        }
        return str.join('&');
      },
    ],
  });
};

export const putPassword = (params: any) => {
  return requestFormClient.post<any>(
    '/userBaseHandleAction/putPassword.do',
    params,
  );
};

export const changeActiveUser = (params: any) => {
  return requestFormClient.post<any>(
    '/userBaseHandleAction/changeActiveUser.do',
    params,
  );
};

export const addUserWarehosueAccess = (params: any) => {
  return requestFormClient.post<any>(
    '/warehouseAction/addUserWarehosueAccess.do',
    params,
  );
};

export const addUserAllWarehosueAccess = (params: any) => {
  return requestFormClient.post<any>(
    '/warehouseAction/addUserAllWarehosueAccess.do',
    params,
  );
};

export const saveUserWarehosueAccess = (params: any) => {
  return requestFormClient.post<any>(
    '/warehouseAction/saveUserWarehosueAccess.do',
    params,
  );
};

export const getDepTree = (params: any) => {
  return new Promise((resolve, reject) => {
    requestFormClient
      .post<any>('/depHandleAction/queryDepTreeWithUserDefaultPower.do', params)
      .then((res) => {
        resolve([{ ...res.rows, disabled: true }]);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const queryDepTreeWithUserPower = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/queryDepTreeWithUserPower.do',
    params,
  );
};
export const saveBatchDepUserAcess = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/saveBatchDepUserAcess.do',
    params,
  );
};

export const importUser = (params: any) => {
  // AI-GENERATED-BEGIN
  // @date 2026-05-26
  // @prompt 修复文件上传接口调用方式
  // @description 将 post 改为 upload 方法，确保正确处理文件上传请求
  return requestFormClient.upload<any>(
    '/userBaseHandleAction/importUser.do',
    params,
  );
  // AI-GENERATED-END
};

export const batchUpdateUser = (params: any) => {
  return requestFormClient.post<any>(
    '/userBaseHandleAction/batchUpdateUser.do',
    params,
  );
};

export const unbindUser = (params: any) => {
  return requestFormClient.post<any>(
    '/userBaseHandleAction/unbindUser.do',
    params,
  );
};
