import { requestFormClient } from '#/api/request';

export const queryDeptStock = (params: any) => {
  return requestFormClient.post<any>(
    '/dashboardAction/queryDeptStock.do',
    params,
  );
};

export const queryDeptConsAnalysis = (params: any) => {
  return requestFormClient.post<any>(
    '/dashboardAction/queryDeptConsAnalysis.do',
    params,
  );
};

export const queryDeptReqAnalysis = () => {
  return requestFormClient.post<any>(
    '/dashboardAction/queryDeptReqAnalysis.do',
  );
};

export const queryDeptStockStatus = (params: any) => {
  return requestFormClient.post<any>(
    '/dashboardAction/queryDeptStockStatus.do',
    params,
  );
};

export const queryReqProgress = (params: any) => {
  return requestFormClient.post<any>(
    '/dashboardAction/queryReqProgress.do',
    params,
  );
};
