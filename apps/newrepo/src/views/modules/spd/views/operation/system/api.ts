import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';

// 获取树结构
export const getDepartmentTree = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/queryDepTreeConstruct.do',
    params,
  );
};

// 获取树结构
export const getDepartmentTreeWithPermission = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/queryDepTreeWithUserPower.do',
    params,
  );
};

// 保存新权限
export const saveUserDepartmentPermission = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/saveBatchDepUserAcess.do',
    params,
  );
};

// 保存新权限
export const moveUserDepartmentPermission = (params?: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/moveDepartment.do',
    params,
  );
};

// 导入部门
export const importDepartmentData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestFormClient.upload(
    '/depHandleAction/importDepartment.do',
    data,
    { ...config, timeout: 10 * 60 * 1000 },
  );
};

// 获取列表
export const getDepartmentList = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/departmentList.do',
    params,
  );
};

// 保存部门信息
export const saveDepartment = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/saveDepartment.do',
    params,
  );
};

// 查询部门
export const queryDepartment = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/queryDepartment.do',
    params,
  );
};

// 新增部门
// 修改部门信息
export const modifyDepartment = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/saveDepartment.do',
    params,
  );
};

// 删除用户信息
export const delDepartment = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/delDepartment.do',
    params,
  );
};

// 修改用户信息
export const saveDepartmentUser = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/saveDepartmentUser.do',
    params,
  );
};

// 修改用户信息
export const modifyDepartmentUser = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/saveDepartmentUser.do',
    params,
  );
};

// 删除用户信息
export const delDepartmentUser = (params: any) => {
  return requestFormClient.post<any>(
    '/depHandleAction/delDepartmentUser.do',
    params,
  );
};

/* 手术室管理 */

// 新增编辑手术室
export const saveSurgicalRoom = (params: any) => {
  return requestFormClient.post<any>('/surgicalRoomAction/save.do', params);
};

// 删除手术室
export const delSurgicalRoom = (params: any) => {
  return requestFormClient.post<any>('/surgicalRoomAction/delete.do', params);
};

/* 转运工人 */

// 新增编辑转运工人
export const saveMovementWorker = (params: any) => {
  return requestFormClient.post<any>(
    '/movementWorkerHandleAction/saveMovementWorker.do',
    params,
  );
};

// 删除转运工人
export const delMovementWorker = (params: any) => {
  return requestFormClient.post<any>(
    '/movementWorkerHandleAction/delete.do',
    params,
  );
};
