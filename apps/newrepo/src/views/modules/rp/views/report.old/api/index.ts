import { requestClient } from '#/api/request.ts';

export async function createReport(data: any) {
  return requestClient.post('/datatable/data/create/rp.report', data);
}

export async function updateReport(data: any) {
  return requestClient.post('/datatable/data/update/rp.report', data);
}

export async function delReport(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.report', { id });
}

export async function previewReport(params: any) {
  return requestClient.get('/report/getParameterOption', {
    params,
  });
}

export async function createReportSetting(data: any) {
  return requestClient.post('/datatable/data/create/rp.reportSetting', data);
}

export async function updateReportSetting(data: any) {
  return requestClient.post('/datatable/data/update/rp.reportSetting', data);
}

export async function delReportSetting(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.reportSetting', { id });
}

export async function createReportPrinter(data: any) {
  return requestClient.post('/datatable/data/create/rp.reportPrinter', data);
}

export async function updateReportPrinter(data: any) {
  return requestClient.post('/datatable/data/update/rp.reportPrinter', data);
}

export async function delReportPrinter(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.reportPrinter', { id });
}

export async function createReportOrg(data: any) {
  return requestClient.post('/datatable/data/create/rp.reportOrg', data);
}

export async function updateReportOrg(data: any) {
  return requestClient.post('/datatable/data/update/rp.reportOrg', data);
}

export async function delReportOrg(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.reportOrg', { id });
}

export async function createReportRole(data: any) {
  return requestClient.post('/datatable/data/create/rp.reportRole', data);
}

export async function updateReportRole(data: any) {
  return requestClient.post('/datatable/data/update/rp.reportRole', data);
}

export async function delReportRole(id: number | string) {
  return requestClient.post('/datatable/data/delete/rp.reportRole', { id });
}
