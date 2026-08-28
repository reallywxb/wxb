import { requestFormClient } from '#/api/request';

// 获取集采批次
export const getVBPAnalysis = () => {
  return requestFormClient.post<any>('vbpAnalysisAction/queryAnalysis.do');
};
// 查询药品执行明细
export const getDrugExecuteDetails = (params: any) => {
  return requestFormClient.get<any>('vbpAnalysisAction/queryProductDetail', {
    params: params,
  });
};
// 查询药品采购执行明细
export const getPoProductDetail = (params: any) => {
  return requestFormClient.get<any>('vbpAnalysisAction/queryPoProductDetail', {
    params: params,
  });
};
// 查询中标/非中标对比分析
export const getComparisonAnalysis = (params: any) => {
  return requestFormClient.get<any>('vbpAnalysisAction/queryMidSelectCompare', {
    params: params,
  });
};
// 查询科室执行分析
export const getDeptExecuteDetails = () => {
  return requestFormClient.get<any>('vbpAnalysisAction/queryDeptAnalysis');
};
// 导出-药品执行明细/药品采购执行明细
export const exportVBPAnalysis = (type: string, vbpBatchId?: any) => {
  return requestFormClient.get<any>('vbpAnalysisAction/exportQuery', {
    params: { type, vbpBatchId },
    responseType: 'blob',
  });
};
