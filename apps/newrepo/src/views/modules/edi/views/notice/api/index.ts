import { requestClient } from '#/api/request.ts';

export async function createNotice(data: any) {
  return requestClient.post('/datatable/data/create/edi.notice', data);
}

export async function updateNotice(data: any) {
  return requestClient.post('/datatable/data/update/edi.notice', data);
}

export async function delNotice(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.notice', {
    id,
  });
}
