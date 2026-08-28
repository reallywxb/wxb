import { requestClient } from '#/api/request.ts';

export async function createPrinter(data: any) {
  return requestClient.post('/datatable/data/create/rp.printer', data);
}

export async function updatePrinter(data: any) {
  return requestClient.post('/datatable/data/update/rp.printer', data);
}

export async function delPrinter(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.printer', {
    id,
  });
}
