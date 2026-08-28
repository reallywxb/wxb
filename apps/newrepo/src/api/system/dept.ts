import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptList(data: any) {
  return requestClient.post<deptVo>('/datatable/data/page/sys.dept', data);
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(data: Omit<deptDto, 'id'>) {
  return requestClient.post('/datatable/data/create/sys.dept', data);
}

/**
 * 更新部门
 *
 * @param data 部门数据
 */
async function updateDept(data: deptDto) {
  return requestClient.post('/datatable/data/update/sys.dept', data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: string) {
  return requestClient.post('/datatable/data/delete/sys.dept', { id });
}

async function queryDeptTree() {
  return requestClient.get('/sys/dept/tree');
}

export { createDept, deleteDept, getDeptList, queryDeptTree, updateDept };
