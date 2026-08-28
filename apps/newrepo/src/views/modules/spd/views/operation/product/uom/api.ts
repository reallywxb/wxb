import { requestFormClient } from '#/api/request';

async function delUom(data: any) {
  return requestFormClient.post('uomAction/delete.do', data, {
    responseReturn: 'body',
  });
}

async function saveUom(data: any) {
  return requestFormClient.post('uomAction/save.do', data, {
    responseReturn: 'body',
  });
}
export { delUom, saveUom };
