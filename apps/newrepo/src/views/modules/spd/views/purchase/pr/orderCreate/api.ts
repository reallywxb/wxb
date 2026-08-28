import { requestFormClient } from '#/api/request';

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 生成采退订单改造，拆分列表页和编辑页
// @description 定义生成采退订单相关的接口方法
/**
 * 提交采退订单
 * @param params 订单参数
 * @returns Promise
 */
export const commitOrder = (params: Record<string, any>) => {
  return requestFormClient.post(
    '/orderReturnAction/commitDirectPrOrder',
    params,
  );
};

/**
 * 删除订单
 * @param params 删除参数
 * @returns Promise
 */
export const deleteOrder = (params: Record<string, any>) => {
  return requestFormClient.post('/orderAction/delete.do', params);
};
// AI-GENERATED-END

/**
 * 明细页删除行
 * @param params 删除参数
 * @returns Promise
 */
export const deleteLine = (params: Record<string, any>) => {
  return requestFormClient.post(
    '/orderAction/deleteLine_direct?orderId',
    params,
  );
};

/**
 * 明细的提交
 * @param params 提交参数
 * @returns Promise
 */
export const detailCommit = (params: Record<string, any>) => {
  return requestFormClient.post(
    '/orderReturnAction/commitDirectPrOrder',
    params,
  );
};

/**
 * 行保存
 * @param params 保存参数
 * @returns Promise
 */
export const modifyLine = (params: { orderId: string; lineData: string }) => {
  return requestFormClient.post(
    '/orderReturnAction/modifyDirectPrOrderLine',
    params,
  );
};

// 添加接口
/**
 * 添加订单行
 * @param params 添加参数
 * @returns Promise
 */
export const addLine = (params: Record<string, any>) => {
  return requestFormClient.post(
    '/orderReturnAction/createDirectPrOrder',
    params,
  );
};
