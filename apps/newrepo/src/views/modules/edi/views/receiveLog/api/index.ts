import { requestClient } from '#/api/request.ts';

export async function createReceiveLog(data: any) {
  return requestClient.post('/datatable/data/create/edi.receiveLog', data);
}

export async function updateReceiveLog(data: any) {
  return requestClient.post('/datatable/data/update/edi.receiveLog', data);
}

export async function delReceiveLog(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.receiveLog', {
    id,
  });
}
