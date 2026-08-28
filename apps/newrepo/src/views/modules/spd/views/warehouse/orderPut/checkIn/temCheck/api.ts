import { requestFormClient } from '#/api/request';

export const TemperatureAsnLine = (params: any) => {
  return requestFormClient.post<any>(
    '/asnAction/TemperatureAsnLine.do',
    params,
  );
};
