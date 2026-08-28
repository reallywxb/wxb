import { requestFormClient } from '#/api/request';

// 是否开启
export const updateWorkflowAction = (
  params: any,
  type: 'custom' | 'normal',
) => {
  const url =
    type === 'custom' ? 'activeCustomWorkflow.do' : 'activeWorkflow.do';
  return requestFormClient.post<any>(`/workflowAction/${url}`, params);
};

// 是否有效
export const checkActiveNode = (params: {
  AD_WF_Node_ID: number | string;
  IsActive: 'N' | 'Y';
}) => {
  return requestFormClient.post<any>('/workflowAction/activeNode.do', params);
};

// 保存自定义工作流
export const saveCustomWorkflow = (params: any) => {
  return requestFormClient.post<any>(
    '/workflowAction/saveCustomWorkflow.do',
    params,
  );
};

// 开启工作流
export const openWorkflow = (params: any, url: string) => {
  return requestFormClient.post<any>(`/workflowAction/${url}`, params);
};

// 审批节点-新增
export const addApprovalNode = (params: any) => {
  return requestFormClient.post<any>(
    '/workflowAction/addApprovalNode.do',
    params,
  );
};

// 审批节点-查询节点审核人列表
export const queryNodeChecker = (params: {
  AD_WF_Responsible_ID?: number | string;
}) => {
  return requestFormClient.post<any>(
    '/workflowAction/queryNodeChecker.do',
    params,
  );
};

// 审批节点- 新建和编辑保存
export const saveWorkFlow = (params: any) => {
  return requestFormClient.post<any>('/workflowAction/saveWorkFlow.do', params);
};

// 审批节点-调整节点顺序
export const changeNodeSeq = (params: any) => {
  return requestFormClient.post<any>('workflowAction/changeNodeSeq.do', params);
};

// 审批节点-删除
export const deleteNode = (params: any) => {
  return requestFormClient.post<any>('/workflowAction/deleteNode.do', params);
};

export interface WorkflowParentRow {
  AD_Workflow_ID: number;
  IsActive: 'N' | 'Y';
  Name: string;
  Type: 'custom' | 'normal';
  Value: string;
  isOpen: 'N' | 'Y';
  warehousePolicyId: number;
  workflowExtendId: number;
  workflowName: string;
}

export interface NodeCheckerItem {
  check: 'N' | 'Y';
  title: string;
  value: number;
}

export interface WorkflowNodeRow {
  AD_Client_ID: number;
  AD_Column_ID: number;
  AD_Column_Name: string;
  AD_Form_ID: number;
  AD_Org_ID: number;
  AD_Process_ID: number;
  AD_Task_ID: number;
  AD_WF_Next_Name: string;
  AD_WF_Node_ID: number;
  AD_WF_Responsible_ID: number;
  AD_WF_Responsible_Name: string;
  AD_WF_Responsible_RoleName: string;
  AD_Window_ID: number;
  AD_Workflow_ID: number;
  Action: string;
  ActionName: string;
  Cost: string;
  Created: string;
  CreatedBy: string;
  Duration: string;
  DurationLimit: string;
  EntityType: string;
  IsActive: 'N' | 'Y';
  IsCentrallyMaintained: 'N' | 'Y';
  IsSameTransaction: 'N' | 'Y';
  JoinElement: string;
  JoinElementName: string;
  Name: string;
  NodeChecker: string;
  NodeCheckerName: string;
  Priority: string;
  SplitElement: string;
  SplitElementName: string;
  UUID: string;
  Updated: string;
  UpdatedBy: string;
  Value: string;
  WaitTime: string;
  WaitingTime: string;
  Workflow_ID: number;
  WorkingTime: string;
  XPosition: string;
  YPosition: string;
  lev: number;
  _X_ROW_KEY: string;
}
