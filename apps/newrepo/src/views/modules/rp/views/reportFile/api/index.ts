import { requestClient } from '#/api/request.ts';

export async function createReportFile(data: any) {
  return requestClient.post('/datatable/data/create/rp.reportFile', data);
}

export async function updateReportFile(data: any) {
  return requestClient.post('/datatable/data/update/rp.reportFile', data);
}

export async function delReportFile(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.reportFile', {
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
