import { requestClient } from '#/api/request';

export async function createMessage(data: any) {
  return requestClient.post('/datatable/data/create/sys.message', data);
}
export async function updateMessage(data: any) {
  return requestClient.post('/datatable/data/update/sys.message', data);
}
export async function delMessage(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.message', { id });
}

export async function createMessageUser(data: any) {
  return requestClient.post('/datatable/data/create/sys.messageUser', data);
}
export async function updateMessageUser(data: any) {
  return requestClient.post('/datatable/data/update/sys.messageUser', data);
}
export async function delMessageUser(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.messageUser', { id });
}
