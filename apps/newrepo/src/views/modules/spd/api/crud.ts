import { requestFormClient } from '#/api/request';

interface DictData {
  code: number | string;
  label: string;
  value: string;
}
/**
 * 获取用户信息
 */
export async function getCrudInfoApi() {
  return requestFormClient.get<DictData>('/user/info');
}

/**
 * 获取列表数据
 * @param tabelId tabelId
 * @param data 数据
 */
async function getDataTableList(tabelId: string, data: any) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/page/${tabelId}`;
  return requestFormClient.post<TableData<any>>(url, data);
}

/**
 * 创建
 * @param tabelId tabelId
 * @param data 数据
 */
async function createDataTable(tabelId: string, data: Omit<any, 'id'>) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/create/${tabelId}`;
  return requestFormClient.post(url, data);
}

/**
 * 更新
 * @param tabelId tabelId
 * @param data 数据
 */
async function updateDataTable(tabelId: string, data: any) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/update/${tabelId}`;
  return requestFormClient.post(url, data);
}

/**
 * 删除
 * @param tabelId tabelId
 * @param id ID
 */
async function deleteDataTable(tabelId: string, id: string) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/delete/${tabelId}`;
  return requestFormClient.post(url, { id });
}

/**
 * 获取表格列设置信息
 * @param pageId 表格的dataTableId
 * @param obj 表格配置信息
 */
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

/**
 * 获取表格列设置信息
 * @param pageId 表格的dataTableId
 * @param obj 表格配置信息
 */
async function queryDataTableColumnConfig(tabelId: string, type: string) {
  return requestFormClient.get(
    `/datatable/setting/query?pageId=${encodeURIComponent(tabelId)}&gridId=${type}`,
  );
}
/**
 * 获取日志信息
 * @param tabelId tabelId
 * @param data 数据
 */
type queryLogData = {
  dateFrom: string;
  dateTo: string;
  keyValues: any;
  size: number;
  sort: string[];
  start: number;
};
type queryLogParams = {
  preview: boolean;
};
async function queryDataTableLog(
  tabelId: string,
  data: queryLogData,
  params: queryLogParams,
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
