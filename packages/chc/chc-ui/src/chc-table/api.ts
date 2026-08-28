import type { RequestClientConfig } from '@vben/request';

import type { GetAllTableDataParams, TableData } from './types';

import { RequestClient } from '@vben/request';

type Records = TableData<any>['records'];
// type TableData<T> = {
//   records: T[];
//   total: number;
// };
type request = InstanceType<typeof RequestClient>;
export function useCrudApis(requestClient: request) {
  /**
   * 获取列表数据
   * @param tabelId tabelId
   * @param data 数据
   */
  function getDataTableList(
    tabelId: string,
    data: any,
    options: RequestClientConfig = {},
  ) {
    const url = tabelId.includes('/')
      ? tabelId
      : `/datatable/data/page/${tabelId}`;
    // dataTableId情况下修改 Content-Type 为 application/json
    return requestClient.post<TableData<any>>(url, data, { ...options });
  }
  const getAllTableData = async (
    tableId: string,
    currentParams: GetAllTableDataParams,
    options: RequestClientConfig = {},
    handleDataFn?: (res: any) => TableData<any>,
    serachParamsFormat?: (params: any) => any,
    beforeFetchFn?: (params: any) => any,
  ) => {
    // const size = currentParams.pageInfo.size;
    const size = 1000;
    const total = currentParams.pageInfo.total;
    const allPageCount =
      total % size === 0 ? total / size : Math.ceil(total / size);
    let allTableData: Records = [];
    for (let i = 1; i <= allPageCount; i++) {
      const current = i;
      let finalParams = {
        ...currentParams.params,
        current,
        size,
      };
      if (serachParamsFormat && typeof serachParamsFormat === 'function') {
        finalParams = serachParamsFormat(finalParams);
      }
      if (beforeFetchFn && typeof beforeFetchFn === 'function') {
        finalParams = beforeFetchFn(finalParams);
      }
      const handleUrl = (tableId: string) => {
        return tableId.includes('?')
          ? `${tableId}&_menuPageAction=export`
          : `${tableId}?_menuPageAction=export`;
      };
      const resMid = await getDataTableList(
        handleUrl(tableId),
        finalParams,
        options,
      );
      const res =
        handleDataFn && typeof handleDataFn === 'function'
          ? handleDataFn(resMid)
          : resMid;
      allTableData = [...allTableData, ...res.records];
    }
    return allTableData;
  };
  /**
   * 创建
   * @param tabelId tabelId
   * @param data 数据
   */
  function createDataTable(
    tabelId: string,
    data: Omit<any, 'id'>,
    options: RequestClientConfig = {},
  ) {
    const url = tabelId.includes('/')
      ? tabelId
      : `/datatable/data/create/${tabelId}`;
    // dataTableId情况下修改 Content-Type 为 application/json
    return requestClient.post(url, data, { ...options });
  }

  /**
   * 更新
   * @param tabelId tabelId
   * @param data 数据
   */
  function updateDataTable(
    tabelId: string,
    data: any,
    options: RequestClientConfig = {},
  ) {
    // 更新方法将接口里的undefined转为空字符串
    for (const key in data) {
      if (data[key] === undefined) {
        data[key] = '';
      }
    }
    const url = tabelId.includes('/')
      ? tabelId
      : `/datatable/data/update/${tabelId}`;
    return requestClient.post(url, data, {
      ...options,
      headers: {
        ...options.headers,
        'REQUEST-SCENE': 'CHCUI', // 添加一个请求场景头部，用于区分 chc公共组件内部接口调用 和 项目内接口调用
      },
    });
  }

  /**
   * 删除
   * @param tabelId tabelId
   * @param params
   */
  function deleteDataTable(
    tabelId: string,
    params: { [key: string]: any },
    options: RequestClientConfig = {},
  ) {
    const url = tabelId.includes('/')
      ? tabelId
      : `/datatable/data/delete/${tabelId}`;
    return requestClient.post(url, params, { ...options });
  }

  /**
   * 获取表格列设置信息
   * @param tableId 表格的dataTableId
   * @param type
   * @param obj 表格配置信息
   * @param options
   */
  function saveDataTableColumnConfig(
    tableId: string,
    type: string,
    obj: any,
    options: RequestClientConfig = {},
  ) {
    return requestClient.post(
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
  function queryDataTableColumnConfig(
    tableId: string,
    type: string,
    options: RequestClientConfig = {},
  ) {
    return requestClient.get(
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
  function queryDataTableLog(
    tabelId: string,
    data: queryLogData,
    params: queryLogParams,
  ) {
    const url = tabelId.includes('/')
      ? tabelId
      : `/datatable/data/queryLog/${tabelId}`;
    return requestClient.post(url, data, {
      params: params.preview === true ? params : {},
    });
  }

  /**
   * 执行处理
   * @param tabelId 业务模型ID
   * @param actionId 动作ID
   * @param params 参数
   * @param preview 是否预览模式
   */
  function doProcess(
    tabelId: string,
    actionId: string,
    params: { [key: string]: any },
    preview: boolean = false,
    options: RequestClientConfig = {},
  ) {
    params = params || {};
    if (preview) params.preview = preview ? true : '';
    return requestClient.post(
      `/datatable/data/process/${tabelId}/${actionId}`,
      params,
      { ...options },
    );
  }

  /**
   * 下载文件
   * @param dataTableId 业务模型ID
   * @param actionId 动作ID
   * @param params 参数
   * @param preview 是否预览模式
   * @param options
   */
  function doDownload(
    dataTableId: string,
    actionId: string,
    params: { [key: string]: any },
    preview: boolean = false,
    options: RequestClientConfig = {},
  ) {
    params = params || {};
    if (preview) params.preview = preview ? true : '';
    return requestClient.post<Blob>(
      `/datatable/data/download/${dataTableId}/${actionId}`,
      params,
      {
        responseReturn: 'body',
        responseType: 'blob',
        ...options,
      },
    );
  }

  /**
   * 上传文件
   * @param dataTableId 业务模型ID
   * @param actionId 动作ID
   * @param params 参数
   * @param preview 是否预览模式
   * @param options
   */
  function doUpload(
    dataTableId: string,
    actionId: string,
    params: { [key: string]: any },
    preview: boolean = false,
    options: RequestClientConfig = {},
  ) {
    params = params || {};
    if (preview) params.preview = preview ? true : '';
    return requestClient.post<Blob>(
      `/datatable/data/upload/${dataTableId}/${actionId}`,
      params,
      { ...options },
    );
  }

  return {
    createDataTable,
    deleteDataTable,
    getDataTableList,
    queryDataTableColumnConfig,
    queryDataTableLog,
    saveDataTableColumnConfig,
    updateDataTable,
    getAllTableData,
    doProcess,
    doDownload,
    doUpload,
  };
}
