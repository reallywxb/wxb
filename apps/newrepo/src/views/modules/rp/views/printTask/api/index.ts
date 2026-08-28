import { requestClient } from '#/api/request.ts';

export async function createPrinterTask(data: any) {
  return requestClient.post('/datatable/data/create/rp.printTask', data);
}

export async function updatePrinterTask(data: any) {
  return requestClient.post('/datatable/data/update/rp.printTask', data);
}

export async function delPrinterTask(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.printTask', {
    id,
  });
}

export async function getFileUrl(id: number | string) {
  return requestClient.post('/datatable/data/process/rp.printTask/getFileUrl', {
    id,
  });
}
