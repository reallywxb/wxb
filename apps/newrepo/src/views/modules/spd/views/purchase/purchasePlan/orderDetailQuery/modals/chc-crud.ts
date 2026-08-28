import { requestFormClient } from '#/api/request';

export async function getCrudInfoApi() {
  return requestFormClient.get('/user/info');
}

async function getDataTableList(tabelId: string, data: any) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/page/${tabelId}`;
  return requestFormClient.post<TableData<any>>(url, data);
}

async function createDataTable(tabelId: string, data: Omit<any, 'id'>) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/create/${tabelId}`;
  return requestFormClient.post(url, data);
}

async function updateDataTable(tabelId: string, data: any) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/update/${tabelId}`;
  return requestFormClient.post(url, data);
}

async function deleteDataTable(tabelId: string, id: string) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/delete/${tabelId}`;
  return requestFormClient.post(url, { id });
}

async function saveDataTableColumnConfig(
  tabelId: string,
  type: string,
  obj: any,
) {
  return requestFormClient.post(
    `/datatable/setting/save?pageId=${encodeURIComponent(tabelId)}&gridId=${type}`,
    obj,
  );
}

async function queryDataTableColumnConfig(tabelId: string, type: string) {
  return requestFormClient.get(
    `/datatable/setting/query?pageId=${encodeURIComponent(tabelId)}&gridId=${type}`,
  );
}

async function queryDataTableLog(
  tabelId: string,
  data: { dateFrom: string; dateTo: string; keyValues: any; size: number; sort: string[]; start: number },
  params: { preview: boolean },
) {
  const url = `/datatable/data/queryLog/${tabelId}`;
  return requestFormClient.post(url, data, {
    params: params.preview === true ? params : {},
  });
}

export {
  createDataTable,
  deleteDataTable,
  getDataTableList,
  queryDataTableColumnConfig,
  queryDataTableLog,
  saveDataTableColumnConfig,
  updateDataTable,
};
