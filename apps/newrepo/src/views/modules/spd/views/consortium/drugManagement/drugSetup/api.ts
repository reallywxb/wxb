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

// 批量添加产品
export const saveBatchProduct = (params: any) => {
  return requestFormClient.post<any>(
    '/mcProductAction/bindProductToCampus.do',
    params,
  );
};
