import { requestClient, requestFormClient } from '#/api/request';

// 查询阳采通用名列表
export const queryGenericNameList = (params: any) =>
  requestClient.post('/ygcgProductNameAction/query.do', params);

// 新增阳采通用名
export const saveGenericNameAction = (params: any) =>
  requestClient.post('/ygcgProductNameAction/save', params);
// 编辑阳采通用名
export const updateGenericNameAction = (params: any) =>
  requestClient.post('/ygcgProductNameAction/update', params);

// 删除阳采通用名
export const deleteGenericNameAction = (params: { ids: string }) =>
  requestFormClient.post('/ygcgProductNameAction/batchDelete', params);
