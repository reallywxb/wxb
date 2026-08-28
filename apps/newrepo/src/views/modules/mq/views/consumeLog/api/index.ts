import { requestClient } from '#/api/request.ts';

export async function createConsumeLog(data: any) {
  return requestClient.post('/datatable/data/create/mq.consumeLog', data);
}

export async function updateConsumeLog(data: any) {
  return requestClient.post('/datatable/data/update/mq.consumeLog', data);
}

export async function delConsumeLog(id: number | string) {
  return requestClient.post('/datatable/data/delete/mq.consumeLog', {
    id,
  });
}

export async function getContent(id: number | string) {
  return requestClient.post(
    '/datatable/data/process/mq.consumeLog/getContent',
    {
      id,
    },
  );
}

export async function updateContent(data: any) {
  return requestClient.post(
    '/datatable/data/process/mq.consumeLog/updateContent',
    data,
  );
}
