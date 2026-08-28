import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';

async function saveProductOrg(data: any) {
  return requestFormClient.post('productAction/saveProductOrg.do', data, {
    responseReturn: 'body',
  });
}
async function delProductOrg(data: any) {
  return requestFormClient.post('productAction/delProductOrg.do', data, {
    responseReturn: 'body',
  });
}

async function modifyProductOrg(data: any) {
  return requestFormClient.post('productAction/modifyProductOrg.do', data, {
    responseReturn: 'body',
  });
}

async function importProductOrg(
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) {
  return requestFormClient.upload(
    'productAction/importProductOrg.do',
    data,
    config,
  );
}

export { delProductOrg, importProductOrg, modifyProductOrg, saveProductOrg };
