import { requestClient } from '#/api/request.ts';

export async function createTenant(data: any) {
  return requestClient.post('/datatable/data/create/sys.tenant', data);
}

export async function updateTenant(data: any) {
  return requestClient.post('/datatable/data/update/sys.tenant', data);
}

export async function delTenant(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.tenant', { id });
}
