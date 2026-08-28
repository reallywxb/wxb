import { requestFormClient } from '#/api/request';

async function getQueryStorageTotal(data: any) {
  return requestFormClient.post(
    'datatable/data/process/wms.storage/queryStorageTotal',
    data,
    {
      responseReturn: 'body',
    },
  );
}

async function getDictRouteData(data: any) {
  return requestFormClient.get(`/datatable/getDict/test`, data);
}
// async function getDictRouteData(data: any, route: any) {
//   return requestFormClient.get(`/datatable/getDict/${route}`, data);
// }

export { getDictRouteData, getQueryStorageTotal };
