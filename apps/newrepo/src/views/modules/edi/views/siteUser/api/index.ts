import { requestClient } from '#/api/request.ts';

export async function createSiteUser(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteUser', data);
}

export async function updateSiteUser(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteUser', data);
}

export async function delSiteUser(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteUser', { id });
}

export async function createSiteUserMap(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteUserMap', data);
}

export async function updateSiteUserMap(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteUserMap', data);
}

export async function delSiteUserMap(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteUserMap', { id });
}
