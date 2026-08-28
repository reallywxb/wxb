import { requestFormClient } from '#/api/request';

// 变更记录
export function saveBatchProduct(data: any) {
  return requestFormClient.post('/productAction/queryProductApplyLog', data, {
    responseReturn: 'body',
  });
}
