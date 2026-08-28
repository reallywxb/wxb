import { requestClient } from '#/api/request.ts';

export async function createRouteConf(data: any) {
  return requestClient.post('/datatable/data/create/sys.routeConf', data);
}

export async function updateRouteConf(data: any) {
  return requestClient.post('/datatable/data/update/sys.routeConf', data);
}

export async function delRouteConf(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.routeConf', {
    id,
  });
}
