import { requestClient } from '#/api/request.ts';

export async function createErrorLog(data: any) {
  return requestClient.post('/datatable/data/create/log.errorLog', data);
}

export async function updateErrorLog(data: any) {
  return requestClient.post('/datatable/data/update/log.errorLog', data);
}

export async function delErrorLog(id: number | string) {
  return requestClient.post('/datatable/data/delete/log.errorLog', {
    id,
  });
}

export async function getFileUrl(id: number | string) {
  return requestClient.post(
    '/datatable/data/process/rp.reportFile/getFileUrl',
    {
      id,
    },
  );
}
