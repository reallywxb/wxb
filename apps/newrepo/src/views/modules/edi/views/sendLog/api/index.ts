import { requestClient } from '#/api/request.ts';

export async function createSendLog(data: any) {
  return requestClient.post('/datatable/data/create/edi.sendLog', data);
}

export async function updateSendLog(data: any) {
  return requestClient.post('/datatable/data/update/edi.sendLog', data);
}

export async function delSendLog(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.sendLog', {
    id,
  });
}
