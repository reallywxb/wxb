import { requestClient } from '#/api/request.ts';

export async function createSite(data: any) {
  return requestClient.post('/datatable/data/create/edi.site', data);
}

export async function updateSite(data: any) {
  return requestClient.post('/datatable/data/update/edi.site', data);
}

export async function delSite(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.site', { id });
}

export async function createSiteCorp(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteCorp', data);
}

export async function updateSiteCorp(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteCorp', data);
}

export async function delSiteCorp(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteCorp', { id });
}

export async function createSiteOrg(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteOrg', data);
}

export async function updateSiteOrg(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteOrg', data);
}

export async function delSiteOrg(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteOrg', { id });
}

export async function createSiteWarehouse(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteWarehouse', data);
}

export async function updateSiteWarehouse(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteWarehouse', data);
}

export async function delSiteWarehouse(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteWarehouse', { id });
}

export async function createSiteUser(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteUser', data);
}

export async function updateSiteUser(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteUser', data);
}

export async function delSiteUser(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteUser', { id });
}

export async function createSiteApp(data: any) {
  return requestClient.post('/datatable/data/create/edi.siteApp', data);
}

export async function updateSiteApp(data: any) {
  return requestClient.post('/datatable/data/update/edi.siteApp', data);
}

export async function delSiteApp(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.siteApp', { id });
}
