import { requestClient } from '#/api/request.ts';

/**
 * 创建流程
 *
 * @param data
 */
export function addFlow(data: any) {
  return requestClient.post('/flow/process/create', data);
}

/**
 * 获取流程详细信息
 *
 * @param flowId
 */
export function getFlowDetail(flowId: string) {
  return requestClient.get(`/flow/process/getDetail?flowId=${flowId}`);
}

/**
 * 停用流程
 *
 * @param flowId
 * @param groupId
 */
export function disableFlow(flowId: string, groupId: string) {
  return requestClient.put(
    `/flow/process/update/${flowId}?type=stop&groupId=${groupId}`,
  );
}

/**
 * 根据流程唯一标识查询流程列表
 *
 * @param uniqueId
 */
export function getListByUniqueId(uniqueId: string) {
  return requestClient.get(`/flow/process/getListByUniqueId/${uniqueId}`);
}
/**
 * 设置主流程
 *
 * @param flowId
 */
export function setMainProcess(flowId: string) {
  return requestClient.post(`/flow/process/setMainProcess/${flowId}`);
}

/**
 * 删除流程
 *
 * @param flowId
 * @param groupId
 */
// export function deleteFlow(flowId: string, groupId: string) {
//   return requestClient.put(
//     `/flow/process/update/${flowId}?type=delete&groupId=${groupId}`,
//   );
// }

/**
 * 启用流程
 *
 * @param flowId
 * @param groupId
 */
export function enableFlow(flowId: string, groupId: string) {
  return requestClient.put(
    `/flow/process/update/${flowId}?type=using&groupId=${groupId}`,
  );
}

/**
 * 发起流程
 *
 * @param data
 */
export function startFlow(data: any) {
  return requestClient.post(
    '/flow/process-instance/startProcessInstance',
    data,
  );
}
