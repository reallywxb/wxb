import { requestClient } from '#/api/request.ts';

export async function createMessageIn(data: any) {
  return requestClient.post('/datatable/data/create/edi.messageIn', data);
}

export async function updateMessageIn(data: any) {
  return requestClient.post('/datatable/data/update/edi.messageIn', data);
}

export async function delMessageIn(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.messageIn', {
    id,
  });
}

export async function getMessageInBody(data: any) {
  return requestClient.post('/datatable/data/page/edi.messageInBody', data);
}

export async function createMessageInBody(data: any) {
  return requestClient.post('/datatable/data/create/edi.messageInBody', data);
}
export async function updateMessageInBody(data: any) {
  return requestClient.post('/datatable/data/update/edi.messageInBody', data);
}
