import { requestFormClient } from '#/api/request';

async function modifyProductFee(data: any) {
  return requestFormClient.post('productAction/modifyProductFee.do', data, {
    responseReturn: 'body',
  });
}
// productAction/queryProductFee.do

async function saveProductFee(data: any) {
  return requestFormClient.post('productAction/saveProductFee.do', data, {
    responseReturn: 'body',
  });
}

export { modifyProductFee, saveProductFee };
