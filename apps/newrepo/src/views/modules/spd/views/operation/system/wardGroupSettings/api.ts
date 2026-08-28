// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建病区组配置的 API 接口
// @description 定义病区组配置相关的 API 请求方法
import { requestClient } from '#/api/request';

/**
 * 查询病区列表
 * @param params 查询参数 { dictValue: 病区组 dictValue }
 * @returns 病区列表数据
 */
export const queryDeptList = (params: any) => {
  return requestClient.post<any>(
    '/pmsDeptRelationAction/queryDeptList',
    params,
  );
};

/**
 * 查询区域列表
 * @returns 区域列表数据
 */
export const queryAreaList = () => {
  return requestClient.get<any>('/depHandleAction/queryAreaList.do');
};

/**
 * 保存病区组与病区的关联关系
 * @param params 关联参数 { dictValue: 病区组 dictValue, addList: 病区列表 }
 * @returns 保存结果
 */
export const saveDeptRelation = (params: any) => {
  return requestClient.post<any>(
    '/pmsDeptRelationAction/saveDeptRelation',
    params,
    {
      transformRequest: [
        (data) => {
          const res = {
            ...data,
            addList: data.addList || [],
          };
          return JSON.stringify(res);
        },
      ],
    },
  );
};
