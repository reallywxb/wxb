import { requestClient } from '#/api/request.ts';

// import request from '../../../utils/flow/request.ts';

/**
 * 抄送给我的
 *
 * @param data
 */
export function queryMineCC(data: any) {
  return requestClient.post(
    '/flow/combination/group/queryCopiedTaskList',
    data,
  );
}

// //  导出流程详情
// export function exportDetail(param: any) {
//   return request({
//     url: `/process-instance/export/${param}`,
//     method: 'post',
//   });
// }

// //  批量导出流程详情
// export function exportBatch(param: any) {
//   return request({
//     url: '/process-instance/exportBatch/',
//     method: 'post',
//     data: param,
//   });
// }

// 结束流程
export function stopProcessInstance(param: any) {
  return requestClient.post(
    `/flow/process-instance/stopProcessInstance/${param}`,
  );
}

// // 查询进行中的任务
// export function queryTaskListInProgress(param: any) {
//   return request({
//     url: `process-instance/queryTaskListInProgress/${param}`,
//     method: 'post',
//   });
// }

// // 催办任务
// export function urgeProcessInstance(param: any) {
//   return request({
//     url: 'process-instance/urgeProcessInstance',
//     method: 'post',
//     data: param,
//   });
// }
