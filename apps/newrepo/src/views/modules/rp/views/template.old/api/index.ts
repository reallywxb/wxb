import { requestClient } from '#/api/request.ts';

export async function createTemplate(data: any) {
  return requestClient.post('/datatable/data/create/rp.template', data);
}

export async function updateTemplate(data: any) {
  return requestClient.post('/datatable/data/update/rp.template', data);
}

export async function delTemplate(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.template', {
    id,
  });
}

export async function getContent(id: number | string) {
  return requestClient.post('/datatable/data/process/rp.template/getContent', {
    id,
  });
}

export async function saveContent(data: any) {
  return requestClient.post(
    '/datatable/data/process/rp.template/saveContent',
    data,
  );
}

export async function downloadContent(id: number | string) {
  return requestClient.download(
    '/datatable/data/download/rp.template/downloadContent',
    {
      data: { id },
    },
  );
}

export async function uploadContent(data: any) {
  return requestClient.post(
    '/datatable/data/upload/rp.template/uploadContent',
    data,
  );
}
