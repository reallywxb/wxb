import { requestClient } from '#/api/request.ts';

export async function createNoticeTemplate(data: any) {
  return requestClient.post('/datatable/data/create/edi.noticeTemplate', data);
}

export async function updateNoticeTemplate(data: any) {
  return requestClient.post('/datatable/data/update/edi.noticeTemplate', data);
}

export async function delNoticeTemplate(id: number | string) {
  return requestClient.post('/datatable/data/delete/edi.noticeTemplate', {
    id,
  });
}
