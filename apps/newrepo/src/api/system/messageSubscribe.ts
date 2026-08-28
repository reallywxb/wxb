import { requestClient } from '#/api/request';

export async function createMessageSubscribe(data: any) {
  return requestClient.post(
    '/datatable/data/create/sys.messageSubscribe',
    data,
  );
}
export async function updateMessageSubscribe(data: any) {
  return requestClient.post(
    '/datatable/data/update/sys.messageSubscribe',
    data,
  );
}

export async function delMessageSubscribe(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.messageSubscribe', {
    id,
  });
}
