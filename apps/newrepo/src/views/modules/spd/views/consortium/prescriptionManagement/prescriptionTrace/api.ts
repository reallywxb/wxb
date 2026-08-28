import { requestFormClient } from '#/api/request';

/**
 * 查询处方追溯详情
 * @param prescriptionNo 处方号
 */
export const queryPrescriptionTraceDetailApi = (prescriptionId: string) => {
  return requestFormClient.get(
    `/prescriptionAction/trace/${prescriptionId}/detail`,
  );
};
