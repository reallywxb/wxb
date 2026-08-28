import { requestClient } from '#/api/request';
import type { RequestClientConfig } from '@vben/request';
/**
 * 获取表格列设置信息
 * @param pageId 页面ID
 * @param gridId 表格ID
 * @param obj 表格配置信息
 * @param options
 */
export function saveDataTableColumnConfig(
  pageId: string,
  gridId: string,
  obj: any,
  options: RequestClientConfig = {},
) {
  return requestClient.post(
    `/datatable/setting/save?pageId=${encodeURIComponent(pageId)}&gridId=${gridId}`,
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
 * @param pageId 页面ID
 * @param gridId 表格ID
 * @param options
 */
export function queryDataTableColumnConfig(
  pageId: string,
  gridId: string,
  options: RequestClientConfig = {},
) {
  return requestClient.get(
    `/datatable/setting/query?pageId=${encodeURIComponent(pageId)}&gridId=${gridId}`,
    {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json', // 此接口接口调用方式写死用json
      },
    },
  );
}
