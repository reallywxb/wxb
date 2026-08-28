import { requestClient } from '#/api/request';

export async function createPos(data: any) {
  return requestClient.post('/datatable/data/create/sys.position', data);
}

export async function updatePos(data: any) {
  return requestClient.post('/datatable/data/update/sys.position', data);
}

export async function delPos(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.position', { id });
}

export async function createPosRole(data: any) {
  return requestClient.post('/datatable/data/create/sys.positionRole', data);
}

export async function updatePosRole(data: any) {
  return requestClient.post('/datatable/data/update/sys.positionRole', data);
}

export async function delPosRole(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.positionRole', { id });
}
