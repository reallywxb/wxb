import { requestFormClient } from '#/api/request';

// 获取二级院区列表
export const getCampusTreeData = () => {
  return requestFormClient.post<any>('/baseHandleAction/warehouse.do');
};

// 新增/修改
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/campusAction/save.do', params);
};
