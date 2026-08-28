import { requestFormClient } from '#/api/request';

async function modifyVendorProductControl(data: any) {
  return requestFormClient.post(
    'vendorAction/modifyVendorProductControl.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

async function delVendorProductControl(data: any) {
  return requestFormClient.post(
    'vendorAction/delVendorProductControl.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

async function saveVendorProductControl(data: any) {
  return requestFormClient.post(
    'vendorAction/saveVendorProductControl.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

export {
  delVendorProductControl,
  modifyVendorProductControl,
  saveVendorProductControl,
};
