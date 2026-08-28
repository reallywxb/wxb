import { requestClient } from '#/api/request.ts';

export async function createSiteWarehouse(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteWarehouse', data);
}

export async function updateSiteWarehouse(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteWarehouse', data);
}

export async function delSiteWarehouse(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteWarehouse', { id });
}
