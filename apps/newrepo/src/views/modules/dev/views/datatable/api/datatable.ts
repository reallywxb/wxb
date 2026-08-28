import { requestClient } from '#/api/request.ts';

export async function refreshDataTable(params: any) {
  return requestClient.get('/datatable/refresh', {
    params,
  });
}

export async function genCodeBySql(dataTableId: string, data: any) {
  return requestClient.post(`/datatable/genCodeBySql/${dataTableId}`, data);
}

export async function genCodeByDataTable(dataTableId: string, data: any) {
  return requestClient.post(`/datatable/genCode/${dataTableId}?preview=true`, {
    ...data,
    dataTableId,
  });
}

// 预览数据-新增
export async function createTableData(dataTableId: string, data: any) {
  return requestClient.post(
    `/datatable/data/create/${dataTableId}?preview=true`,
    data,
  );
}

// 预览数据-编辑
export async function updateTableData(dataTableId: string, data: any) {
  return requestClient.post(
    `/datatable/data/update/${dataTableId}?preview=true`,
    data,
  );
}

export async function delTableData(dataTableId: string, id: any) {
  return requestClient.post(
    `/datatable/data/delete/${dataTableId}?preview=true`,
    { id },
  );
}

export async function downloadCode(
  dataTableId: string,
  data: any,
  config: any,
) {
  return requestClient.post<Blob>(
    `/datatable/downloadCode/${dataTableId}?preview=true`,
    data,
    config,
  );
}
