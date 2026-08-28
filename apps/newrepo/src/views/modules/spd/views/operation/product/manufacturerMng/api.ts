import type { RequestClientConfig } from '@vben/request';

import { requestFormClient } from '#/api/request';

async function saveManufacturer(data: any) {
  return requestFormClient.post(
    'productAction/saveProductManufacturer.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

async function deleteProductManufacturer(data: any) {
  return requestFormClient.post(
    'productAction/deleteProductManufacturer.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

async function importProductManufacturer(
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) {
  return requestFormClient.upload(
    'productAction/importProductManufacturer.do',
    data,
    config,
  );
}

export {
  deleteProductManufacturer,
  importProductManufacturer,
  saveManufacturer,
};
