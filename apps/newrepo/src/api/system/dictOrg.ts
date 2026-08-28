import { requestClient } from '#/api/request';

export async function batchDeleteDictItemOrg(ids: Array<number | string>) {
  return requestClient.post(
    '/datatable/data/process/sys.dictItemOrg/batchDelete',
    { ids },
  );
}
export async function copyDict(data: any) {
  return requestClient.post(
    '/datatable/data/process/sys.dictItemOrg/copyDict',
    data,
  );
}

export async function createDictItemOrg(data: any) {
  return requestClient.post('/datatable/data/create/sys.dictItemOrg', data);
}

export async function updateDictItemOrg(data: any) {
  return requestClient.post('/datatable/data/update/sys.dictItemOrg', data);
}

export async function delDictItemOrg(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.dictItemOrg', { id });
}
