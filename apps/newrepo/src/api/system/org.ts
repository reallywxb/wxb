import { requestClient } from '#/api/request';

export async function createOrg(data: any) {
  return requestClient.post('/datatable/data/create/sys.org', data);
}

export async function updateOrg(data: any) {
  return requestClient.post('/datatable/data/update/sys.org', data);
}

export async function delOrg(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.org', { id });
}

/* 重建树层级*/
export async function rebuildHierachy() {
  return requestClient.put('/sys/org/rebuildHierachy');
}

/* 重建搜索码*/
export async function rebuildValue() {
  return requestClient.put('/sys/org/rebuildValue');
}

export async function getSettingValues(id: string) {
  return requestClient.get(`/sys/org/${id}/settingValues`);
}

export async function setSettingValues(id: string, data: any) {
  return requestClient.put(`/sys/org/${id}/settingValues`, data);
}

export async function queryOrgTree() {
  return requestClient.get('/sys/org/tree');
}
