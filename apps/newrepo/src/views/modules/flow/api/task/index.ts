import { requestClient } from '#/api/request.ts';

/**
 * 查询待签署合同
 *
 * @param taskId
 */
export function querySignContractInfo(taskId: string) {
  return requestClient.get('/flow/task/querySignContractInfo', {
    params: { taskId },
  });
}

/**
 * 查询待签署合同图片
 *
 * @param data
 */
export function queryContractImg(data: any) {
  return requestClient.post('/flow/task/queryContractImg', data);
}

/**
 * 抄送给我的流程实例
 *
 * @param data
 */
export function queryMineCCInstance(data: any) {
  return requestClient.post(
    '/flow/process-instance/queryMineCCProcessInstance',
    data,
  );
}
/**
 * 查询待办任务
 *
 * @param data
 */
export function queryMineTask(data: any) {
  return requestClient.post('/flow/combination/group/queryTodoTaskList', data);
}

/**
 * 查询我发起的任务
 *
 * @param data
 */
export function queryMineStarted(data: any) {
  return requestClient.post(
    '/flow/combination/group/queryInitiatedTaskList',
    data,
  );
}

/**
 * 查询流程列表
 *
 * @param data
 */
export function queryList(data: any) {
  return requestClient.post('/flow/process-instance/queryList', data);
}
/**
 * 查询流程实例详情
 *
 * @param data
 */
export function queryDetailByProcessInstanceId(data: any) {
  return requestClient.get(
    '/flow/process-instance/queryDetailByProcessInstanceId',
    {
      params: { processInstanceId: data },
    },
  );
}

// 查询当前用户已办任务
export function queryMineEndTask(data: any) {
  return requestClient.post(
    '/flow/combination/group/queryFinishedTaskList',
    data,
  );
}
// 查询当前用户已办任务的流程实例
export function queryMineDoneProcessInstance(data: any) {
  return requestClient.post(
    '/flow/process-instance/queryMineDoneProcessInstance',
    data,
  );
}

// 获取任务信息
export function getTask(taskId: string) {
  return requestClient.get('/flow/task/getTask', { params: { taskId } });
}
/**
 * 查看流程图
 *
 * @param processInstanceId
 */
export function showImage(processInstanceId: string) {
  return requestClient.get(
    `/flow/process-instance/showImg?procInsId=${processInstanceId}`,
  );
}
// 添加评论
export function submitComment(data: any) {
  return requestClient.post('/flow/task/submitComment', data);
}
// 完成任务
export function completeTask(data: any) {
  return requestClient.post('/flow/task/completeTask', data);
}
// 完成签署合同任务
export function completeSignContractTask(data: any) {
  return requestClient.post('/flow/task/completeSignContractTask', data);
}
// 前加签完成任务
export function resolveTask(data: any) {
  return requestClient.post('/flow/task/resolveTask', data);
}
// 后加签
export function backJoinTask(data: any) {
  return requestClient.post('/flow/task/setAssignee', data);
}
// 管理员设置执行人 转交
export function setAssigneeByAdmin(data: any) {
  return requestClient.post('/flow/task/setAssigneeByAdmin', data);
}
// 驳回任务
export function rejectTask(data: any) {
  return requestClient.post('/flow/task/reject', data);
}
// 撤回任务
export function revokeTask(data: any) {
  return requestClient.post('/flow/task/revoke', data);
}
// 前加签任务
export function frontJoinTask(data: any) {
  return requestClient.post('/flow/task/delegateTask', data);
}
// 加签任务
export function addAssigneeTask(data: any) {
  return requestClient.post('/flow/task/addAssignee', data);
}
// 减签任务
export function delAssigneeTask(data: any) {
  return requestClient.post('/flow/task/delAssignee', data);
}
