import { requestClient } from '#/api/request.ts';

export async function createMessageRoute(data: any) {
  return requestClient.post('/datatable/data/create/edi.messageRoute', data);
}

export async function updateMessageRoute(data: any) {
  return requestClient.post('/datatable/data/update/edi.messageRoute', data);
}

export async function delMessageRoute(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.messageRoute', {
    id,
  });
}
