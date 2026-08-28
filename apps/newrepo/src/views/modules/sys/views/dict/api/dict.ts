import { requestClient } from '#/api/request.ts';

export async function createDict(data: any) {
  return requestClient.post('/datatable/data/create/sys.dict', data);
}

export async function updateDict(data: any) {
  return requestClient.post('/datatable/data/update/sys.dict', data);
}

export async function delDict(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.dict', { id });
}

export async function createDictItem(data: any) {
  return requestClient.post('/datatable/data/create/sys.dictItem', data);
}

export async function updateDictItem(data: any) {
  return requestClient.post('/datatable/data/update/sys.dictItem', data);
}

export async function delDictItem(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.dictItem', { id });
}
