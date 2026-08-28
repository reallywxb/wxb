import type { AxiosPromise } from 'axios';

import type { DeptQuery, DeptVO } from './types.ts';

import { requestClient } from '#/api/request.ts';
/**
 * 部门树形表格
 *
 * @param params
 */
export function listDepts(params?: DeptQuery): AxiosPromise<DeptVO[]> {
  return requestClient.get('/flow/dept/treeAll', { params });
}

/**
 * 选择成员搜索用户
 */
export function orgTreeSearcheUser(params: object): AxiosPromise<[]> {
  return requestClient.get('/flow/dept/tree/user/search', { params });
}

/**
 * 部门下拉列表
 */
export function orgTree(type: string, deptId: number): AxiosPromise<[]> {
  return requestClient.get('/flow/dept/tree', { params: { type, deptId } });
}

/**
 * 获取部门详情
 *
 * @param id
 */
// export function getDeptForm(id: number): AxiosPromise<DeptForm> {
//   return requestClient.get(`/api/v1/dept/${id}/form`);
// }

/**
 * 新增部门
 *
 * @param data
 */
// export function addDept(data: DeptForm) {
//   return requestClient.post('/dept/create', data);
// }

/**
 *  修改部门
 *
 * @param id
 * @param data
 */
// export function updateDept(id: number, data: DeptForm) {
//   return requestClient.put('dept/update', data);
// }

/**
 * 删除部门
 *
 * @param ids
 */
// export function deleteDept(ids: string) {
//   return requestClient.delete('/dept/delete', { id: ids });
// }
