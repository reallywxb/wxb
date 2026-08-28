import { requestFormClient } from '#/api/request';

export const scanDo = (params: any) => {
  return requestFormClient.post<any>('/surgicalPackageAction/query.do', params);
};

export const packageApply = (params: any) => {
  return requestFormClient.post<any>(
    '/surgicalPackageAction/packageApply.do',
    params,
    {
      transformRequest: [
        (data) => {
          const str = [];
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
