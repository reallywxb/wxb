import type { RequestClientConfig } from '@vben/request';

import type { GetAllTableDataParams, TableData } from '../types/crud';

import { getApi } from './request';

type Records = TableData<any>['records'];
function getRequestClient() {
  return getApi();
}
/**
 * 获取列表数据
 * @param tabelId tabelId
 * @param data 数据
 */
export function getDataTableList(tabelId: string, data: any) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/page/${tabelId}`;
  return getRequestClient().post<TableData<any>>(url, data);
}
export const getAllTableData = async (
  tableId: string,
  currentParams: GetAllTableDataParams,
) => {
  const size = currentParams.pageInfo.size;
  const total = currentParams.pageInfo.total;
  const allPageCount =
    total % size === 0 ? total / size : Math.ceil(total / size);
  let allTableData: Records = [];
  for (let i = 1; i <= allPageCount; i++) {
    const current = i;
    const res = await getDataTableList(tableId, {
      ...currentParams.params,
      current,
      size,
    });
    allTableData = [...allTableData, ...res.records];
  }
  return allTableData;
};
/**
 * 创建
 * @param tabelId tabelId
 * @param data 数据
 */
export function createDataTable(tabelId: string, data: Omit<any, 'id'>) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/create/${tabelId}`;
  return getRequestClient().post(url, data);
}

/**
 * 更新
 * @param tabelId tabelId
 * @param data 数据
 */
export function updateDataTable(tabelId: string, data: any) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/update/${tabelId}`;
  return getRequestClient().post(url, data);
}

/**
 * 删除
 * @param tabelId tabelId
 * @param id ID
 */
export function deleteDataTable(tabelId: string, id: string) {
  const url = tabelId.includes('/')
    ? tabelId
    : `/datatable/data/delete/${tabelId}`;
  return getRequestClient().post(url, { id });
}

/**
 * 获取表格列设置信息
 * @param tableId 表格的dataTableId
 * @param type
 * @param obj 表格配置信息
 * @param options
 */
export function saveDataTableColumnConfig(
  tableId: string,
  type: string,
  obj: any,
  options: RequestClientConfig = {},
) {
  return getRequestClient().post(
    `/datatable/setting/save?pageId=${encodeURIComponent(tableId)}&gridId=${type}`,
    obj,
    {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json', // 此接口接口调用方式写死用json
      },
    },
  );
}

/**
 * 获取表格列设置信息
 * @param tableId 表格的dataTableId
 * @param type 表格配置信息
 * @param options
 */
export function queryDataTableColumnConfig(
  tableId: string,
  type: string,
  options: RequestClientConfig = {},
) {
  return getRequestClient().get(
    `/datatable/setting/query?pageId=${encodeURIComponent(tableId)}&gridId=${type}`,
    {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json', // 此接口接口调用方式写死用json
      },
    },
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
export function queryDataTableLog(
  tabelId: string,
  data: queryLogData,
  params: queryLogParams,
) {
  const url = `/datatable/data/queryLog/${tabelId}`;
  return getRequestClient().post(url, data, {
    params: params.preview === true ? params : {},
  });
}
