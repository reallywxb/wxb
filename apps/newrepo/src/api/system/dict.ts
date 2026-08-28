import { requestClient } from '#/api/request';

export async function updateDict(data: any) {
  return requestClient.post('/datatable/data/update/sys.dict', data);
}

export async function delDict(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.dict', { id });
}

export async function delDictItem(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.dictItem', { id });
}
