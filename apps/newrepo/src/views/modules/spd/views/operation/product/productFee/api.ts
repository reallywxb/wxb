import { requestFormClient } from '#/api/request';

async function deleteFee(data: any) {
  return requestFormClient.post('productAction/deleteFee.do', data, {
    responseReturn: 'body',
  });
}

async function saveFee(data: any) {
  return requestFormClient.post('productAction/saveFee.do', data, {
    responseReturn: 'body',
  });
}
export { deleteFee, saveFee };
