import { requestClient } from '#/api/request.ts';

export async function createRole(data: any) {
  return requestClient.post('/datatable/data/create/sys.role', data);
}

export async function updateRole(data: any) {
  return requestClient.post('/datatable/data/update/sys.role', data);
}
export async function delRole(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.role', { id });
}

export async function getMenuAuthTree(id: number | string) {
  return requestClient.get(`/sys/role/menuAuthTree/${id}`);
}

export async function saveMenuAuthTree(id: number | string, data: Array<any>) {
  return requestClient.post(`/sys/role/saveMenuAuth/${id}`, data);
}
