import { requestFormClient } from '#/api/request';

// 获取集采批次
export const getVBPAnalysis = () => {
  return requestFormClient.post<any>('vbpAnalysisAction/queryAnalysis.do');
};

// 查询科室执行分析
export const getDeptExecuteDetails = (params: {
  vbpBatchId: string | number;
  departmentId?: string;
  parentId?: string;
  start?: number;
  limit?: number;
}) => {
  return requestFormClient.get<any>('vbpAnalysisAction/queryDeptAnalysis', {
    params,
  });
};

// 查询科室月度执行分析
export const getDeptMonthlyAnalysis = (params: {
  vbpBatchId: string | number;
  departmentId?: string;
  parentId?: string;
  start?: number;
  limit?: number;
}) => {
  return requestFormClient.get<any>(
    'vbpAnalysisAction/queryDeptMonthlyAnalysis',
    { params },
  );
};
