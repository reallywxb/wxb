// 批量审核
import { requestFormClient } from '#/api/request';

// 批量发放
export const approveWork = (params: any) => {
  return requestFormClient.post<any>('/prescriptionAction/confirm.do', params);
};
// 批量取消
export const rejectWork = (params: any) => {
  return requestFormClient.post<any>('/prescriptionAction/cancle.do', params);
};
