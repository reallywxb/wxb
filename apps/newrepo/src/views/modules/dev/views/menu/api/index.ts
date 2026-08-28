import { requestClient } from '#/api/request.ts';

export async function createMenu(data: any) {
  return requestClient.post('/datatable/data/create/sys.menu', data);
}

export async function updateMenu(data: any) {
  return requestClient.post('/datatable/data/update/sys.menu', data);
}

export async function delMenu(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.menu', {
    id,
  });
}

export async function clearCache() {
  return requestClient.post('/datatable/data/process/sys.menu/clearCache');
}

export async function syncMenu() {
  return requestClient.post('/sys/menu/syncMenu');
}
