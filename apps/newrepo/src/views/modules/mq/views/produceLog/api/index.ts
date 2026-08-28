import { requestClient } from '#/api/request.ts';

export async function createProduceLog(data: any) {
  return requestClient.post('/datatable/data/create/mq.produceLog', data);
}

export async function updateProduceLog(data: any) {
  return requestClient.post('/datatable/data/update/mq.produceLog', data);
}

export async function delProduceLog(id: number | string) {
  return requestClient.post('/datatable/data/delete/mq.produceLog', {
    id,
  });
}

export async function getContent(id: number | string) {
  return requestClient.post(
    '/datatable/data/process/mq.produceLog/getContent',
    {
      id,
    },
  );
}

export async function updateContent(data: any) {
  return requestClient.post(
    '/datatable/data/process/mq.produceLog/updateContent',
    data,
  );
}
