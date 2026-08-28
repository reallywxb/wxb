import { requestClient } from '#/api/request.ts';

/**
 * 获取用户机构
 */
export async function fetchOrgAuthTree(userId: string) {
  return requestClient.get('/sys/user/orgAuthTree', { params: { userId } });
}

/**
 * 创建部门
 * @param data 部门数据
 */
export async function createDept(data: Omit<deptDto, 'id'>) {
  return requestClient.post('/datatable/data/create/sys.dept', data);
}

/**
 * 更新部门
 *
 * @param data 部门数据
 */
export async function updateDept(data: deptDto) {
  return requestClient.post('/datatable/data/update/sys.dept', data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
export async function deleteDept(id: string) {
  return requestClient.post('/datatable/data/delete/sys.dept', { id });
}

export async function resetPwd(id: string, data: any) {
  return requestClient.post(`sys/user/resetPwd/${id}`, data);
}

export async function getDeptTree() {
  return requestClient.get(`/prod-api/system/user/deptTree`);
}

export async function createUser(data: any) {
  return requestClient.post('/datatable/data/create/sys.user', data);
}

export async function updateUser(data: any) {
  return requestClient.post('/datatable/data/update/sys.user', data);
}

export async function delUser(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.user', { id });
}

export async function createUserRole(data: any) {
  return requestClient.post('/datatable/data/create/sys.userRole', data);
}

export async function updateUserRole(data: any) {
  return requestClient.post('/datatable/data/update/sys.userRole', data);
}
export async function delUserRole(id: number | string) {
  return requestClient.post('datatable/data/delete/sys.userRole', { id });
}
