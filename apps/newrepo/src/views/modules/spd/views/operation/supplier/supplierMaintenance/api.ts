import type { RequestClientConfig } from '@vben/request';

import { requestClient, requestFormClient } from '#/api/request';

async function delVendor(data: any) {
  return requestFormClient.post('vendorAction/delete.do', data, {
    responseReturn: 'body',
  });
}

async function saveVendor(data: any) {
  return requestFormClient.post('vendorAction/saveVendor.do', data, {
    responseReturn: 'body',
  });
}

async function changeStopVendor(data: any) {
  return requestFormClient.post('vendorAction/changeStopVendor.do', data, {
    responseReturn: 'body',
  });
}

async function approveVendorList(data: any) {
  return requestClient.post('vendorAction/approvedVendorList', data, {
    responseReturn: 'body',
  });
}

async function getRefEntID(data: any) {
  return requestFormClient.post('vendorAction/getRefEntID.do', data, {
    responseReturn: 'body',
  });
}

async function importVendor(
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) {
  return requestFormClient.upload('vendorAction/importVendor.do', data, config);
}

export {
  approveVendorList,
  changeStopVendor,
  delVendor,
  getRefEntID,
  importVendor,
  saveVendor,
};
