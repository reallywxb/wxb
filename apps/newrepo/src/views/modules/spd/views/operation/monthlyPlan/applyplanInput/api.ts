import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';

// interface ApplyPlanActionResponse {
//   rows: {
//     [key: string]: any;
//     applyPlanDate: string;
//     applyPlanId: number;
//     applyPlanMonth: string;
//     applyPlanNo: string;
//     approveTime: string;
//     bpartnerId: number;
//     bpartnerName: string;
//     commitTime: string;
//     created: string;
//     createdByName: string;
//     dateApplied: string;
//     docStatus: string;
//     docStatusName: string;
//     productControlLevel: string;
//     productControlLevelName: string;
//     toWarehouseId: string;
//     toWarehouseName: string;
//     warehouseId: number;
//     warehouseName: string;
//   }[];
//   success: boolean;
//   msg: string;
// }

// 导入
export const importApplyPlan = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload(
    '/applyPlanAction/importApplyPlan.do',
    data,
    config,
  );
};

// 复制
export const copyApplyPlan = (params: any) => {
  return requestFormClient.post<any>(
    '/applyPlanAction/copyApplyPlan.do',
    params,
  );
};

// 子表接口
export const queryOrderPlanLineInfo = (params: any) => {
  return requestFormClient.post<any>(
    '/applyPlanAction/queryLine.do?page=input',
    params,
  );
};

export const saveLine = (params: any) => {
  return requestFormClient.post<any>('/applyPlanAction/save.do', params);
  // return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/applyPlanAction/save.do', params);
};

// 弹框内部提交
export const commitApplyPlan = (params: any) => {
  return requestFormClient.post<any>('/applyPlanAction/save.do', params);
};
export const deleteApplyPlan = (params: any) => {
  return requestFormClient.post<any>('/applyPlanAction/delete.do', params);
};
export const dataCommit = (params: any) => {
  return requestFormClient.post<any>('/applyPlanAction/commit.do', params);
};
