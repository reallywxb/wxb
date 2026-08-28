import { requestFormClient } from '#/api/request';
// 保存商品规格
export function saveProductSpec(data: any) {
  return requestFormClient.post('productAction/saveProductSpec.do', data);
}
// 查询规格
export function queryProductSpec(data: any) {
  return requestFormClient.post('/productAction/queryProductSpec.do', data);
}
// 查询采购单位
export function queryProductUnit() {
  return requestFormClient.post('/baseHandleAction/refList.do?id=114');
}
