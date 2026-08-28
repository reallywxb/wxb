import type { AxiosPromise } from 'axios';

import { requestClient } from '#/api/request.ts';

/**
 * 获取表单详细数据
 */

export function getFormDetail(data: any): AxiosPromise {
  return requestClient.post('/flow/form/getFormDetail', data);
}

/**
 * 获取动态表单
 */

export function dynamicFormList(data: any): AxiosPromise {
  return requestClient.post('/flow/form/dynamicFormList', data);
}

/**
 * 获取表单选项
 */

export function selectOptions(data: any): AxiosPromise {
  return requestClient.post('/flow/form/selectOptions', data);
}
