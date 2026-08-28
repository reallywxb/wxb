import { requestClient } from '#/api/request.ts';

export async function createMessageOut(data: any) {
  return requestClient.post('/datatable/data/create/edi.messageOut', data);
}

export async function updateMessageOut(data: any) {
  return requestClient.post('/datatable/data/update/edi.messageOut', data);
}

export async function delMessageOut(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.messageOut', {
    id,
  });
}

export async function getMessageOutBody(data: any) {
  return requestClient.post('/datatable/data/page/edi.messageOutBody', data);
}

export async function createMessageOutBody(data: any) {
  return requestClient.post('/datatable/data/create/edi.messageOutBody', data);
}
export async function updateMessageOutBody(data: any) {
  return requestClient.post('/datatable/data/update/edi.messageOutBody', data);
}
