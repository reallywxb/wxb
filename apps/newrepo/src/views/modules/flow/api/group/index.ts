import type { AxiosPromise } from 'axios';

import type { Group, GroupVO } from './types.ts';

import { requestClient } from '#/api/request.ts';

/**
 * 添加分组
 *
 * @param data
 */
export function addGroup(data: Group) {
  return requestClient.post('/flow/processGroup/create', data);
}
/**
 * 修改分组
 *
 * @param data
 */
export function editGroup(data: Group) {
  return requestClient.post('/flow/processGroup/edit', data);
}
/**
 * 下移排序
 *
 * @param data
 */
export function bottomSort(data: Group) {
  return requestClient.post('/flow/processGroup/bottomSort', data);
}
/**
 * 上移排序
 *
 * @param data
 */
export function topSort(data: Group) {
  return requestClient.post('/flow/processGroup/topSort', data);
}
/**
 * 删除分组
 *
 * @param id
 */
export function delGroup(id: number) {
  return requestClient.delete(`/flow/processGroup/delete/${id}`);
}

/**
 * 查询分组列表
 */

export function queryGroupList(): AxiosPromise<GroupVO[]> {
  return requestClient.get('/flow/processGroup/list');
}

/**
 * 查询分组和流程列表
 */

export function queryGroupFlowList(hidden?: boolean): AxiosPromise<GroupVO[]> {
  return requestClient.get('/flow/combination/group/listGroupWithProcess', {
    params: { hidden },
  });
}

/**
 * 删除主流程
 */

export function deleteProcessMain(uniqueId?: string): AxiosPromise<GroupVO[]> {
  return requestClient.delete(
    `/flow/combination/group/deleteProcessMain/${uniqueId}`,
  );
}

/**
 * 清理流程
 */

export function clearProcess(uniqueId?: string): AxiosPromise<GroupVO[]> {
  return requestClient.delete(`/flow/combination/group/clear/${uniqueId}`);
}

/**
 * 查询分组和流程主表列表
 */

export function queryGroupMainFlowList(): AxiosPromise<GroupVO[]> {
  return requestClient.get('/flow/combination/group/listGroupWithProcessMain');
}
/**
 * 搜索流程
 */

export function searchFlowList(word: any): AxiosPromise<GroupVO[]> {
  return requestClient.get('/flow/combination/group/searchFlowList', {
    params: {
      word,
    },
  });
}

/**
 * 查询我可发起的组和流程
 */

export function queryMineStartGroupFlowList(
  hidden?: boolean,
): AxiosPromise<GroupVO[]> {
  return requestClient.get(
    '/flow/combination/group/listCurrentUserStartGroup',
    {
      params: { hidden },
    },
  );
}
