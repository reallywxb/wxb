import { requestClient } from '#/api/request.ts';

export async function createClient(data: any) {
  return requestClient.post('/datatable/data/create/sys.client', data);
}

export async function updateClient(data: any) {
  return requestClient.post('/datatable/data/update/sys.client', data);
}

export async function delClient(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.client', {
    id,
  });
}
