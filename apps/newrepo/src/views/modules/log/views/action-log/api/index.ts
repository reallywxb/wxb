import { requestClient } from '#/api/request.ts';

export async function createActionLog(data: any) {
  return requestClient.post('/datatable/data/create/log.actionLog', data);
}

export async function updateActionLog(data: any) {
  return requestClient.post('/datatable/data/update/log.actionLog', data);
}

export async function delActionLog(id: number | string) {
  return requestClient.post('/datatable/data/delete/log.actionLog', {
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
